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
		red (online, but **not** up to date)
		yellow (offline)
		green (online, and up-to-date)
	* Each for DNS Server of Chris und Phil
	* AJAX in website refreshes the current state of the DNS-servers once per second
5. User can select which DNS server to synchronize


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
* `backend.php?c=setupdateddefinitions` Recieves a JSONObject from website containing all definitions
* `backend.php?c=getCurrentStates` returns the local state (_timestamp_) and connection state ({"online", "offline"}) of all known DNS-Servers as JSON
* `backend.php?c=getCurrentRemoteState?server=chris?ls=1568710287`
    * Used by local DNSServer to ask the remoteServer for new definitions and tells it the local state
* `backend.php?c=getAllDefinitionsAsJSONForWebsite`
    * Used by Website to display and manage all definitions
    * Called on startup of webapp and whenever `remotestate` > `websitestate`
* `backend.php?c=getConfForDNSServer?server=chris`
    * Used by local DNSServer to download the new definitions
    * Formatted to be directly pasted into `dnsmasq.conf`
    * Contains only the definitions that are flagged as active for the requesting server 
## MySQL DB Scheme
* `Definitions(url, ip, groupname, phil, chris)` 
    * **PK** is (_url_, _groupname_)
    * _phil_ and _chris_ are serverIDs, describing whether the definition is active for this Server or not
* `DNSServers(serverid, localstate, remotestate, lastRequestTime)` 
	* serverid (eg {"chris", "phil"}) is *PK*
	* localstate is Unix Timestamp of last change the DNS Server has acknowledged
	* remotestate is Unix Timestamp of last change
	* lastRequestTime is Unix Timestamp of last request for updates

## SQL commands
* Insert new Definition
    * **Parameters** (URL, IP, Groupname, ServerID)
    * New Definitions are automatically marked active
    * Updates the remotestate in the `DNSServers` table to the current timestamp
    ```
  REPLACE INTO Definitions (URL, IP, GROUPNAME, phil, chris) VALUES ($URL, $IP, $Groupname, 1, 1);
  UPDATE TABLE DNSServers SET REMOTESTATE = UNIX_TIMESTAMP();
  ```
* Get Current States
    * **Parameters** none
    * Returns all known DNS-Servers and their current state
    ```
    SELECT * FROM DNSServers;
    ```
* Get Remote State
    * **Parameters** (ServerID, localstate)
    * Answer to local DNS-Server asking for updates
    * Requires the ServerID to exist in the DB
    ```
    UPDATE TABLE DNSServers SET LOCALSTATE = $localstate, LASTREQTIME = UNIX_TIMESTAMP() WHERE SERVERID = $ServerID;
    SELECT REMOTESTATE FROM DNSServers WHERE SERVERID = $ServerID;
    ```
* Set Definition Active for Server
    * **Parameters** (url, Groupname, ServerID)
    * ServerID must be element of {"chris", "phil"}
    ```
    UPDATE TABLE Definitions SET $ServerID = 1 WHERE URL = $url && GROUPNAME = $GroupName
    ```
* Get all remote Definitions
    * **Parameters** none
    * Used eg by website to make JSON
    ```
    SELECT * FROM Definitions;
    ```