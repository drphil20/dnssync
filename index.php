<meta http-equiv="cache-control" content="no-cache" />
<html>
<head>
    <script type="text/JavaScript" src="Scripts.js"></script>
    <style type="text/css">@import url("style.css");</style>
</head>
<body>
<div id="stateIndicator">
    <div id="stateChrisField">Chris: <div id="stateChris">Not Yet</div></div>
    <div id="statePhilField">Phil: <div id="statePhil">Not Yet</div></div>
    <div id="stateRemoteField">Remote: <div id="stateRemote">Not Yet</div></div>
</div>
<div id="DefinitionInput">
    <div id="commitTextArea">
        <button onClick="commitTextArea()">Commit changes</button>
    </div>
    <h1>DNS definitions:</h1>
    <textarea onchange="tidyInput()" id="mainInput" cols="50" rows="10">Double click definition to edit</textarea>
</div>
<div id="Definitions">
    <h2>Current Definitions</h2>
    Not Fetched Yet
</div>
</body>
</html>
