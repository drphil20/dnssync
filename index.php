<html>
<head>

	<script type="text/JavaScript">
		function inputIsValid(text) {
			//Checks if the Text entered in the Textarea match the regualar expression to be valid DNS definitions
			let regEx = new RegExp("^.*\.[a-zA-Z]+\/(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$");
			
			//Check each line to match the regEx
			var result = true;
			lines = text.split("\n");
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
			alert("Hau raus")
			
			
		}
		//function sendChangesToServer() {
			
	</script>
	<style type="text/css">
	#DefinitionInput {
		position: relative;
		font-size: 1em;
		border: 1px solid black;
	}
	#commitTextArea {
		position: absolute;
		top: 0px;
		right: 0px;
	}
	.groupHeadLine {
		margin-bottom: 0px;	
	}
	</style>
</head>
<body>
<div id="DefinitionInput">
<h1>DNS definitions:</h1><div id="commitTextArea"><button onClick="commitTextArea()">Commit changes</button></div>
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
