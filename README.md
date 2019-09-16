# dnssync
Synchronizes DNS Servers and keeps track of their status

## Basic Ideas:
1. Input of DNS definitions via web interface
2. Saves and backups DNS definitions in mysql DB
3. DNS Server fetches current state of definitionen once per second
	* Compares fetched state with local state
	* If more recent state available, fetch the definitions
  * Acknowledgment by sending current local state with every state fetching
	* Also sends its ID, e.g. {"chris" or "phil"}
4. Display the connection state of the DNS server in Interface:
	* Small div Box, mit current definition-ID of Online Server and local DNS Servers, colored: 
		red (online, but *not* up to date)
		gelb (offline)
		gruen (online, and up-to-date)
	* Each for DNS Server of Chris und Phil
	* AJAX in website refreshes the current state of the DNS-servers once per second


## Interface: 
* Large Textarea for input of multiple definitions
* Fixed position upper right corner: State of DNS Servers
* Next to _groupname_: Checkboxes to select whole group, button to edit whole group in textarea
* Group content hideable
* Next to each entry in group: Checkbox to select entry
* Doubleclick Entry -> Edit: Two Inputfields appear for URL and IP, buttons to save or discard


## Example Input for textarea:

New Group: 
#1-GroupName
...
address=/double-click.net/127.0.0.1
address=/example.com/192.168.15.4
...
EOF or new Group
