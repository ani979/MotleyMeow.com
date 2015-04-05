var FB              = require('fb');
    // config          = require('../config');
var User = require('../models/user');
var Posts = require('../models/posts.js');
var Event = require('../models/event.js');
var dropdowns = require('../views/js/theatreContrib.js');
var config        = require('../oauth.js')


/*FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    redirectUri:    config.facebook.redirectUri
});*/
// configure upload middleware 

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
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if(!accessToken) {
        console.log("isAuthenticatedddddddd: "+ req.isAuthenticated());
        if(req.isAuthenticated()) {
            res.redirect('/home');
        } else {
            User.count(function(err, uCnt) {
               if(err) {
                res.render('index');    
               }
               Posts.count(function(err, pCnt) {
                if(err) {
                    res.render('index', {aCount:uCnt});    
                }
                Event.count(function(err, eCnt) {
                    if(err) {
                        res.render('index', {aCount:uCnt, pCount:pCnt});    
                    } 
                    res.render('index', {aCount:uCnt, pCount:pCnt, eCount:eCnt});    
                    
                });    
               }); 
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
    var fbid = "";
    console.log("accesstoken111: "+ accessToken);
    if(!accessToken) {
        console.log("isAuthenticatedddddddd222: "+ req.isAuthenticated());
        if(req.isAuthenticated()) {
            console.log("req.user city " + req.session.user.local.city);
            console.log("req.fbId " + req.query.fbId);
            if(typeof req.query.fbId == 'undefined') {
                fbid = req.session.user.facebook.id;
            } else {
                fbid = req.query.fbId;
            }
            console.log("req.user name " + req.session.user.facebook.name);
            User.findOne({ 'facebook.id' : fbid}, function(error, db) {
                res.render('profileView', { user: db, dropdowns:dropdowns, sessionUser: req.session.user});
            });    
        } else {
            res.redirect('/');
            
        }
    } else {
        // res.render('home');
        res.redirect('/');
    }
};

exports.profileEdit = function (req, res) {
    var accessToken = req.session.access_token;
    console.log("accesstoken111: "+ accessToken);
    if(!accessToken) {
        console.log("isAuthenticatedddddddd222: "+ req.isAuthenticated());
        if(req.isAuthenticated()) {

            res.render('profileEdit', { user: req.session.user, dropdowns:dropdowns});
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
    var posts; 
    var events;
    var playEvents=null;;
    var workshopEvents=null;
    var otherEvents=null;
    var foundUser = req.session.user
    var then = new Date();

    // User.find( function ( err, users, count ){

    //     if(err) {
    //         // res.render('index');
    //         req.flash('info', "Error while trying to find the user")
    //         res.redirect('/error'); 
    //         return done(err);
    //     }

    //     allUsers = users;
    //     var then = new Date();
    then.setDate(then.getDate() - 2);
    var selectedCity = new Array();
    console.log(" foundUser.local.city " + foundUser.local.city)
    if(typeof foundUser.local.city != 'undefined' && foundUser.local.city != "") {
        if(foundUser.local.city == "Bengaluru" || foundUser.local.city == "Bangalore") {
            selectedCity.push("Bangalore", "Bengaluru");
        } else if(foundUser.local.city == "Calcutta" || foundUser.local.city == "Kolkata") {
            selectedCity.push("Calcutta", "Kolkata");
        } else if(foundUser.local.city == "Mumbai" || foundUser.local.city == "Bombay") {
            selectedCity.push("Mumbai", "Bombay");
        } else if (foundUser.local.city != "None") {
            selectedCity.push(foundUser.local.city);
        }
    }
    
    
    console.log("selected city " + selectedCity)
    console.log("selected City length " + selectedCity.length)
    //Get all posts
    if(typeof selectedCity != undefined && selectedCity.length != 0) {
        Posts.aggregate([{ $match: { $and: [ { 'post.city': { $in: selectedCity } }, 
                            { 'post.date': { $lte: new Date() } } ] } } , { $sort : { 'post.date' : -1 } }, {$limit:5}],
                            function(err, postsinDB) {
             if (err || typeof postsinDB == 'undefined') {
                console.log("Error while getting posts");
                // res.send({ error: error }); 
                req.flash('info', "Error while retrieving posts")
                res.render('Landing', { user: req.session.user, postss: {}, events: {}, appId:config.facebook.clientID, dropdowns:dropdowns});
                return;       
             }    

            console.log("posts is " + postsinDB.length);
            if(!err) {
                posts = postsinDB;
            } else {
                posts = {};
            }

            Event.aggregate([{ $match: { $and: [ { 'event.city': { $in: selectedCity } }, 
                            { 'event.date': { $gte: new Date(new Date().toISOString()) } } ] } }, { $sort : { 'event.date' : 1 } }, {$limit:5}]
                        , function(err, eventsInDB) {
                if(err) {
                    events = {};
                    console.log("Am i here");
                    res.render('Landing', { user: req.session.user, postss: posts, events: events, appId:config.facebook.clientID, dropdowns:dropdowns});
                } 
                    User.aggregate([{ $match: { 'local.joiningDate': { $lte: new Date() } } } , { $sort : { 'local.joiningDate' : -1 } }, {$limit:5} ],
                            function(err, recentUsers) {
                              res.render("Landing", {user: req.session.user, postss: posts, events: eventsInDB, users:recentUsers,
                              appId:config.facebook.clientID, dropdowns:dropdowns})
                    });

                
                // console.log("eventsInDB " + eventsInDB.length);
                // Event.distinct('event', {$and: [ { 'event.city': { $in: selectedCity } }, 
                //             { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Play" }]}
                //             , function(err, allPlays) {
                                
                //     playEvents = allPlays;
                //     playEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                //     console.log("plays length is "  + allPlays.length);
                //     Event.distinct('event', {$and: [ { 'event.city': { $in: selectedCity } }, 
                //             { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Workshop" }]}
                //             , function(err, allWorkshops) {
                //                 console.log("Workshops length is "  + allWorkshops.length);
                //         workshopEvents = allWorkshops;
                //         workshopEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                //         Event.distinct('event', {$and: [ { 'event.city': { $in: selectedCity } }, 
                //             { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Others" }]}
                //             , function(err, allOthers) {
                      
                //             otherEvents = allOthers;
                //             otherEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                //             res.render('Landing', 
                //                 { user: req.session.user, 
                //                     postss: posts, events: eventsInDB,
                //                     plays:playEvents, workshops:workshopEvents,others:otherEvents
                //                     });
                //         });
                //     });        
                // });    

                
            });

        });    
    } else {
            Posts.aggregate([{ $match: { 'post.date': { $lte: new Date() } } } , { $sort : { 'post.date' : -1 } }, {$limit:5}],
                            function(err, postsinDB) {
             if (err || typeof postsinDB == 'undefined') {
                console.log("Error while getting posts");
                // res.send({ error: error }); 
                req.flash('info', "Error while retrieving posts")
                res.render('Landing', { user: req.session.user, postss: {}, events: {}, appId:config.facebook.clientID, dropdowns:dropdowns } );
                return;       
             }    

            console.log("posts is " + postsinDB.length);
            if(!err) {
                posts = postsinDB;
            } else {
                posts = {};
            }

            Event.aggregate([{ $match: { 'event.date': { $gte: new Date() } } }, { $sort : { 'event.date' : 1 } }, {$limit:5}],
                        function(err, eventsInDB) {
                if(err) {
                    events = {};
                    console.log("Am i here");
                    res.render('Landing', { user: req.session.user, postss: posts, events: events, appId:config.facebook.clientID});
                    return;
                }
                    User.aggregate([{ $match: { 'local.joiningDate': { $lte: new Date() } } } , { $sort : { 'local.joiningDate' : -1 } }, {$limit:5} ],
                            function(err, recentUsers) {
                              res.render("Landing", {user: req.session.user, postss: posts, events: eventsInDB, users:recentUsers,
                              appId:config.facebook.clientID, dropdowns:dropdowns})
                    });
                // console.log("eventsInDB " + eventsInDB.length);
                // Event.distinct('event', {$and: [ { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Play" }]}
                //             , function(err, allPlays) {
                                
                //     playEvents = allPlays;
                //     playEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                //     console.log("plays length is "  + allPlays.length);
                //     Event.distinct('event', {$and: [ { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Workshop" }]}
                //             , function(err, allWorkshops) {
                //                 console.log("Workshops length is "  + allWorkshops.length);
                //         workshopEvents = allWorkshops;
                //         workshopEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                //         Event.distinct('event', {$and: [ { 'event.date': { $gte: new Date(new Date().toISOString()) } }, { 'event.eventCategory': "Others" }]}
                //             , function(err, allOthers) {
                      
                //             otherEvents = allOthers;
                //             otherEvents.sort(function(a,b) { return Date.parse(a.date) - Date.parse(b.date) } );
                //             res.render('Landing', 
                //                 { user: req.session.user, 
                //                     postss: posts, events: eventsInDB,
                //                     plays:playEvents, workshops:workshopEvents,others:otherEvents
                //                     });
                //         });
                //     });        
                // });    

                
            });

        });
    }

        //});
};