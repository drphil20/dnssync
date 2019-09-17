<?php
$mysqli = new mysqli("localhost", "dnssync", "E7ST2V9MaSGTyPps", "dnssync");

/* check connection */
if ($mysqli->connect_errno) {
    printf("Connect failed: %s\n", $mysqli->connect_error);
    exit();
}

/*
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
            $resObj[$i]["localstate"] = $row["LOCALSTATE"];
            $resObj[$i]["remotestate"] = $row["REMOTESTATE"];
            $resObj[$i]["isOnline"] = ((time() - $row["LASTREQTIME"]) < 10) ? true : false; //True if last request less then 10s ago
            $i = $i + 1;
        }
        $result->close();
        print( json_encode($resObj) );
        exit();
    }
    else {
        print("ERROR");
        exit();
    }
}
