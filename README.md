# boincview-web
Aim to replicate BOINCView in an open source, perl script utilizing a browser to interact with clients

## Install instructions
```
cpanm -nL . --installdeps .

npm install
npm run dev
```

## Initial setup
Copy the boinc.ini.sample file to boinc.ini, and edit it. This is a standard style INI file, utilizing sections with keys and values to set up BOINC hosts to monitor. Edit the section titles for the hosts that you want to add, and adjust the INI-keys for ip and key to connect to the hosts.

### BOINC Auth Key
These locations assume you installed the BOINC client via the download at http://boinc.berkeley.edu/download.php

* On OSX based machines, it can be found at `/Library/Application Support/BOINC Data/gui_rpc_auth.cfg`
* On Ubuntu (other distros TBD), it can be found at `/var/lib/boinc-client/gui_rpc_auth.cfg`
* Windows location TBD

## Usage instructions
From the terminal, run perl client.pl. You'll see output similar to the following:

```
>> Dancer 1.3202 server 17551 listening on http://0.0.0.0:3000
== Entering the development dance floor ...
```

Now, you can visit http://0.0.0.0:3000 in your browser to see boincview-web in action.

## Dependencies
`boincview-web` uses PerlDancer/Dancer for the HTTP server, Net::BOINC (part of this repository) for communicating with the BOINC hosts, vuejs/vue to make the interface updates seamless and easy, as well as several others. Look at the cpanfile for Perl dependencies, and bower.json for Javascript/CSS dependencies.

## Questions/Comments
Open up an issue. Pull requests welcome, though not guaranteed to be merged. I have a day job, but do my best :)
