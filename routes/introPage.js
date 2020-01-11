const express = require("express");
var router = express.Router();

const User = require('../models/User');
var ObjectId = require('mongodb').ObjectId

// Log a user out
router.get("/", (req, res) => {

    var pageData = {
        user: req.user,
        description : "Chcete sa vyhnúť nekonečným prestojom vo Vašom meste, alebo ste sa ocitli v časti mesta ktoré nepoznáte a nechcete prejazdiť kopec kilometrov navyše ? Mapa hotspotov tento problém výrieši a zvýši Vaše zisky, pomôže Vám odhadnúť odkial príde ďalšia objednávka.",
        siteName : "Horúce miesta vo Vašom meste",
        headTitle : "Bolt Driver Hotspot Map",
        city : 'ke'
    }

    if(req.user){
 
            if(req.user.subscriptionStatus === "inactive"){
                res.render('pages/subscribe', pageData);
            }else{
                res.redirect('/index');
            }
           
    }else{
        res.render('pages/unauthenticated', pageData);
    }
});


module.exports = router;