window.location.href = "#";
//Instantiate
      // var masterMap = [['OW.csv', 'ZnO.csv', 'ITO.csv', 'ZnO.csv', 'ITO.csv'], [NaN, 100, 100, 100, 100]];
    var masterMap = [['OptiWhite.csv', 'ITO.csv'],[NaN, 200]];
//        var masterMap = [['OW.csv', 'ITO.csv', 'ZnO.csv'],[NaN, 100, 100]];

    //var masterMap = [['OptiWhite.csv', 'SiO2.csv', 'ITO.csv', 'ZnO.csv', 'CdS.csv', 'CdTe.csv'],[NaN, 10, 500, 100, 100, 2000]];

	var flag = -1;
	var masterData = [];
	var masterMatrix = [];
	var testMatrix = [];
	var I = math.complex(0,1);
	var selectedFilm = '0';
        //Define Admittance of air
        var airA = 2.6544e-3;


	function inst(d) {
	    if (flag == d[0].length-1) {
	       return; 
	    }
            if (flag == 0) {
	        //reset array
	        masterData = [];
	    }

	    flag++;
	    d3.csv('library/nk/'+d[0][flag], function(data) {
	        x = data.map(function(d) {return [ +d["wavelength"], +d["n"], +d["k"]] ; });
	        lambda = x.map(function(d) {return d[0];});
	        n = x.map(function(d) {return d[1];});
	        k = x.map(function(d) {return d[2];});
	        k = math.multiply(k,I);
                masterData.push([lambda, math.subtract(n, k)]);
                
	        if (flag == masterData.length-1) {
		    Matrix = createMatrix(masterMap, masterData); 
		    plotData = calcTR(masterData, matrixMult(Matrix));
		    plot(plotData);
		    updateTable(masterMap);
		    _(selectedFilm).className = "highlight";
		    flag = -1 //!important that this is reset
                    plotData = [];
	        }
	    });

	    inst(masterMap);
	}

        function createMatrix(Map, Data) {
	    //loop over Data using matrixElem(N, thickness)
	    //return 2D array containing matrix elements
	    M = [];
	    for (i = 1; i < Data.length; i++) {
		M.push(matrixElem(Map[1][i], Data[i]));
            }
	    return M;
	}

        function matrixElem(d, data) {
	   //Calculate matrix elements for a single film
	   
	   //define film phase
	   var deltaA = math.dotDivide(data[1], data[0]);
	   var delta = math.multiply(deltaA, 2*Math.PI*d);
	   
	   //Define Admittance of film
	   var filmA = math.multiply(data[1],airA);
	   
	   //define matrix
	   var M11 = math.cos(delta);
	   var M12a = math.multiply(I,math.sin(delta)); 
	   var M12 = math.dotDivide(M12a,filmA);
	   var M21a = math.multiply(I,math.sin(delta));
	   var M21 = math.dotMultiply(M21a,filmA);
	   var M22 = math.cos(delta);

	   return [M11, M12, M21, M22];

	}
   
        function matrixMult(data) {
	    //Calculate Transfer Matrix
	    //Multiply first by unitary matrix 
	    var M = identity(data[0][0].length);
	    for (i = 0; i < data.length; i++) {
		A = math.add(math.dotMultiply(M[0], data[i][0]), math.dotMultiply(M[1], data[i][2]));
		B = math.add(math.dotMultiply(M[0], data[i][1]), math.dotMultiply(M[1], data[i][3]));
		C = math.add(math.dotMultiply(M[2], data[i][0]), math.dotMultiply(M[3], data[i][2]));
		D = math.add(math.dotMultiply(M[2], data[i][1]), math.dotMultiply(M[3], data[i][3]));
	        M = [A, B, C, D];
		}
	    return M;
            }

        function calcTR (Data, Matrix) {
            //return T and R for plotting	
	    var T = [];
	    var R = [];
            subs = math.multiply(airA, Data[0][1]);
	    for (i = 0; i < Matrix[0].length; i++) {
	        B = math.add(Matrix[0][i], math.multiply(subs[i],Matrix[1][i]));
		C = math.add(Matrix[2][i], math.multiply(subs[i],Matrix[3][i]));

		T1 = 4*airA*subs[i].re;
		T2 = math.add(math.multiply(airA,B),C);
		T3 = math.conj(T2);
		T4 = math.multiply(T2,T3);
		T.push([Data[0][0][i],(math.divide(T1,T4)).re]);

	        R1 = math.subtract(math.multiply(airA,B),C);
		R2 = math.divide(R1,T2);
		R3 = math.conj(R2);
		R.push([Data[0][0][i],(math.multiply(R2,R3)).re]);
		
	   }
	return([T,R]);

	}

        function identity (len) {
	//Create an identity array for use in matrix multiplication
	   var zero = [];
	   var unit = [];
           for (i=0; i < len; i++) {
	       zero.push(0);
	   }
	   for (i=0; i < len; i++) {
	       unit.push(1);
	   }
	   return [unit, zero, zero, unit];
        } 
        
	function updatePlot(Map, Data) {
	    Matrix = createMatrix(Map, Data); 
            plotData = calcTR(Data, matrixMult(Matrix));
	    plot(plotData);

	}
    
    function updateTable(Map) {
        var table = _('filmTable');
		var output = '<tr><th class="tg-031e">#</th><th class="tg-031e">Material</th><th class="tg-031e">Thickness (nm)</th>';
		for (var i in Map[0]) {
		    output = output+'<tr id="'+i+'"><td class="tg-031e">'+i+'</td><td class="tg-031e">'+masterMap[0][i]+'</td><td class="tg-031e">'+masterMap[1][i]+'</td></tr>';
		}
		table.innerHTML = output; 
	}

        inst(masterMap);

        function plot(dataset) {
	    T = dataset[0];
	    R = dataset[1];

	    
            var w = 900;
	    var h = 500;
	    var padding = 60;


	    var svg = d3.select("#plot svg").remove();

            var svg = d3.select("#plot")
	                 .append("svg")
	                 .attr("height", h)
			 .attr("width", w);


	    //Create scale functions
            var xScale = d3.scale.linear()
	                   .domain([d3.min(T, function(d) {return d[0];}), d3.max(T, function(d) {return d[0];})])
		  	   .range([padding,w-padding]);

            var yScale = d3.scale.linear()
	                   //.domain([0, d3.max(dataset, function (d) {return d[1];})])
			   .domain([0,1])
			   .range([h-padding, padding]);

	
            //Define X axis
	    var xAxis = d3.svg.axis()
	                  .scale(xScale)
	                  .orient("bottom")
			  .ticks(5);

            //Define Y axis
	    var yAxis = d3.svg.axis()
	                  .scale(yScale)
	                  .orient("left")
			  .ticks(5);

            var transmittance = d3.svg.line()
	        .x(function(d) {return xScale(d[0]);})
		.y(function(d) {return yScale(d[1]);});

	    var reflectance = d3.svg.line()
	        .x(function(d) {return xScale(d[0]);})
		.y(function(d) {return yScale(d[1]);});

            svg.append("path")
		.attr("d", transmittance(T))
		.attr("stroke", "red");
	    
            svg.append("path")
	        .attr("stroke", "blue")
		.attr("d", transmittance(R));


	    /*svg.selectAll("circle")
	        .data(dataset)
	        .enter()
                .append("circle")
		.attr("stroke", "none")
		.attr("cx", function(d) {return xScale(d[0]);})
                .attr("cy", function(d) {return yScale(d[1]);})
		.attr("r", 1);*/

		
	    //Creat X axis
	    svg.append("g")
	       .attr("class", "axis")
               .attr("transform", "translate(0," + (h-padding) + ")")
	       .call(xAxis)
	     .append("text")
	       .attr("class", "label")
	       .style("margin", "auto")
               .attr("x", w - padding)
	       .attr("y", 50)
               .style("text-anchor", "end")
	       .text("Wavelength (nm)");

	    //Create Y axis
	    svg.append("g")
	       .attr("class", "axis")
	       .attr("transform", "translate(" + padding + ",0)")
	       .call(yAxis)
	     .append("text")
	       .attr("x", -h/2)
	       .attr("y", -40)
	       .attr("class", "label")
	       .attr("transform", "rotate(-90)")
	       .text("T, R");

            }
         
         function updateSlider(filmID) {
			 _("sliderLabel").innerHTML = '<h3> Layer '+filmID+' thickness (nm)</h3>';
			 _("slider1").innerHTML = "";
			 if (filmID > 0) {
			 var sdr = d3.select('#slider1')
				 .call(d3.slider().on("slide", function(evt, value) {
					 masterMap[1][filmID] = value;
					 updatePlot(masterMap, masterData);
					 updateTable(masterMap);
					 _(filmID).className = 'highlight';
				 })
						 .axis(true)
						 .value(masterMap[1][filmID])
						 .min(0)
						 .max(2000)
						 .step(1)
					 );
			 }
		 }

         function addFilm() {
			 var film = _('tf_select').value;
			 if (film == 0) {
					 console.log('Select library file');
					 return;
			 }
			 if (selectedFilm=='') {
			     console.log('Please select a row from the table');
				 return;
			 }
			 console.log('insert new film after '+selectedFilm);
                         masterMap[0].splice(math.add(parseInt(selectedFilm),1), 0, film);
			 masterMap[1].splice(math.add(parseInt(selectedFilm),1), 0, 100);
                         inst(masterMap);			 
			 
		 }
            function _(x) {
				return document.getElementById(x);
			}   

			$('#filmTable tr').live('click', function(event) {
					$(this).addClass('highlight').siblings().removeClass('highlight');
					updateSlider(this.id);
					selectedFilm = this.id;
					console.log('selected = '+selectedFilm);
				});
 
            function removeFilm() {
	        var film = parseInt(selectedFilm);
		console.log(film);
                console.log(masterMap[0].length);
                if (film > 0 && masterMap[0].length > 2) {
		console.log('Delete film '+selectedFilm);
		masterMap[0].splice(selectedFilm, 1);
		masterMap[1].splice(selectedFilm, 1);
		selectedFilm = math.subtract(parseInt(selectedFilm), 1);
		inst(masterMap);
                }
	    }

	    function moveUp() {
	        var film = parseInt(selectedFilm);
		if (film < 2) {
		    console.log('No dice!');
		    return;
		}
		console.log('film '+film+' moved up.');
		
		var temp = masterMap[0][film-1];
		masterMap[0][film-1] = masterMap[0][film];
		masterMap[0][film] = temp;
		
                temp = masterMap[1][film-1];
		masterMap[1][film-1] = masterMap[1][film];
		masterMap[1][film] = temp;

		selectedFilm = math.subtract(parseInt(selectedFilm), 1);
		inst(masterMap);
		updateSlider(selectedFilm);

	    }
	    
            function moveDown() {
	        var film = parseInt(selectedFilm);
		if (film < 1 || film == masterMap[0].length-1) {
		    console.log('No dice!');
		    return;
		}
		console.log('film '+film+' moved down.');
		
		var temp = masterMap[0][film+1];
		masterMap[0][film+1] = masterMap[0][film];
		masterMap[0][film] = temp;
		
                temp = masterMap[1][film+1];
		masterMap[1][film+1] = masterMap[1][film];
		masterMap[1][film] = temp;

		selectedFilm = math.add(parseInt(selectedFilm), 1);
		inst(masterMap);
		updateSlider(selectedFilm);

	    }


