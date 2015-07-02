var ProductionHouse = require('../models/productionhouse.js');
var User = require('../models/user.js');

var dropdowns = require('../views/js/theatreContrib.js');

var app = require('../app.js');

var express = require('express');
var multer  = require('multer');

 exports.postDPPhoto = function(req,res) {
    console.log(JSON.stringify(req.files));
    //res.send({path: req.files.image});
}


exports.update = function (req, res) {

 var pfolioPlays;

if(typeof req.body.mypfolioPlays != 'undefined' && req.body.mypfolioPlays.length > 0) {
    console.log(" req.body.mypfolioPlays.length " + req.body.mypfolioPlays.length);
    pfolioPlays = JSON.parse(req.body.mypfolioPlays);
    
  }


    ProductionHouse.findOne({ '_id' : req.session.valph }, function(error, db) {
      
     console.log(db._id + "bhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
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
                 db.local.picture = "./storagePH/" + req.session.user.facebook.id+req.session.valph + "/pictures/"  + file ;
              





                console.log("reachd123");
               // update the user object found using findOne
              }


     db.save(function (err, user) {
                   if (err) {
                        console.log("ERRRORRRR");
                      
                    }

                res.redirect('/profileProductionHouse');

                  
               });

        }
           
                      } );
   

    
  };


exports.add = function (req, res) {


var pfolioPlays;

if(typeof req.body.mypfolioPlays != 'undefined' && req.body.mypfolioPlays.length > 0) {
    console.log(" req.body.mypfolioPlays.length " + req.body.mypfolioPlays.length);
    pfolioPlays = JSON.parse(req.body.mypfolioPlays);
    
  }

 var fbid = "";

            if(typeof req.query.fbId == 'undefined') {
                fbid = req.session.user.facebook.id;
            } else {
                fbid = req.query.fbId;
            }
            User.findOne({ 'facebook.id' : fbid}, function(error, db) {
               db.local.PHid = db.local.PHid + req.session.valph + " " ;

     db.save(function (err, user) {
                   if (err) {
                        console.log("ERRRORRRR");
                       
                        req.flash('info', "Error while saving the new email in the database");
                        res.redirect('/error');
                        return 1;
                    }

                res.redirect('/profileProductionHouse');

                  
               });
                });

    ProductionHouse.findOne({ '_id' : req.session.valph }, function(error, db) {
      
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
                 db.local.picture = "./storagePH/" + req.session.user.facebook.id+req.session.valph + "/pictures/"  + file ;
              




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




















