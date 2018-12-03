// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    var AWS = require('aws-sdk');
    var express = require('express');
    var bodyParser = require('body-parser');
	const dataRet = require("./lib/retrieve");

    AWS.config.region = process.env.REGION

    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(express.static('js'));
	
    const promise = new Promise(function(resolve, reject) {
    // retrieve the data from API
        const locationData = dataRet.RetrieveData();
  	console.log(locationData);
	resolve(locationData);
  
    });
	
    // index page
    app.get('/', async function(req, res) {
	
	var morningLatLngs = [];
	var noonLatLngs = [];
	var afternoonLatLngs = [];
	var eveningLatLngs = [];
	var nightLatLngs = [];
	
	try {
		const locationData = await dataRet.RetrieveData();		
		
		for (let i = 0; i < locationData[0]["locations"].length; i++){	
			var SCALAR_E7 = 0.0000001; // Since Google Takeout stores latlngs as integers
		
			if( locationData[0]["locations"][i].timeOfDay == "Morning"){
				morningLatLngs.push( [ locationData[0]["locations"][i].latitudeE7 * SCALAR_E7, locationData[0]["locations"][i].longitudeE7 * SCALAR_E7 ] );
			}
			if( locationData[0]["locations"][i].timeOfDay == "Noon"){
				noonLatLngs.push( [ locationData[0]["locations"][i].latitudeE7 * SCALAR_E7, locationData[0]["locations"][i].longitudeE7 * SCALAR_E7 ] );
			}
			if( locationData[0]["locations"][i].timeOfDay == "Afternoon"){
				afternoonLatLngs.push( [ locationData[0]["locations"][i].latitudeE7 * SCALAR_E7, locationData[0]["locations"][i].longitudeE7 * SCALAR_E7 ] );
			}
			if( locationData[0]["locations"][i].timeOfDay == "Evening"){
				eveningLatLngs.push( [ locationData[0]["locations"][i].latitudeE7 * SCALAR_E7, locationData[0]["locations"][i].longitudeE7 * SCALAR_E7 ] );
			}
			if( locationData[0]["locations"][i].timeOfDay == "Night"){
				nightLatLngs.push( [ locationData[0]["locations"][i].latitudeE7 * SCALAR_E7, locationData[0]["locations"][i].longitudeE7 * SCALAR_E7 ] );
			}
		}

	}
	catch (err) {
		console.log("Unable to retrieve commits for project: " + err.toString());
	}
		
	res.render('pages/index', {morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night:nightLatLngs});
    });
		
    app.get('/:weekDay', function(req, res) {
	    
	var weekDayParam = req.params.weekDay
	
        promise.then(function(resultAll) {
		var locations = resultAll[0]["locations"];
		console.log(locations);
		
		
		var allLatLngs = [];
		var morningLatLngs = [];
		var noonLatLngs = [];
		var afternoonLatLngs = [];
		var eveningLatLngs = [];
		var nightLatLngs = [];
		
		console.log(weekDayParam);
				
		var result = locations.filter(function (item) {
			return item.weekDay === weekDayParam;
		});
		
		console.log(result);
		
		for (let i = 0; i < result.length; i++){	
			var SCALAR_E7 = 0.0000001; // Since Google Takeout stores latlngs as integers
			allLatLngs.push( [ result[i].latitudeE7 * SCALAR_E7, result[i].longitudeE7 * SCALAR_E7 ] );
			
			if( result[i].timeOfDay == "Morning"){
				morningLatLngs.push( [ result[i].latitudeE7 * SCALAR_E7, result[i].longitudeE7 * SCALAR_E7 ] );
			}
			if( result[i].timeOfDay == "Noon"){
				noonLatLngs.push( [ result[i].latitudeE7 * SCALAR_E7, result[i].longitudeE7 * SCALAR_E7 ] );
			}
			if( result[i].timeOfDay == "Afternoon"){
				afternoonLatLngs.push( [ result[i].latitudeE7 * SCALAR_E7, result[i].longitudeE7 * SCALAR_E7 ] );
			}
			if( result[i].timeOfDay == "Evening"){
				eveningLatLngs.push( [ result[i].latitudeE7 * SCALAR_E7, result[i].longitudeE7 * SCALAR_E7 ] );
			}
			if( result[i].timeOfDay == "Night"){
				nightLatLngs.push( [ result[i].latitudeE7 * SCALAR_E7, result[i].longitudeE7 * SCALAR_E7 ] );
			}
			
			
		}
		
		res.render('pages/index', {morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night: nightLatLngs});
	})
	    

	    
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
