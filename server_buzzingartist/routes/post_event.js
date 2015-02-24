var User = require('../models/user.js');
var FB            = require('fb');
var Event = require('../models/event.js');

exports.postevents = function (req, res) {
	console.log("coming here posting an event");
    res.render('postevent', { user: req.session.user});
};

exports.posteventDetails = function (req, res) {
	var allUsers;
            console.log("req.body.eventid " + req.body.eventId);
           
                FB.api(
                            '/' + req.body.eventId + '?access_token=' + req.session.fbAccessToken,
                            function (response) {
                                if (response) {

                                    Event.findOne({ 'event.eventId' : req.body.eventId }, function(err, event) {
                                            if (err) {
                                                return done(err);
                                                console.log("Error in retrieving" + err);
                                             }   
                                            // if the user is found, then log them in
                                            if (event) {
                                             console.log("sorry that Event is already registered");
                                            } else {

                                            
                                                var newEvent            = new Event();
                                                
                                                // set all of the facebook information in our user model
                                                newEvent.event.userid    = req.session.user._id; 
                                                newEvent.event.eventId    = req.body.eventId;
                                                newEvent.event.date    = response.start_time;
                                                newEvent.event.city = response.venue.city; 
                                                newEvent.event.eventCategory = req.body.category; 
                                                newEvent.event.title = response.name; 
                                                newEvent.event.link = "https://www.facebook.com/events/" + req.body.eventId; 

                                                FB.api(
                                                        '/' + req.body.eventId + '/picture',
                                                        {
                                                            "redirect": false,
                                                            "width": "500",
                                                            "height":"500"
                                                        },
                                                        function(response) {

                                                            if (response && !response.error) {
                                                                newEvent.event.eventcover = response.data.url; 
                                                                console.log("event picture url " + response.data.url);
                                                                newEvent.save(function(err) {
                                                                    if (err)
                                                                        throw err;
                                                                });   
                                                             } else {
                                                                console.log("error");
                                                             }   
                                                         }        
                                               );
                                            }
                                        });    
                                }   
 
                        });               
        
            res.redirect('/home');
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
                            
                res.render('search_events', { user: req.session.user, allEvents: events});

                
            });
};