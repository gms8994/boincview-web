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
use XML::LibXML;

my ($ini, @hosts, %hosts);

loadHosts();

set show_errors => 1;
get '/' => sub {

	my %headers = (
		'Project' => 'project',
		'Result' => 'result',
		'Host' => 'node',
		'CPU Time' => 'cpu_time',
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

get '/exit' => sub {
    exit;
};

get '/tasks.json' => sub {
	my %query = request->params('query');

	my @tasks = &fetch_host_activity($query{host});

	content_type 'application/json';
    return to_json \@tasks;
};

get '/hosts.json' => sub {
    loadHosts();
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
            'port' => $ini->{$host_section}{port},
        ));
		next unless $boinc;

		my $result = $boinc->get_simple_gui_info();

		next if ($result eq '');

        my $xp = XML::LibXML->load_xml(string => $result);

		my $nodes = $xp->findnodes(q{//result});

		foreach my $node (@{$nodes}) {
			my %node_work;

			my $project_url = $node->findvalue('project_url');

			$node_work{project} = $xp->findvalue('//project[master_url/text() = "' . $project_url . '"]/project_name');
			$node_work{application} = $host_section;
			$node_work{node} = $host_section;
			$node_work{cpu_time} = 0 + $node->findvalue('active_task/current_cpu_time');
			$node_work{percent_done} = 0 + sprintf('%.02f', $node->findvalue('active_task/fraction_done') * 100);
			$node_work{status} = $node->findvalue('active_task/active_task_state', $node);
			$node_work{to_completion} = 0 + $node->findvalue('estimated_cpu_time_remaining', $node);
			$node_work{result} = $node->findvalue('wu_name', $node);
			$node_work{report_deadline} = $node->findvalue('report_deadline', $node) * 1000; # in ms
			$node_work{completion_at} = 0 + $node_work{to_completion};

			push @results, \%node_work;
		}

		$hosts[$hosts{$host_section}]->{active} = 1;
	}

	return @results;
}

sub loadHosts {
    $ini = Config::Tiny->read("./boinc.ini");

    @hosts = map { { name => $_, active => 1 } } sort keys %{$ini};
    %hosts = ();
    my $index = 0;
    foreach my $host (@hosts) {
        $hosts{$host->{name}} = $index++;
    }
}
