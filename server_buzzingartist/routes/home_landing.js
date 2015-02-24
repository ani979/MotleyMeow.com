var FB              = require('fb'),
    config          = require('../config');
var User = require('../models/user');
var Posts = require('../models/posts.js');
var Event = require('../models/event.js');

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    redirectUri:    config.facebook.redirectUri
});

var profile = {
    firstName:'',
    fullName:'',
    email:'',
    gender:'',
};

exports.index = function(req, res) {

    // req.session = null;
    // if(req.session == null) {
    //     res.render('index', {
    //             title: 'Express',
    //             loginUrl: FB.getLoginUrl({ scope: 'user_about_me' })                
    //         });
    // }
    var accessToken = req.session.access_token;
    console.log("accesstoken: "+ accessToken);

    if(!accessToken) {
        console.log("isAuthenticatedddddddd: "+ req.isAuthenticated());
        if(req.isAuthenticated()) {
            res.redirect('/home');
        } else {
                res.render('index', {
                title: 'Express',
                loginUrl: FB.getLoginUrl({ scope: 'user_about_me' })                
            });
        }
    } else {
        // res.render('home');
        res.redirect('/home');
    }
};

exports.logout = function (req, res) {
    console.log("LOGOUTTTTT");
    req.session = null; // clear session
    res.redirect('/');
};


exports.profile = function (req, res) {
    var accessToken = req.session.access_token;
    console.log("accesstoken111: "+ accessToken);
    if(!accessToken) {
        console.log("isAuthenticatedddddddd222: "+ req.isAuthenticated());
        if(req.isAuthenticated()) {
            console.log("req.user city " + req.session.user.local.city);
            console.log("req.user name " + req.session.user.facebook.name);
            res.render('profileEdit', { user: req.session.user });
        } else {
                res.redirect('/');
            
        }
    } else {
        // res.render('home');
        res.redirect('/');
    }
};

exports.landing_home = function(req, res) {
	console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            var posts; 
            var events;
            var playEvents=null;;
            var workshopEvents=null;
            var otherEvents=null;


            User.find( function ( err, users, count ){

                if(err) {
                    // res.render('index');
                    req.flash('info', "Error while trying to find the user")
                    res.redirect('/error'); 
                    return done(err);
                }

                allUsers = users;
                var then = new Date();
                then.setDate(then.getDate() - 2);
                //Get all posts
                Posts.aggregate([{ $match: { $and: [ { 'post.city': { $in: [ "Bengaluru", "Bangalore" ] } }, 
                                    { 'post.date': { $gte: new Date(then.toISOString()) } } ] } } , {$limit:5}],
                                    function(err, postsinDB) {
                    console.log("I am here and err is " + err);
                    console.log("posts is " + postsinDB.length);
                    if(!err) {
                        posts = postsinDB;
                    } else {
                        posts = {};
                    }

                    Event.find({ $and: [ { 'event.city': { $in: [ "Bengaluru", "Bangalore" ] } }, 
                                    { 'event.date': { $gte: new Date(new Date().toISOString()) } } ] },
                                {event:1}, function(err, eventsInDB) {
                        console.log("Event in DB " + eventsInDB)
                        if(err) {
                            events = {};
                            console.log("Am i here");
                            res.render('Landing', { user: req.session.user, users: allUsers, postss: posts, events: events});
                        }
                        
                        console.log("eventsInDB " + eventsInDB.length);
                        Event.distinct('event', {$and: [ { 'event.city': { $in: [ "Bengaluru", "Bangalore" ] } }, 
                                    { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Play" }]}
                                    , function(err, allPlays) {
                                        
                            playEvents = allPlays;
                            playEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                            console.log("plays length is "  + allPlays.length);
                            Event.distinct('event', {$and: [ { 'event.city': { $in: [ "Bengaluru", "Bangalore" ] } }, 
                                    { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Workshop" }]}
                                    , function(err, allWorkshops) {
                                        console.log("Workshops length is "  + allWorkshops.length);
                                workshopEvents = allWorkshops;
                                workshopEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                                Event.distinct('event', {$and: [ { 'event.city': { $in: [ "Bengaluru", "Bangalore" ] } }, 
                                    { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Others" }]}
                                    , function(err, allOthers) {
                              
                                    otherEvents = allOthers;
                                    otherEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                                    res.render('Landing', 
                                        { user: req.session.user, 
                                            users: allUsers, 
                                            postss: posts, events: eventsInDB,
                                            plays:playEvents, workshops:workshopEvents,others:otherEvents
                                            });
                                });
                            });        
                        });    

                        
                    });

                });    

            });
};