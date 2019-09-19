import time
import requests
import os

serverID = "phil"
backendURL = "http://dnssync.bplaced.net/backend.php"
dnsmasqConfigFile = "/etc/dnsmasq.conf"
#dnsmasqConfigFile = "msq.conf"

localstate = 0
lastknownremotestate = 0

def restartService():
    os.system('service dnsmasq restart')

#Returns the remotestate as Integer
def getRemoteState():
    callURL = backendURL + "?c=getCurrentRemoteState&server="+serverID+"&ls="+str(localstate)
    response = requests.get(url = callURL)
    return int(response.text)

def updateDefinitions():
    global localstate, lastknownremotestate
    callURL = backendURL + "?c=getConfForDNSServer&server="+serverID
    response = requests.get( url = callURL )
    pasteIntoConfigFile(response.text)
    localstate = lastknownremotestate
    restartService()

def pasteIntoConfigFile(pasteText):
    #1. Read old config file into memory
    with open(dnsmasqConfigFile, "r") as f:
        lines = f.readlines()

    with open(dnsmasqConfigFile, "w") as f:
        for line in lines:      #2. Delete existing definitions
            if line[0:8] != "address=":
                f.write(line)
        f.write(pasteText)      #3. Write new definitions at bottom of file

#Loop to keep listening for updates
while ( True ):
    lastknownremotestate = getRemoteState()
    if ( lastknownremotestate > localstate ):
        updateDefinitions()
    time.sleep(1)
