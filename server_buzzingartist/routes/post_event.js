var User = require('../models/user.js');
var FB            = require('fb');
var Event = require('../models/event.js');
var dropdowns = require('../views/js/theatreContrib.js');

exports.postevents = function (req, res) {
	console.log("coming here posting an event");
    res.render('postevent', { user: req.session.user, dropdowns:dropdowns});
};

exports.posteventDetails = function (req, res) {
	var allUsers;
            console.log("req.body.eventid " + req.body.eventId);
           
                FB.api(
                            '/' + req.body.eventId + '?access_token=' + req.session.fbAccessToken + '&appsecret_proof=' + req.session.hashValue,
                            function (response) {
                                if (response) {

                                    Event.findOne({ 'event.eventId' : req.body.eventId }, function(err, event) {
                                            if (err) {
                                                console.log("Error in retrieving" + err);
                                                req.flash('info', "Error while retrieving the event.")
                                                res.redirect('/error')
                                                return done(err);
                                            }   
                                            // if the user is found, then log them in
                                            if (event) {
                                             console.log("sorry that Event is already registered");
                                             req.flash('info', "Sorry that event is already registered.")
                                             res.redirect('/error')
//                                             res.render('postevent', {user: req.session.user, infomessage: "Sorry, something went wrong, This event is already in our DB. Please call inform us if its a mistake from our side. Thanks."});
                                            } else {
                                              console.log("req.body.city is " + req.body.city);
                                            
                                                var newEvent            = new Event();
                                                
                                                // set all of the facebook information in our user model
                                                newEvent.event.userid    = req.session.user._id; 
                                                newEvent.event.eventId    = req.body.eventId;
                                                newEvent.event.date    = response.start_time;
                                                newEvent.event.city = req.body.city; 
                                                newEvent.event.eventCategory = req.body.category; 
                                                console.log(" response.name;  " + response.name);
                                                newEvent.event.title = response.name; 
                                                newEvent.event.link = "https://www.facebook.com/events/" + req.body.eventId; 
                                                newEvent.event.user    = req.session.user; 

                                                FB.api(
                                                        '/' + req.body.eventId + '/?fields=cover' + '&access_token=' + req.session.fbAccessToken + '&appsecret_proof=' + req.session.hashValue,
                                                        function(response) {

                                                            if (typeof response.cover != 'undefined' && !response.error) {
                                                                newEvent.event.eventcover = response.cover.source; 
                                                                console.log("event picture url " + response.cover.source);
                                                                newEvent.save(function(err) {
                                                                    if (err) {
                                                                        console.log("error is " + err);
                                                                        req.flash('info', "Error while saving the event. Either its already present or some error in retrieving details from Facebook.")
                                                                        res.redirect('/error');
                                                                    }
                                                                        
                                                                    res.redirect('/home');   
                                                                });   
                                                             } else {
                                                                console.log("error");
                                                                req.flash('info', "Error while saving the event. Either its already present or some error in retrieving details from Facebook.")
                                                                res.redirect('/error');
                                                             }   
                                                         }        
                                               );
                                            }
                                        });    
                                }   
 
                        });               
        
            
};

exports.allEvents = function (req, res) {
	        console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            var events; 
            Event.distinct('event', { 'event.date': { $gte: new Date(new Date().toISOString()) } },function(err, eventsinDB) {
                console.log("here");
                if(err) {
                    console.log("some error occurred in saving");
                    res.render('search_events', { user: req.session.user, allEvents: {}});
                    
                }
                events = eventsinDB;
                           
                console.log("events length is " + events.length);
                            
                res.render('search_events', { user: req.session.user, allEvents: events, dropdowns:dropdowns});

                
            });
};