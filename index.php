<html>
<head>
    <script type="text/JavaScript" src="Scripts.js"></script>
    <style type="text/css">@import url("style.css");</style>
</head>
<body>
<div id="DefinitionInput">
    <h1>DNS definitions:</h1>
    <div id="commitTextArea">
        <button onClick="commitTextArea()">Commit changes</button>
    </div>
    <textarea onchange="tidyInput()" id="mainInput" cols="50" rows="10">example.de/1.1.1.1</textarea>
</div>
<div id="Definitions">
    <h2>Current Definitions</h2>

    <div id="Chrome76">
        <h3 class="groupHeadLine"><input type="checkbox" name="groupChrome76">Group: Chrome76</h3>
        <table>
            <tr>
                <th>Active</th>
                <th>Domain Name</th>
                <th>IP</th>
            </tr>
            <tr>
                <td><input type="checkbox" name="update.google.com"></td>
                <td>update.google.com</td>
                <td>127.0.0.1</td>
            </tr>
            <tr>
                <td><input type="checkbox" name="update.google.de"></td>
                <td>update.google.de</td>
                <td>127.0.0.1</td>
            </tr>
        </table>
    </div>
</div>
</body>
</html>
