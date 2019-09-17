selectedDNSServer = ""; //Either {"", "chris", "phil"}; "" means all of them

cachedDefinitions = null;
websiteCurrentState = null;
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
    field = document.getElementById("mainInput");
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
    if ( !tidyInput() ) { return false; }
    alert("Hau raus");
}
/*function loadGroupEdit(groupname) {

}*/

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
    for (i = 0; i < cachedDefinitions.length; i++) {
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
}


function addDblClickToTableMakingGroupEditable() {
    tables = document.getElementsByTagName("table");
    for (i = 0; i < tables.length; i++) {
        if (tables[i] != null) {
            for (var i = 0; i < tables[i].rows.length; i++) {
                for (var j = 1; j < tables[i].rows[i].cells.length; j++)
                    tables[i].rows[i].cells[j].ondblclick = function () { loadGroupEdit(tables.name); };
            }
        }
    }
}

