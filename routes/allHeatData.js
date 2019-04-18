var express = require('express');
var bodyParser = require('body-parser');
var time = require('time');
const driversRet = require("../lib/retrieveDrivers");
var router = express.Router();

/* GET all data page. */
router.get('/', function(req, res, next) {
	var headTitle = "Bolt Heat Map Košice";	
	var city = 'ke';
	var defaultMapPosition = [48.7171, 21.2494];
	var SCALAR_E7 = 0.0000001
	var promise = req.app.get('promise');
	
    promise.then(async function(resultAll) {
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
		
		try {
			 //const driversData = await driversRet.RetrieveData(city);

			var driversDataArray = [];
			var policeDataArray = [];
			//for (var driver of driversData){
			//	driversDataArray.push([driver.lat ,driver.lng ]);
			//}
			
			var pageData = { 
					headTitle: headTitle, 
					city: city,
					mapPosition: defaultMapPosition, 
					morning: morningLatLngs, 
					noon: noonLatLngs, 
					afternoon: afternoonLatLngs, 
					evening: eveningLatLngs, night: nightLatLngs, 
					drivers: driversDataArray,
					police: policeDataArray
				}
			 
			res.render('pages/index', pageData);
			 
		} catch (err) {}
		
	}) 
  
  
  
});

module.exports = router;
