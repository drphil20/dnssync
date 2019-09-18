<?php
$mysqli = new mysqli("localhost", "dnssync", "E7ST2V9MaSGTyPps", "dnssync");

/* check connection */
if ($mysqli->connect_errno) {
    printf("Connect failed: %s\n", $mysqli->connect_error);
    exit();
}

/*
 * API Method: GetCurrentStates
 * returns the local state (timestamp) and connection state ({"online", "offline"}) of all known DNS-Servers as JSON
 * SQL: SELECT * FROM DNSServers;
 */
if ($_GET["c"] == "getCurrentStates") {
    if ($result = $mysqli->query("SELECT * FROM DNSServers;")) {
        /* fetch associative array */
        $resObj = array();

        $i = 0;
        while ($row = $result->fetch_assoc()) {
            $resObj[$i] = array();
            $resObj[$i]["serverID"] = $row["SERVERID"];
            $resObj[$i]["localstate"] = $row["LOCAL_STATE"];
            $resObj[$i]["remotestate"] = $row["REMOTE_STATE"];
            $resObj[$i]["isOnline"] = (time() - $row["LASTREQTIME"]) < 10; //True if last request less then 10s ago
            $i = $i + 1;
        }
        $result->close();
        print(json_encode($resObj));
        exit();
    } else {
        print("ERROR");
        exit();
    }
}


if ($_GET["c"] == "getAllDefinitionsAsJSONForWebsite") {

    $remoteStateResult = $mysqli->query("SELECT REMOTE_STATE FROM DNSServers LIMIT 1;");
    $remoteStateRow = $remoteStateResult->fetch_assoc();
    $remoteState = $remoteStateRow["REMOTE_STATE"];
    $remoteStateResult->close();

    if ($result = $mysqli->query("SELECT * FROM Definitions ORDER BY GROUPNAME;")) {
        /* fetch associative array */
        $resObj = array();

        $i = 0;
        while ($row = $result->fetch_assoc()) {
            $resObj[$i] = array();

            //Create JSON Sorted by Groups
            $resObj[$i]["URL"] = $row["URL"];
            $resObj[$i]["IP"] = $row["IP"];
            $resObj[$i]["groupname"] = $row["GROUPNAME"];
            $resObj[$i]["activeForChris"] = $row["chris"];
            $resObj[$i]["activeForPhil"] = $row["phil"];

            $i = $i + 1;
        }
        $result->close();
        $resObj["remoteState"] = $remoteState;
        print(json_encode($resObj));
        exit();
    } else {
        print("ERROR");
        exit();
    }
}


if ($_GET["c"] == "setUpdatedDefinitions") {
    //Make sure that it is a POST request.
    if (strcasecmp($_SERVER['REQUEST_METHOD'], 'POST') != 0) {
        throw new Exception('Request method must be POST!');
    }
    //Make sure that the content type of the POST request has been set to application/json
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if (strcasecmp($contentType, 'application/json') != 0) {
        throw new Exception('Content type must be: application/json');
    }
    //Receive the RAW post data.
    $content = trim(file_get_contents("php://input"));
    //Attempt to decode the incoming RAW post data from JSON.
    $decoded = json_decode($content, true);
    //If json_decode failed, the JSON is invalid.
    if (!is_array($decoded)) {
        throw new Exception('Received content contained invalid JSON!');
    }


    //Updating the DB
    $i = 0;
    $success = true;
    while (!is_null($decoded[$i])) {
        $query = "REPLACE into Definitions (URL, IP, GROUPNAME, chris, phil) VALUES ";
        $query .= "('".$decoded[$i]["URL"]."','".$decoded[$i]["IP"]."','".$decoded[$i]["groupname"]."',".$decoded[$i]["activeForChris"].",".$decoded[$i]["activeForPhil"].");";
        $error &= $mysqli->query($query);
        $i = $i +1;
    }

    //Set new state
    $query = "UPDATE DNSServers SET REMOTE_STATE = UNIX_TIMESTAMP();";
    $mysqli->query($query);
    if ($success) { print("success"); }
    else { print("Failed"); }

}