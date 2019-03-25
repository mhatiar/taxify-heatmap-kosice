var express = require('express');
var bodyParser = require('body-parser');
var time = require('time');
const dataRet = require("../lib/retrieve");
const driversRet = require("../lib/retrieveDrivers");
var router = express.Router();

const promise = new Promise(function(resolve, reject) {
   // retrieve the data from API
   const locationData = dataRet.RetrieveData();
   console.log(locationData);
   resolve(locationData);
  
});


/* GET home page. */
router.get('/', function(req, res, next) {
	var headTitle = "Bolt Heat Map Košice";	
	var city = 'ke';
	var defaultMapPosition = [48.7171, 21.2494];
	var SCALAR_E7 = 0.0000001
	
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
			 const driversData = await driversRet.RetrieveData(city);

			var driversDataArray = [];
			for (var driver of driversData){
				driversDataArray.push([driver.lat ,driver.lng ]);
			}
			//console.log(driversDataArray);
			 
			res.render('pages/index', {headTitle: headTitle, mapPosition: defaultMapPosition, morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night: nightLatLngs, drivers: driversDataArray});
			 
		} catch (err) {}
		
	}) 
  
  
  
});

module.exports = router;
