const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const Payment = require('../models/Payment');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var ObjectId = require('mongodb').ObjectId

router.get('/successBasic', ensureAuthenticated, function (req, res) {
    var CurrentDate = new Date(); 
    // 14 days for basic subscription  
    var newDate = CurrentDate.setDate(CurrentDate.getDate() + 14);

    const newPayment = new Payment({
      name: req.user.name,
      email: req.user.email,
      paymentDate: new Date(),
      paymentAmount: 2.00 ,
      subscriptionType: "basic",
      subscriptionUntil : newDate  
    });

    newPayment.save();

    var o_id = new ObjectId(req.user._id)
    User.findById(o_id, function(err, user) {
      user.subscriptionUntil = newDate
      user.subscriptionStatus = "active"
      user.save().then(user => {
        res.redirect('/');
      })
    });
    
  });

router.get('/successAdvanced', ensureAuthenticated, function (req, res) {
  var CurrentDate = new Date(); 
    // 1 Month for advanced subscription  
  var newDate = CurrentDate.setMonth(CurrentDate.getMonth() + 1)

  const newPayment = new Payment({
    name: req.user.name,
    email: req.user.email,
    paymentDate: new Date(),
    paymentAmount: 3.50 ,
    subscriptionType: "advanced",
    subscriptionUntil : newDate  
  });

  newPayment.save();

  var o_id = new ObjectId(req.user._id)
  User.findById(o_id, function(err, user) {
    user.subscriptionUntil = newDate
    user.subscriptionStatus = "active"
    user.save().then(user => {
      res.redirect('/');
    });
  });
  

  
});

module.exports = router;