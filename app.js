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
	

	var SCALAR_E7 = 0.0000001
	
        promise.then(function(resultAll) {
	    var locations = resultAll[0]["locations"];
		
	    function getDayPeakData( peakPeriod ) {
	        return locations.filter(function (item) {  return item.timeOfDay === peakPeriod;})
			.map( function(item){ return [item.latitudeE7 * SCALAR_E7, item.longitudeE7 * SCALAR_E7]; })
	    }
	
	    var morningLatLngs = getDayPeakData( 'Morning' )
	    var noonLatLngs = getDayPeakData( 'Noon' )
	    var afternoonLatLngs = getDayPeakData( 'Afternoon' )
	    var eveningLatLngs = getDayPeakData( 'Evening' )
	    var nightLatLngs = getDayPeakData( 'Night' )
		
	    res.render('pages/index', {morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night: nightLatLngs});
	})  
    });
		
    app.get('/:weekDay', function(req, res) {
        	
	var weekDayParam = req.params.weekDay
	var SCALAR_E7 = 0.0000001
	
        promise.then(function(resultAll) {
	    var locations = resultAll[0]["locations"];
		
	    var result = locations.filter(function (item) {
	        return item.weekDay === weekDayParam;
	    });
		
	    function getDayPeakData( peakPeriod ) {
	        return result.filter(function (item) {  return item.timeOfDay === peakPeriod;})
			.map( function(item){ return [item.latitudeE7 * SCALAR_E7, item.longitudeE7 * SCALAR_E7]; })
	    }
	
	    var morningLatLngs = getDayPeakData( 'Morning' )
	    var noonLatLngs = getDayPeakData( 'Noon' )
	    var afternoonLatLngs = getDayPeakData( 'Afternoon' )
	    var eveningLatLngs = getDayPeakData( 'Evening' )
	    var nightLatLngs = getDayPeakData( 'Night' )
		
	    res.render('pages/index', {morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night: nightLatLngs});
	})    
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
