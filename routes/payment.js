const express = require('express');
var request = require('request');
var querystring = require('querystring');

const router = express.Router();
// Load User model
const User = require('../models/User');
const Payment = require('../models/Payment');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var ObjectId = require('mongodb').ObjectId

router.post('/ipn', function(req, res) {

	console.log(req.body)

	// STEP 1: read POST data
	req.body = req.body || {};
	res.status(200).send('OK');
	res.end();

	// read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'	
	let postreq = 'cmd=_notify-validate';
	Object.keys(req.body).map((key) => {
        	postreq = `${postreq}&${key}=${req.body[key]}`;
        	return key;
      	});

	// Step 2: POST IPN data back to PayPal to validate
	var options = {
		url: 'https://ipnpb.paypal.com/cgi-bin/webscr',
		method: 'POST',
		headers: {
			'Connection': 'close'
		},
		body: postreq,
		strictSSL: true,
		rejectUnauthorized: false,
		requestCert: true,
		agent: false
	};

	request(options, function callback(error, response, body) {
		if (!error && response.statusCode === 200) {

			// inspect IPN validation result and act accordingly
			//if (body.substring(0, 8) === 'VERIFIED') {
				// The IPN is verified, process it
				//console.log('Verified IPN!');

				// assign posted variables to local variables
				var item_name = req.body['item_name'];
				var item_number = req.body['item_number']; //This is where the product is
				var payment_status = req.body['payment_status'];
				var payment_amount = req.body['mc_gross'];
				var payment_currency = req.body['mc_currency'];
				var txn_id = req.body['txn_id'];
				var receiver_email = req.body['receiver_email'];
				var payer_email = req.body['payer_email'];

				//Lets check a variable
				//check unique txn_id , receiver_email = me
				
				Payment.findOne({ transactionID: txn_id }).then(transaction => {
					if(transaction){
						// Duplicated Transaction,

					} else {
						if(payment_status === 'Completed'){
							var CurrentDateBasic = new Date(); 
							// 14 days for basic subscription  
							var newDateBasic = CurrentDateBasic.setDate(CurrentDateBasic.getDate() + 14);
							// 1 Month for advanced subscription  
							var CurrentDateAdvanced = new Date(); 
							var newDateAdvanced = CurrentDateAdvanced.setMonth(CurrentDateAdvanced.getMonth() + 1)
							
							const newPayment = new Payment({
								transactionID: txn_id,
								email: req.body['payer_email'],
								paymentDate: new Date()
							});

							if(req.body['mc_gross'] == 2.00){
								newPayment.paymentAmount = req.body['mc_gross'],
								newPayment.subscriptionType = "basic",
								newPayment.subscriptionUntil = newDateBasic
							}
							if(req.body['mc_gross'] == 3.50){
								newPayment.paymentAmount = req.body['mc_gross'],
								newPayment.subscriptionType = "advanced",
								newPayment.subscriptionUntil = newDateAdvanced
							}
							newPayment.save();

							//Update User Table
							User.findOne({ email: req.body['payer_email'] }).then( user => {
								user.subscriptionUntil = newPayment.subscriptionUntil
								user.subscriptionStatus = "active"
								user.save()
							  });

						}
					}
				 })

			//} else if (body.substring(0, 7) === 'INVALID') {
			//	// IPN invalid, log for manual investigation
			//	console.log('Invalid IPN!');
			//	console.log('\n\n');
			//}
		}
	});
});

module.exports = router;
