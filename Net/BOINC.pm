package Net::BOINC;

use strict;
use warnings;

use Carp;
use Data::Dumper;
use Digest::MD5 qw(md5_hex);
use IO::Socket::INET;

sub new {
	my ($class, %args) = @_;
	my $self = \%args;

	if (! $self->{port}) {
		$self->{port} = 31416;
	}

	$self->{authorized} = 0;

	$self->{socket} = IO::Socket::INET->new(
		PeerAddr => $self->{hostname},
		PeerPort => $self->{port},
		Proto    => "tcp",
		Timeout  => 1,
		# Blocking => 0,
		Type     => SOCK_STREAM)
    or carp "Couldn't connect to " . $self->{hostname} . ":" . $self->{port} . " : $@\n", return 0;
	$self->{socket}->autoflush(1);

	bless $self, $class;
	return $self;
}

sub DESTROY {
	my ($self) = @_;

	close($self->{socket});
}

sub get_state {
	my ($self) = @_;

	$self->_authorize();
	my $result = $self->_rpc("<get_state/>");
	close($self->{socket});
	return $result;
}

sub get_simple_gui_info {
	my ($self) = @_;

	$self->_authorize();
	my $result = $self->_rpc("<get_simple_gui_info/>");
	close($self->{socket});
	return $result;
}

sub _authorize {
	my ($self) = @_;

	my $nonce = $self->_auth_request_one();
	my $result = $self->_auth_request_two($nonce);
	return $result;
}

sub _auth_request_one {
	my ($self) = @_;

	my $result = $self->_rpc("<auth1/>");
	$result =~ s/<\/?nonce>//g;
	my $nonce = $result;

	return $nonce;
}

sub _auth_request_two {
	my ($self, $nonce) = @_;

	my $hash = md5_hex($nonce, $self->{password});
	my $result = $self->_rpc("<auth2><nonce_hash>${hash}</nonce_hash></auth2>");

	($self->{authorized} = 1, return $result) if $result =~ /<authorized/;

	warn "Unauthorized from " . $self->{hostname} . $result;
	return "";
}

sub _rpc {
	my ($self, $string) = @_;

	return "" if ($self->{authorized} == 0 && $string !~ /<auth/);

	$string = "<boinc_gui_rpc_request>" . $string . "</boinc_gui_rpc_request>";
	$string .= "\n\003";

	my $result = $self->{socket}->print($string);

	my $answer = "";
	while (! $self->{socket}->eof) {
		$answer .= $self->{socket}->getc();

		last if ($answer =~ s/\n\003//);
	}

	$answer =~ s|</?boinc_gui_rpc_reply>||g;
	$answer =~ s/^\s*|\s*$//g;

	return $answer if $answer;

	warn "Nothing received from " . $self->{hostname};
	return "";
}

1;
