<?php
//Scan directory 'nk' and get list of filenames
$dir    = 'library/nk/';
$files = scandir($dir, 1);
$n = sizeof($files)-2;
$files = array_slice($files, 0, $n);
$filesSorted = sort($files);
?>

<html>
    <head>
        <meta http-equiv="Cache-control" content="no-cache">
        <meta http-equiv="Expires" content="-1">
        <script src="http://d3js.org/d3.v3.min.js"></script>
        <script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
        <script src="http://cdnjs.cloudflare.com/ajax/libs/mathjs/1.4.0/math.min.js"></script>
	<script src="js/MLM.js"></script>
	<script src="js/d3.slider.js"></script>
	<link rel="stylesheet" href="css/MLM.css"></link>
	<link rel="stylesheet" href="css/d3.slider.css"></link>
    </head>
    <body>
        <div class="wrapper">
           <h1>MLM</h1>
		   <p>Build a <strong>m</strong>ulti-<strong>l</strong>ayer <strong>m</strong>odel to determine the transmittance/reflectance of a thin-film stack. </p>
           <a href="https://github.com/rtreharne/MLM">https://github.com/rtreharne/MLM</a>
           </br></br>
           <a href="library/">Library</a>
           <div id="plot"></div>
     	   <div id="sliderLabel" class="slider">
	       </div>
	       <div id="slider1">
			   Click on film in table below to initiate slider.</div>
           <div>
		   </br></br>
	       <h3>Structure</h3>
           <select id="tf_select">
				<option value="">Select...</option>
				<?php
					$a = $files;
					foreach($a as $e) {
					echo "<option value='".$e."'>".str_replace(".csv", "", $e)."</option>";
					}
				?>
			</select>

		   <div class="tools">
               <a href="Javascript: addFilm();">Add Layer</a>
			   <a href="Javascript: removeFilm()">Remove Layer</a>
			   <a href="Javascript: moveUp()">Move Up</a>
			   <a href="Javascript: moveDown()">Move Down</a>
		   </div>
	       <table id="filmTable" class="tg">
		   </table>
		   </br></br>
		   </div>
    	</div>
    </body>

</html>
