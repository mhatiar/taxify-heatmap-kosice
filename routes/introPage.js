const express = require("express");


var router = express.Router();

// Log a user out
router.get("/", (req, res) => {
    if(req.user){
        if(req.user.subscriptionStatus === "inactive"){
            res.render('pages/subscribe', {user: req.user});
        }else{
            res.redirect('/index');
        }
        
    }else{
        res.render('pages/unauthenticated');
    }
});


module.exports = router;