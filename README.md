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

* `#1-` followed by the groupname creates a new group. 
Example:
```
#1-GroupName1
double-click.net/127.0.0.1
example.com/192.168.15.4
#1-GroupName2
test.com/1.1.1.1
```
creates 2 Groups. One named "GroupName1" and one named "GroupName2"


## Backend functions
backend.php offers the following functions:
* `backend.php?c=updatedefinition&url=example.com&ip=1.1.1.1` Creates an entry or updates the IP directed to by the url
	* If IP is left blank, the entry will be deleted (set inactive)
	
	
## MySQL DB Scheme
* `Definitions(url, ip, isactive, groupname)` url is *PK*
* `DNSServers(serverid, localstate, remotestate)` 
	* serverid (eg {"chris", "phil"}) is *PK*
	* localstate is Unix Timestamp of last change the DNS Server has acknowledged
	* remotestate is Unix Timestamp of last change
