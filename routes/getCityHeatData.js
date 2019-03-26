var express = require('express');
var bodyParser = require('body-parser');
const driversRet = require("../lib/retrieveDrivers");
var time = require('time');
var router = express.Router();


/* GET heat data for specific city page. */
router.get('/:city', function(req, res) {  

	var city = req.params.city;
	var promise = req.app.get('promise');

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
				
				try {
					const driversData = await driversRet.getDriversData(city);

					var driversDataArray = [];
					for (var driver of driversData){
						driversDataArray.push([driver.lat ,driver.lng ]);
					}	
				
					res.render('pages/index', {headTitle: headTitle, mapPosition: defaultMapPosition, morning: morningLatLngs, noon: noonLatLngs, afternoon: afternoonLatLngs, evening: eveningLatLngs, night: nightLatLngs, drivers: driversDataArray});
				} catch (err) {}
			
			}) 
						
		} else { 
			 
			res.render('pages/drivers', {headTitle: headTitle, mapPosition: defaultMapPosition, drivers: driversDataArray});
				
		}
		

  
  
});

module.exports = router;
