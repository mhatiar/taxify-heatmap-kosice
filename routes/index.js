var express = require('express');
var bodyParser = require('body-parser');
var time = require('time');
const driversRet = require("../lib/retrieveDrivers");
const wazeRet = require("../lib/retrieveWaze");
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  var headTitle = "Bolt Heat Map Košice";
	var city = 'ke';
	var defaultMapPosition = [48.7171, 21.2494];
	
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
	var promise = req.app.get('promise');
	
        promise.then(async function(resultAll) {
	    var locations = resultAll[0]["locations"];
		
	    var result = locations.filter(function (item) {
	        return item.weekDay === weekDayParam;
	    });
		
	    function getDayPeakData( peakPeriod ) {
	        return result.filter(function (item) {  return item.timeOfDay === peakPeriod;})
			.map( function(item){ return [item.latitudeE7 * SCALAR_E7, item.longitudeE7 * SCALAR_E7]; })
	    }
		
		try {
			const driversData = await driversRet.RetrieveData(city);

			var driversDataArray = [];
			var policeDataArray = [];
			for (var driver of driversData){
				driversDataArray.push([driver.lat ,driver.lng ]);
			}
			
			const policeData = await wazeRet.RetrieveData(city);

			var policeDataArray = [];
			for (var policePatrol of policeData){
				policeDataArray.push([policePatrol.lat ,policePatrol.lng ]);
			}
			
				var pageData = { 
					headTitle: headTitle, 
					mapPosition: defaultMapPosition, 
					city: city,
					morning: getDayPeakData( 'Morning' ), 
					noon: getDayPeakData( 'Noon' ), 
					afternoon: getDayPeakData( 'Afternoon' ), 
					evening: getDayPeakData( 'Evening' ), 
					night: getDayPeakData( 'Night' ), 
					drivers: driversDataArray,
					police: policeDataArray
				}
			 
			res.render('pages/index', pageData);
			 
		} catch (err) {}
	    
	})    
  
  
  
});

module.exports = router;
