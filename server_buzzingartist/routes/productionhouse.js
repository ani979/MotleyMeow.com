var ProductionHouse = require('../models/productionhouse.js');

var dropdowns = require('../views/js/theatreContrib.js');

var app = require('../app.js');

var express = require('express');
var multer  = require('multer');

 exports.postDPPhoto = function(req,res) {
    console.log(JSON.stringify(req.files));
    //res.send({path: req.files.image});
}


exports.update = function (req, res) {
var id = "";
 var pfolioPlays;

if(typeof req.body.mypfolioPlays != 'undefined' && req.body.mypfolioPlays.length > 0) {
    console.log(" req.body.mypfolioPlays.length " + req.body.mypfolioPlays.length);
    pfolioPlays = JSON.parse(req.body.mypfolioPlays);
    
  }


	 if(typeof req.query.fbId == 'undefined') {
                id = req.session.user.facebook.id;
            } else {
                id = req.query.fbId;
            }
id = id+req.session.i;

    ProductionHouse.findOne({ 'local.PHid' : id }, function(error, db) {
      
        console.log("coming 1");
        if (error || !db) {
            console.log("ERRPRRR");
            
        } else {
        
             console.log("reached here.");
           
            if(req.body.btnvalue == "submit") {
            console.log("i am submit");
               db.local.myname = req.body.myname ;
               db.local.establishedIn = req.body.est ;
               db.portfolio.myself = req.body.myself ;
                db.portfolio.myjourney = req.body.myjourney ;

                db.portfolio.myAddress = req.body.myAddress ;
               db.local.contact = req.body.contact ;
                db.local.city = req.body.city;
                db.local.ownername = req.body.ownername ;
                 db.portfolio.myPlays = pfolioPlays ;
                 db.portfolio.myHoursOfOperation = req.body.myHoursOfOperation ;
file = req.session.filename ;
console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy" + file);
                 db.local.picture = "./storagePH/" + req.session.user.facebook.id+req.session.i + "/pictures/"  + file ;
              





                console.log("reachd123");
               // update the user object found using findOne
              }


     db.save(function (err, user) {
                   if (err) {
                        console.log("ERRRORRRR");
                        // res.json(err) ;
                        req.flash('info', "Error while saving the new email in the database")
                        res.redirect('/error');
                        return done(err);
                    }

                res.redirect('/profileProductionHouse');

                  
               });

        }
           
                      } );
   

    
	};