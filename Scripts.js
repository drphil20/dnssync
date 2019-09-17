selectedDNSServer = ""; //Either {"", "chris", "phil"}; "" means all of them
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
    document.getElementById("mainInput").value = statesAsJSON;
}

//function sendChangesToServer() {