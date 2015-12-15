<?php
//Scan directory 'nk' and get list of filenames
$dir    = 'nk';
$files = scandir($dir, 1);
$n = sizeof($files)-2;
$files = array_slice($files, 0, $n);
$filesSorted = sort($files);
?>
<!doctype html>
<html lang="en">
	<head>
	<!-- Plotting scripts and styles -->
		<script src="http://d3js.org/d3.v3.min.js"></script>
		<script src="js/main.js"></script>
		<script type="text/javascript" src="js/plot.js"></script>
		<link rel="stylesheet" href="../css/MLM.css"/>

        </head>

	<body onload="plotNew('nk')">
            <div class="wrapper">
                <h1>Thin-Film Dispersion Library</h1>
                <a href="../index.php">Home</a>
                <h2 id="matLabel"></h2>
				<form id="frmDown" method="get" action="nk/ITO.csv">
		        	<select id="tf_select"  onchange="plotNew('nk/'+this.value);">
					<option value="">Select...</option>
					<?php
					    $a = $files;
					    foreach($a as $e) {
						echo "<option value='".$e."'>".str_replace(".csv", "", $e)."</option>";
					    }
					?>
				</select>
				<button type="submit">Download</button>
				</form>

	        	<div id="plot" class="svg-holder svg-holder-simple"></div>
            </div>
	</body>
</html>
