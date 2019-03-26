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
	var time = require('time');
	const dataRet = require("./lib/retrieve");
	const driversRet = require("./lib/retrieveDrivers");
	
    AWS.config.region = process.env.REGION
	
	var indexRouter = require('./routes/index');
	var allHeatDataRouter = require('./routes/allHeatData');
	var weekDayDataRouter = require('./routes/getWeekDayHeatData');
	var heatPerCityRouter = require('./routes/getCityHeatData');
    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(express.static('js'));
	app.use(express.static('css'));
	app.use(express.static('img/favicon'));
	app.use(express.static('img/sharepicture'));
	
	//We cache the location data as it takes 8 seconds to load. So that It is loaded when the app is installed.
    const promise = new Promise(function(resolve, reject) {
		// retrieve the data from API
        const locationData = dataRet.RetrieveData();
		console.log(locationData);
		resolve(locationData);
  
    });
	app.set('promise', promise);
	
	//Routers 
	app.use('/', indexRouter);
	app.use('/all', allHeatDataRouter);
	app.use('/', weekDayDataRouter);
	//app.use('/drivers', heatPerCityRouter);
	app.get('/drivers/:city', async function(req, res) { 
	
	var city = req.params.city

	if(city == "ba"){
		var defaultMapPosition =  [48.1485, 17.1077];
		var headTitle = "Bolt Driver Position Map Bratislava";
	}
	
	if(city == "ke"){
		var defaultMapPosition = [48.7171, 21.2494];
		var headTitle = "Bolt Driver Position Map Košice";
	}
	
	if(city == "po"){
		var defaultMapPosition = [49.0024, 21.2396];
		var headTitle = "Bolt Driver Position Map Prešov";
	}
	if(city == "za"){
		var defaultMapPosition = [49.2230, 18.7396];
		var headTitle = "Bolt Driver Position Map Žilina";
	}
	if(city == "nr"){
		var defaultMapPosition = [48.3098, 18.0858];
		var headTitle = "Bolt Driver Position Map Nitra";
	}
	if(city == "tt"){
		var defaultMapPosition = [48.3734, 17.5950];
		var headTitle = "Bolt Driver Position Map Trnava";
	}
	if(city == "bb"){
		var defaultMapPosition = [48.7383, 19.1571];
		var headTitle = "Bolt Driver Position Map Banksk̉á Bystrica";
	}
	
	
		
	try {
		const driversData =  await driversRet.RetrieveData(city);

		var driversDataArray = [];
		for (var driver of driversData){
			driversDataArray.push([driver.lat ,driver.lng ]);
		}		
		
		if(city == "bb" || city == "ba"){
		
			var a = new time.Date();
			var d = a.setTimezone('Europe/Bratislava');
			var wd = new Array(7);
			wd[0] =  "ne";
			wd[1] = "po";
			wd[2] = "ut";
			wd[3] = "st";
			wd[4] = "št";
			wd[5] = "pi";
			wd[6] = "so";
			
			var weekDayParam = wd[d.getDay()];
			var SCALAR_E7 = 0.0000001

			promise.then(async function(resultAll) {
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
				
				res.render('pages/index', {headTitle: headTitle, mapPosition: defaultMapPosition, morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night: nightLatLngs, drivers: driversDataArray});
			}) 
						
		} else { 
			 
			res.render('pages/drivers', {headTitle: headTitle, mapPosition: defaultMapPosition, drivers: driversDataArray});
				
		}
		
	} catch (err) {}
	}) 

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
