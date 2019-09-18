import time
import requests
import pickle

serverID = "phil"
localstate = 0
backendURL = "http://dnssync.bplaced.net/backend.php"

#Returns the remotestate as Integer
def getRemoteState():
    callURL = backendURL + "?c=getCurrentRemoteState&server="+serverID+"&ls="+localstate
    response = requests.get(url = callURL)
    return int(response.text)

while ( True ):
    print( getRemoteState() )



