selectedDNSServer = ""; //Either {"", "chris", "phil"}; "" means all of them

cachedDefinitions = null;
knownRemoteState = null;

function inputIsValid(text) {
    //Checks if the Text entered in the Textarea match the regualar expression to be valid DNS definitions
    var regEx = new RegExp("^.*\.[a-zA-Z]+\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$");

    //Check each line to match the regEx
    var result = true;
    var lines = text.split("\n");
    for ( i = 0; i < lines.length; i++ ) {
        if ( lines[i] == "" || lines[i].charAt(0) == "#") { continue; }
        result &= regEx.test(lines[i]);
    }
    return result;
}
function tidyInput() {
    var field = document.getElementById("mainInput");
    if ( inputIsValid(field.value) ) {
        field.style.backgroundColor = "#D7FFD7";
        return true;
    }
    else {
        field.style.backgroundColor = "#FFD7D7";
        return false;
    }
}
function commitTextArea() {
    //Make sure only valid inputs get commited
    if ( !tidyInput() ) { console.log("too dirty"); return false; }

    //1. Parse input and update cached Definitions
    inputLines = document.getElementById("mainInput").value.split("\n");

    var currentGroup = null;
    var updated = false;
    for ( var i = 0; i < inputLines.length; i++) {
        if ( inputLines[i].substr(0,3) == "#1-" ) {
            currentGroup = inputLines[i].substr(3);
            continue;
        }
        if ( currentGroup != null && inputLines[i] != "") {
            var url = inputLines[i].split("/")[0];
            var ip = inputLines[i].split("/")[1];
            updated |= updateOrAddCachedDefinitions(currentGroup, url, ip);
        }
    }

    //2. Compare to check if changed
    if ( updated ) {
        uploadUpdatedDefCache();
    }

    //3. upload changed definitions
    //alert("Hau raus");
}
function uploadUpdatedDefCache() {

}

function updateOrAddCachedDefinitions(group, url, ip) {
    var found = false;
    var changed = false;
    //1. Point i to first element with selected groupname
    var i = 0;
    while(cachedDefinitions[i] != null && cachedDefinitions[i]["groupname"] != group) {
        i++;
    }
    //2. Search within group
    while(cachedDefinitions[i] != null) {
        if( cachedDefinitions[i]["URL"] == url ) {
            found = true;
            if (cachedDefinitions[i]["IP"] != ip) {     //Update
                cachedDefinitions[i]["IP"] = ip;
                changed = true;
            }
            break;
        }
        i++;
    }
    //3. Return results
    if (!found) {
        //If not updated, add at the bottom of the list
        cachedDefinitions[i] = {URL: url, IP: ip, groupname: group, activeForChris: "1", activeForPhil: "1"};
        changed = true;
    }
    return changed;
}

//Writes the cached definitions of the specified group in the main Input field
function loadGroupEdit(groupname) {
    var fieldValue = "#1-"+groupname+"\n";
    for( i = 0; cachedDefinitions[i] != null; i++ ) {
        if( cachedDefinitions[i]["groupname"] != groupname ) { continue; }
        fieldValue += cachedDefinitions[i]["URL"] + "/" + cachedDefinitions[i]["IP"] + "\n";
    }
    document.getElementById("mainInput").value = fieldValue;
}

//Local DNS-State:

//Makes a backend request to get the current state of the Local DNS-Servers and displays them
function updateLocalDNSStates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            displayNewLocalDNSStates(this.responseText);
        }
    };
    xhttp.open("GET", "backend.php?c=getCurrentStates", true);
    xhttp.send();
}
//Displays the state of the local DNS-Servers
function displayNewLocalDNSStates(statesAsJSON) {
    var stateObj = JSON.parse(statesAsJSON);

    //First grab remote state
    knownRemoteState = stateObj[0]["remotestate"];
    if (knownRemoteState > cachedDefinitions["remoteState"]) { fetchRemoteDefinitions(); }

    for ( i = 0; i < stateObj.length; i++ ) {
        var stateHTMLObj;
        switch( stateObj[i]["serverID"] ) {
            case "phil":
                stateHTMLObj = document.getElementById("statePhil");
                break;
            case "chris":
                stateHTMLObj = document.getElementById("stateChris");
                break;
            default:
                document.getElementById("statePhil").innerText = "ERROR";
                return;
        }
        stateHTMLObj.innerText = stateObj[i]["localstate"];
        if ( !stateObj[i]["isOnline"] ) {
            stateHTMLObj.style.backgroundColor = "yellow";
        } else {
            if ( stateObj[i]["remotestate"] == stateObj[i]["localstate"] ) {
                stateHTMLObj.style.backgroundColor = "green";
            }
            else {
                stateHTMLObj.style.backgroundColor = "red";
            }
        }
    }
}
//Uncomment following to enable automatic updating of states
//window.setInterval(updateLocalDNSStates, 1000);



//Update Definitions
function mockfetch() {
    cachedDefinitions = JSON.parse("{\"0\":{\"URL\":\"upd.avast2.com\",\"IP\":\"127.0.0.1\",\"groupname\":\"avast\",\"activeForChris\":\"0\",\"activeForPhil\":\"1\"},\"1\":{\"URL\":\"update.avast1.com\",\"IP\":\"127.0.0.1\",\"groupname\":\"avast\",\"activeForChris\":\"0\",\"activeForPhil\":\"1\"},\"2\":{\"URL\":\"up.google.de\",\"IP\":\"192.168.15.4\",\"groupname\":\"Chrome67\",\"activeForChris\":\"1\",\"activeForPhil\":\"0\"},\"3\":{\"URL\":\"update.google.com\",\"IP\":\"127.0.0.1\",\"groupname\":\"Chrome67\",\"activeForChris\":\"1\",\"activeForPhil\":\"0\"},\"remoteState\":\"1569000000\"}");
}

function fetchRemoteDefinitions() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            cachedDefinitions = JSON.parse(this.responseText);
            processNewDefinitions();
        }
    };
    xhttp.open("GET", "backend.php?c=getAllDefinitionsAsJSONForWebsite", true);
    xhttp.send();
}
//Generates the HTML table showing the definitions and renders it in DOM
function processNewDefinitions() {
    var resHTML = "<h2>Current Definitions</h2>\n";
    if (cachedDefinitions == null) { return "NulL"; }

    //Create HTML
    var currentGroupName = "";
    for (i = 0; cachedDefinitions[i] != null; i++) {
        //0. If this is not the first group to begin, close the last
        if ( currentGroupName != "" && currentGroupName != cachedDefinitions[i]["groupname"] ) {
            resHTML += "</table></div>";
        }

        //1. Group Head if this Element is first of new Group
        if ( currentGroupName != cachedDefinitions[i]["groupname"] ) {
            currentGroupName = cachedDefinitions[i]["groupname"];
            resHTML += "<div id=\"" + currentGroupName + "\">";
            resHTML += "<h3 class=\"groupHeadLine\"><input type=\"checkbox\" name=\"group" + currentGroupName + "\">Group: " + currentGroupName + "</h3>";
            resHTML += "<table><tr><th>Active</th><th>Domain Name</th><th>IP</th></tr>";
        }

        //2. Table rows for each element in group
        resHTML += "<tr><td><input type=\"checkbox\" name=\""+cachedDefinitions[i]["URL"]+"\"></td>";
        resHTML += "<td>"+cachedDefinitions[i]["URL"]+"</td>";
        resHTML += "<td>"+cachedDefinitions[i]["IP"]+"</td></tr>";
    }

    //Insert generated HTML in DOM
    document.getElementById("Definitions").innerHTML = resHTML;

    //Add doubleclick event to edit
    addDblClickToTableMakingGroupEditable();
    return resHTML;
}

function addDblClickToTableMakingGroupEditable() {
    tables = document.getElementsByTagName("table");
    for (let i = 0; i < tables.length; i++) {
        if (tables[i] != null) {
            for (var j = 0; j < tables[i].rows.length; j++) {
                for (var k = 1; k < tables[i].rows[j].cells.length; k++)
                    tables[i].rows[j].cells[k].addEventListener('dblclick', function() {
                        loadGroupEdit( tables[i].parentElement.getAttribute("id"));
                    }, false);
            }
        }
    }
}

