selectedDNSServer = ""; //Either {"", "chris", "phil"}; "" means all of them

cachedDefinitions = null;
knownRemoteState = null;

groupCurrentlyEdited = null;

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
function discardChanges() {
    groupCurrentlyEdited = null;
    document.getElementById("mainInput").value = "Double click definition to edit";
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
            if (currentGroup == null) {
                currentGroup = inputLines[i].substr(3);
                updated |= updateGroupName(groupCurrentlyEdited, currentGroup);
            } else {
                currentGroup = inputLines[i].substr(3);
            }
            continue;
        }
        if ( currentGroup != null && inputLines[i] != "") {
            var url = inputLines[i].split("/")[0];
            var ip = inputLines[i].split("/")[1];
            updated |= updateOrAddCachedDefinitions(currentGroup, url, ip);
        }
    }

    //2. Upload if changes were made
    if ( updated ) {
        uploadUpdatedDefCache();
    }
}
function uploadUpdatedDefCache() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "backend.php?c=setUpdatedDefinitions", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(cachedDefinitions));
}

function updateGroupName(oldname, newname) {
    var updated = false;

    for (var i = 0; cachedDefinitions[i] != null; i++) {
        if ( cachedDefinitions[i]["groupname"] == oldname ) {
            cachedDefinitions[i]["groupname"] = newname;
            updated = true;
        }
    }
    if (updated) {
        cachedDefinitions["updatedGroupname"] = {"oldn": oldname, "newn": newname};
        groupCurrentlyEdited = newname;
    }
    return updated;
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
    groupCurrentlyEdited = groupname;
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
    document.getElementById("stateRemote").innerText = knownRemoteState;
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
window.setInterval(updateLocalDNSStates, 1000);



//Update Definitions
function mockfetch() {  //Mock for debugging
    cachedDefinitions = JSON.parse("{\"0\":{\"URL\":\"upd.avast2.com\",\"IP\":\"127.0.0.1\",\"groupname\":\"avast\",\"activeForChris\":\"0\",\"activeForPhil\":\"1\"},\"1\":{\"URL\":\"update.avast1.com\",\"IP\":\"127.0.0.1\",\"groupname\":\"avast\",\"activeForChris\":\"0\",\"activeForPhil\":\"1\"},\"2\":{\"URL\":\"up.google.de\",\"IP\":\"192.168.15.4\",\"groupname\":\"Chrome67\",\"activeForChris\":\"1\",\"activeForPhil\":\"0\"},\"3\":{\"URL\":\"update.google.com\",\"IP\":\"127.0.0.1\",\"groupname\":\"Chrome67\",\"activeForChris\":\"1\",\"activeForPhil\":\"0\"},\"remoteState\":\"1569000000\"}");
    processNewDefinitions();
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
            resHTML += "<h3 class=\"groupHeadLine\">";
            resHTML += "<input type=\"checkbox\" value='chris' onclick='activityChange(this, true)' name='group'>";
            resHTML += "<input type=\"checkbox\" value='phil' onclick='activityChange(this, true)' name='group'>";
            resHTML += "Group: " + currentGroupName + "</h3>";
            resHTML += "<table><tr><th>Chris</th><th>Phil</th></th><th>Domain</th><th>IP</th></tr>";
        }

        //2. Table rows for each element in group
        resHTML += "<tr><td><input type=\"checkbox\" value='chris' onclick='activityChange(this, false)' name=\""+cachedDefinitions[i]["URL"]+"\"";
        resHTML += (cachedDefinitions[i]["activeForChris"] == "1" ? " checked" : "") + "></td>";
        resHTML += "<td><input type=\"checkbox\" value='phil' onclick='activityChange(this, false)' name=\""+cachedDefinitions[i]["URL"]+"\"";
        resHTML += (cachedDefinitions[i]["activeForPhil"] == "1" ? " checked" : "") + "></td>";
        resHTML += "<td>"+cachedDefinitions[i]["URL"]+"</td>";
        resHTML += "<td>"+cachedDefinitions[i]["IP"]+"</td></tr>";
    }

    //Insert generated HTML in DOM
    document.getElementById("Definitions").innerHTML = resHTML;

    //Adjust Groupcheckboxes
    adjustGroupCheckboxTicks();

    //Add doubleclick event to edit
    addDblClickToTableMakingGroupEditable();
    return resHTML;
}
function adjustGroupCheckboxTicks() {
    groups = document.getElementById("Definitions").getElementsByTagName("div");

    //In every group
    for ( var i = 0; i < groups.length; i++ ) {

        //check if all single boxes are ticked
        singleBoxes = groups[i].getElementsByTagName("table")[0].getElementsByTagName("input");

        var allTrueChris = true;
        var allFalseChris = false;
        var allTruePhil = true;
        var allFalsePhil = false;
        for (var j = 0; j < singleBoxes.length; j++) {
            if ( singleBoxes[j].value == "phil" ) {
                allTruePhil &= singleBoxes[j].checked;
                allFalsePhil |= singleBoxes[j].checked;
            }
            else if ( singleBoxes[j].value == "chris" ) {
                allTrueChris &= singleBoxes[j].checked;
                allFalseChris |= singleBoxes[j].checked;
            }
        }
        //Now set group boxes
        groupboxes = groups[i].getElementsByTagName("h3")[0].getElementsByTagName("input");
        for ( var j = 0; j < groupboxes.length; j++ ) {
            if ( groupboxes[j].value == "phil" ) {
                if ( allTruePhil ) { groupboxes[j].checked = true; }
                else if ( !allFalsePhil ) { groupboxes[j].checked = false; }
                else { groupboxes[j].intermediate = true; }
            }
            else if ( groupboxes[j].value == "chris" ) {
                if ( allTrueChris ) { groupboxes[j].checked = true; }
                else if ( !allFalseChris ) { groupboxes[j].checked = false; }
                else { groupboxes[j].intermediate = true; }
            }
        }
    }
}

window.onload = function() {fetchRemoteDefinitions(); };

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
function activityChange( box, isGroup ) {

    //1. find groupname
    divElem = box;
    while ( divElem.tagName.toUpperCase() != "DIV" ) {
        divElem = divElem.parentElement;
    }
    groupname = divElem.getAttribute("id");

    //2. Gather other information
    var serverID = box.getAttribute("value");
    var value = box.checked;
    var url = box.getAttribute("name");

    //3. Update cachedDefinitions
    updateActivityInCachedDefinitions(groupname, isGroup, url, serverID, value);

    //4. Rewrite Definition HTML
    processNewDefinitions();

    //5. Send changes
    uploadUpdatedDefCache();
}

/*
Updates the activity flags in the cachedDefinitions
@param group        String  The groupname of the updated entry
@param wholeGroup   Boolean If true, every URL of the group will be marked accordingly
@param url          String  URL to be marked. Irrelevant if wholeGroup is true.
@param serverID     String  ServerID of the DNSServer for whom the flag will be set
@param value        Boolean True to set Definition as active
 */
function updateActivityInCachedDefinitions(group, wholeGroup, url, serverID, value) {
    for (var i = 0; cachedDefinitions[i] != null; i++) {
        if ( cachedDefinitions[i]["groupname"] == group && (wholeGroup || cachedDefinitions[i]["URL"] == url) ) {
            if ( serverID == "phil" ) {
                cachedDefinitions[i]["activeForPhil"] = value ? "1" : "0";
            }
            if ( serverID == "chris" ) {
                cachedDefinitions[i]["activeForChris"] = value ? "1" : "0";
            }
        }
    }
}
