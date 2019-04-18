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
	const wazeRet = require("./lib/retrieveWaze");
	
    AWS.config.region = process.env.REGION
	
	var indexRouter = require('./routes/index');
	var allHeatDataRouter = require('./routes/allHeatData');
	var weekDayDataRouter = require('./routes/getWeekDayHeatData');
	var heatPerCityRouter = require('./routes/getCityHeatData');
	var wazeDataRouter = require('./routes/getWazeData');
    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(express.static('js'));
	app.use(express.static('css'));
	app.use(express.static('img/favicon'));
	app.use(express.static('img/sharepicture'));
	app.use(express.static('img/countryicons'));
	
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
	app.use('/waze', wazeDataRouter);
	//app.use('/drivers', heatPerCityRouter);
	app.get('/drivers/:city', async function(req, res) { 
	
	var city = req.params.city
	var defaultMapPosition
	var headTitle

	if(city == "ba"){
		defaultMapPosition =  [48.1485, 17.1077];
		var headTitle = "Bolt Driver Position Map Bratislava";
	}
	
	if(city == "ke"){
		defaultMapPosition = [48.7171, 21.2494];
		headTitle = "Bolt Driver Position Map Košice";
	}
	
	if(city == "po"){
		defaultMapPosition = [49.0024, 21.2396];
		headTitle = "Bolt Driver Position Map Prešov";
	}
	if(city == "za"){
		defaultMapPosition = [49.2230, 18.7396];
		headTitle = "Bolt Driver Position Map Žilina";
	}
	if(city == "nr"){
		defaultMapPosition = [48.3098, 18.0858];
		headTitle = "Bolt Driver Position Map Nitra";
	}
	if(city == "tt"){
		defaultMapPosition = [48.3734, 17.5950];
		headTitle = "Bolt Driver Position Map Trnava";
	}
	if(city == "bb"){
		defaultMapPosition = [48.7383, 19.1571];
		headTitle = "Bolt Driver Position Map Banksk̉á Bystrica";
	}
	
	if(city == "prg"){
		defaultMapPosition = [50.0870, 14.4210];
		headTitle = "Bolt Hotspot Map Prague";
	}
	
	try {
		const driversData =  await driversRet.RetrieveData(city);

		var driversDataArray = [];
		for (var driver of driversData){
			driversDataArray.push([driver.lat ,driver.lng ]);
		}

		const policeData = await wazeRet.RetrieveData(city);

		var policeDataArray = [];
		for (var policePatrol of policeData){
			policeDataArray.push([policePatrol.lat ,policePatrol.lng ]);
		}		
		
		if(city == "bb" || city == "ba" || city == "ke" || city == "prg"){
		
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
				var locations = resultAll[0]["locations"]
				
				var resultWeekDay = locations.filter(function (item) {
					return item.weekDay === weekDayParam;
				});
				
				function getDayPeakDataWD( peakPeriod ) {
					return resultWeekDay.filter(function (item) {  return item.timeOfDay === peakPeriod;})
					.map( function(item){ return [item.latitudeE7 * SCALAR_E7, item.longitudeE7 * SCALAR_E7]; })
				}

				function getDayPeakDataAll( peakPeriod ) {
					return locations.filter(function (item) {  return item.timeOfDay === peakPeriod;})
					.map( function(item){ return [item.latitudeE7 * SCALAR_E7, item.longitudeE7 * SCALAR_E7]; })
				}

				if(city == "prg"){ 

					var pageData = {
						headTitle: headTitle,
						city: city, 
						mapPosition: defaultMapPosition, 
						drivers: driversDataArray,
						police: policeDataArray,
						morning: getDayPeakDataAll( 'Morning' ), 
						noon: getDayPeakDataAll( 'Noon' ), 
						afternoon: getDayPeakDataAll( 'Afternoon' ), 
						evening: getDayPeakDataAll( 'Evening' ), 
						night: getDayPeakDataAll( 'Night' ), 
					}

					res.render('pages/czechRepublic', pageData);
				}

				else{
					var pageData = {
						headTitle: headTitle,
						city: city, 
						mapPosition: defaultMapPosition, 
						drivers: driversDataArray,
						police: policeDataArray,
						morning: getDayPeakDataWD( 'Morning' ), 
						noon: getDayPeakDataWD( 'Noon' ), 
						afternoon: getDayPeakDataWD( 'Afternoon' ), 
						evening: getDayPeakDataWD( 'Evening' ), 
						night: getDayPeakDataWD( 'Night' ), 
					}

					res.render('pages/index', pageData);
				}
			}) 
						
		}
		//else if(city == "prg"){ 
		//	res.render('pages/czechRepublic', {headTitle: headTitle, mapPosition: defaultMapPosition, police: policeDataArray, drivers: driversDataArray, city: city});
		//}
		else { 
			 
			res.render('pages/drivers', {headTitle: headTitle, mapPosition: defaultMapPosition, drivers: driversDataArray,	police: policeDataArray, city: city});
				
		}
		
	} catch (err) {}
	}) 

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
