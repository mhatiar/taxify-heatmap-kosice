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
	var fs = require('fs');
	var time = require('time');
	var session = require("express-session");
	var https = require('https');
	const mongoose = require('mongoose');
	const passport = require('passport');
	const flash = require('connect-flash');
	var MongoStore = require('connect-mongo')(session);
	var async = require('async');

	//Data Retrievers
	const dataRet = require("./lib/retrieve");
	const driversRet = require("./lib/retrieveDrivers");
	const wazeRet = require("./lib/retrieveWaze");
	
    AWS.config.region = process.env.REGION
	
	//Routers
	var introRouter = require('./routes/introPage');
	var landingRouter = require('./routes/index');
	var allHeatDataRouter = require('./routes/allHeatData');
	var weekDayDataRouter = require('./routes/getWeekDayHeatData');
	var currentHour = require('./routes/getCurrentHourHeatData');
	var heatPerCityRouter = require('./routes/getCityHeatData');
	var wazeDataRouter = require('./routes/getWazeData');
	const usersRouter = require("./routes/users");
	const paymentRouter = require('./routes/payment');

	//Auth Utils 
	var app = express();

	// Passport Config
	require('./config/passport')(passport);

	// DB Config
	const db = require('./config/keys').mongoURI;

	// Connect to MongoDB
	mongoose
		.connect(
			db,
			{ useNewUrlParser: true,useUnifiedTopology: true }
		)
		.then(() => console.log('MongoDB Connected'))
		.catch(err => console.log(err));
	
	app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(express.static('js'));
	app.use('/css', express.static('css'))
	app.use(express.static('img/favicon'));
	app.use(express.static('img/sharepicture'));
	app.use(express.static('img/countryicons'));
	app.use(express.json());

	app.use(session({
		secret: '§adfkjdfadsf3645fadsf54asfd41',
		resave: true,
		saveUninitialized: false,
		cookie: {
			secure: false,
			sameSite: 'strict',
			maxAge:  12 * 60 * 60 * 1000
		},
		store: new MongoStore({ mongooseConnection: mongoose.connection })
	  }));
	  
	//We cache the location data as it takes 8 seconds to load. So that It is loaded when the app is installed.
    const promise = new Promise(function(resolve, reject) {
		// retrieve the data from API
        const locationData = dataRet.RetrieveData();
		console.log(locationData);
		resolve(locationData);
  
    });
	app.set('promise', promise);
	
	// Passport middleware
	app.use(passport.initialize());
	app.use(passport.session());
	
	// Connect flash
	app.use(flash());
	
	// Global variables
	app.use(function(req, res, next) {
	  res.locals.success_msg = req.flash('success_msg');
	  res.locals.error_msg = req.flash('error_msg');
	  res.locals.error = req.flash('error');
	  next();
	});

	const { ensureAuthenticated } = require('./config/auth');
	const { ensureSubscriptionActive } = require('./config/roles');

	//Routers 
	app.use('/', introRouter);
	app.use('/index', ensureAuthenticated, ensureSubscriptionActive, landingRouter);
	app.use('/users', usersRouter);
	app.use('/payment', paymentRouter);
	app.use('/all',ensureAuthenticated, ensureSubscriptionActive, allHeatDataRouter);
	app.use('/currenthour', ensureAuthenticated, ensureSubscriptionActive, currentHour);
	app.use('/wd', ensureAuthenticated, ensureSubscriptionActive, weekDayDataRouter);

	app.get('/drivers/:city', ensureAuthenticated, ensureSubscriptionActive, async function(req, res) { 
	
	var city = req.params.city
	var defaultMapPosition
	var headTitle

	var pageData = {};
	pageData.description = "Chcete sa vyhnúť nekonečným prestojom vo Vašom meste, alebo ste sa ocitli v časti mesta ktoré nepoznáte a nechcete prejazdiť kopec kilometrov navyše ? Mapa hotspotov tento problém výrieši a zvýši Vaše zisky, pomôže Vám odhadnúť odkial príde ďalšia objednávka."
	pageData.siteName = "Horúce miesta vo Vašom meste"; 
	pageData.user = req.user

	if(city == "ba"){
		defaultMapPosition =  [48.1485, 17.1077];
		headTitle = "Bolt Driver Position Map Bratislava";
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

	if(city == "jnb"){
		defaultMapPosition = [-26.1952, 28.0340];
		headTitle = "Bolt Hotspot Map Johannesburg";
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
		
		if(city == "bb" || city == "ba" || city == "ke" || city == "nr" || city == "prg" || city == "jnb"){
		
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

				pageData.headTitle = headTitle;
				pageData.city = city;
				pageData.mapPosition = defaultMapPosition, 
				pageData.drivers = driversDataArray;
				pageData.police = policeDataArray;
				//pageData.morning = getDayPeakDataAll( 'Morning' ); 
				//pageData.noon = getDayPeakDataAll( 'Noon' ); 
				//pageData.afternoon = getDayPeakDataAll( 'Afternoon' );
				//pageData.evening = getDayPeakDataAll( 'Evening' ); 
				//pageData.night = getDayPeakDataAll( 'Night' ); 

				if(city === "prg"){ 

					pageData.morning = getDayPeakDataAll( 'Morning' ); 
				 	pageData.noon = getDayPeakDataAll( 'Noon' ); 
				 	pageData.afternoon = getDayPeakDataAll( 'Afternoon' );
				 	pageData.evening = getDayPeakDataAll( 'Evening' ); 
					pageData.night = getDayPeakDataAll( 'Night' ); 

				 	res.render('pages/czechRepublic', pageData);
				}

				else if (city === "jnb"){
					pageData.morning = getDayPeakDataAll( 'Morning' ); 
					pageData.noon = getDayPeakDataAll( 'Noon' ); 
					pageData.afternoon = getDayPeakDataAll( 'Afternoon' );
					pageData.evening = getDayPeakDataAll( 'Evening' ); 
					pageData.night = getDayPeakDataAll( 'Night' );
					pageData.siteName = "Hot Spots in your city";
					pageData.description = "If you don't want wait for the next ride request forever, hotspot map will help you to find places where the demand for the ride is highest ";
					
					pageData.drivers = [];
					pageData.police = [];
					
					res.render('pages/southAfricaRepublic', pageData);
				}


				else{

					pageData.morning = getDayPeakDataWD( 'Morning' ); 
					pageData.noon = getDayPeakDataWD( 'Noon' ); 
					pageData.afternoon = getDayPeakDataWD( 'Afternoon' );
					pageData.evening = getDayPeakDataWD( 'Evening' ); 
					pageData.night = getDayPeakDataWD( 'Night' );

					res.render('pages/index', pageData);
				}
			}) 
						
		}
		else { 
			 
			res.render('pages/drivers', {headTitle: headTitle, mapPosition: defaultMapPosition, drivers: driversDataArray,	police: policeDataArray, city: city, siteName: pageData.siteName, description: pageData.description, user:req.user });
				
		}
		
	} catch (err) {}
	})

	//process.env.PORT = 443
	var port = process.env.PORT || 3000;

	var options = {
		key: process.env.SERVER_KEY,
		cert: process.env.SERVER_CERT,
	};

	var server = app.listen(port, function () {
		console.log('Server running at http://127.0.0.1:' + port + '/');
	});
	
	// var server = https.createServer(options, app).listen(port, function(){
	// 	console.log("Express server listening on port " + port);
	// });
}
