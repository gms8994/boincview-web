#!/usr/bin/perl

use File::Basename qw(dirname);
use Cwd  qw(abs_path);
use lib dirname(abs_path $0) . '/lib';
use lib dirname(abs_path $0) . '/lib/perl5';

use strict;
use warnings;

use Config::Tiny;
use Data::Dumper;
use Dancer;
use JSON qw(to_json from_json);
use Net::BOINC;
use Template;
use XML::XPath;

my $ini = Config::Tiny->read("./boinc.ini");

my @hosts = map { { name => $_, active => 1 } } sort keys %{$ini};
my %hosts = ();
my $index = 0;
foreach my $host (@hosts) {
	$hosts{$host->{name}} = $index++;
}

set show_errors => 1;
get '/' => sub {

	my %headers = (
		'Project' => 'project',
		'Result' => 'result',
		'Host' => 'node',
		'CPU Time' => 'cpu_time',
		'Application' => 'application',
		'% done' => 'percent_done',
		'Status' => 'status',
		'To completion' => 'to_completion',
		'Report deadline' => 'report_deadline',
		'Completion at' => 'completion_at',
	);

	my @header_order = (
		'Project',
		'Result',
		'Host',
		'CPU Time',
		'Application',
		'% done',
		'Status',
		'To completion',
		'Report deadline',
		'Completion at',
	);

	template 'home.tt', {
		headers => \%headers,
		header_order => \@header_order,
	};
};

get '/tasks.json' => sub {
	my @tasks = &fetch_host_activity;

	content_type 'application/json';
    return to_json \@tasks;
};

get '/hosts.json' => sub {
	content_type 'application/json';
    return to_json \@hosts;
};
dance;

sub fetch_host_activity {

	my ($host) = @_;
	my @results;

	foreach my $host_section (sort keys %{$ini}) {
		# Skip Config options
		next if $host_section eq 'Config';

		# If a host was provided and we're not on it, skip it
		next if defined $host && $host ne $host_section;

		$hosts[$hosts{$host_section}]->{active} = 0;

		my $boinc = new Net::BOINC((
			'hostname' => $ini->{$host_section}{ip},
			'password' => $ini->{$host_section}{key},
		));
		next unless $boinc;

		my $result = $boinc->get_simple_gui_info();

		next if ($result eq '');

		my $xp = XML::XPath->new(xml => $result);

		my $nodes = $xp->findnodes(q{//result});

		foreach my $node (@{$nodes}) {
			my %node_work;
			$node_work{project} = $host_section;
			$node_work{application} = $host_section;
			$node_work{node} = $host_section;
			$node_work{cpu_time} = $xp->findvalue('active_task/current_cpu_time', $node)->value();
			$node_work{percent_done} = sprintf('%.02f', $xp->findvalue('active_task/fraction_done', $node)->value() * 100);
			$node_work{status} = $xp->findvalue('active_task/active_task_state', $node)->value();
			$node_work{to_completion} = $xp->findvalue('estimated_cpu_time_remaining', $node)->value();
			$node_work{result} = $xp->findvalue('wu_name', $node)->value();
			$node_work{report_deadline} = $xp->findvalue('report_deadline', $node)->value();
			$node_work{completion_at} = $node_work{to_completion};

			push @results, \%node_work;
		}

		$hosts[$hosts{$host_section}]->{active} = 1;
	}

	return @results;
}
