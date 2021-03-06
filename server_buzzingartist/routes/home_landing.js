var FB              = require('fb');
    // config          = require('../config');
var User = require('../models/user');
var Posts = require('../models/posts.js');
var Event = require('../models/event.js');
var dropdowns = require('../views/js/theatreContrib.js');
var config        = require('../oauth.js')
var async        = require('async')
var BlogPost = require('../models/blogPost'); 
var Forum = require('../models/forum'); 


exports.logout = function (req, res) {
    console.log("LOGOUTTTTT");
    req.session.destroy();
    req.session = null; // clear session
    res.redirect('/');
};


exports.profile = function (req, res) {
    var accessToken = req.session.access_token;
    var fbid = "";
    console.log("accesstoken111: "+ accessToken);
   // if(!accessToken) {
        console.log("isAuthenticatedddddddd222: "+ req.isAuthenticated());
        //if(req.isAuthenticated()) {
            console.log("req.fbId " + req.query.fbId);
            if(typeof req.query.fbId == 'undefined') {
                fbid = req.session.user.facebook.id;
            } else {
                fbid = req.query.fbId;
            }
            User.findOne({ 'facebook.id' : fbid}, function(error, db) {
                res.render('profileView', { user: db, dropdowns:dropdowns, sessionUser: req.session.user, appId:config.facebook.clientID});
            });    

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

exports.saveNotificationClickDate = function(req, res) {
    console.log("saveNotificationClickDateeeeeeeeee: "+req.body.notificationCount);
        User.findOne({ 'facebook.id' : req.session.user.facebook.id }, function(error, db) {
        if (error || !db) {
            console.log("ERRPRRR");
          req.flash('info', "Error while finding facebook id in the database")
          res.redirect('/error');          
        } else {
               // update the user object found using findOne
               
               db.local.notificationClickDate = new Date();
               db.local.notificationCount = req.body.notificationCount;
               db.save(function (err, user) {
                   if (err) {
                        console.log("ERRRORRRR");
                        // res.json(err) ;
                        req.flash('info', "Error while saving the new email in the database")
                        res.redirect('/error');
                        return done(err);
                    }
                   req.session.user = user;
                   console.log("dateee afterr: "+req.session.user.local.notificationClickDate);
                   req.session.loggedIn = true;
                   res.send("OK");
               });
        }
    }); 
};

exports.getNotification = function(req, res) {
    console.log("GETNOTIFICATIONNNNNN");
    var foundUser = req.session.user;
    var selectedCity = new Array();
    console.log("found user notificationClickDate: "+foundUser.local.notificationClickDate);
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

    if(typeof selectedCity != undefined && selectedCity.length != 0) {
        console.log("req.session.user role: "+foundUser.local.role[0]);

                            var postsArray = new Array();


                            Posts.aggregate([{ $project: {'post.role': 1, 'post.city': 1, 'post.date': 1, 'post.postTitle': 1,'post.postDetail': 1,'post.userid': 1, 'post.user': 1, 'post.lang':1, common:{ $setIntersection: [ "$post.role", foundUser.local.role ]},_id: 1 } }, {$match: { $and: [ { 'post.city': { $in: selectedCity } }, 
                                        { 'post.date': { $lte: new Date() } } ,{ 'post.userid': { $ne: req.session.user.facebook.id} }] }} ,{ $sort : { 'post.date' : -1 } },{$limit:10}],
                                                            function(err, postsinDB) {
                                if(!err) {
                                    postsForArtist = postsinDB;
                                }
                                console.log("ALL POSTS till NOW: "+postsForArtist.length);
                                var j = 0;
                                for (var i = 0; i < postsForArtist.length; i++) {
                                    // console.log("postsForArtist[i]: "+postsForArtist[i]);
                                    // console.log("rolee: "+postsForArtist[i].post.role);
                                    // console.log("postsForArtist[i].post.common: "+postsForArtist[i].post.common);
                                    // console.log("postsForArtist[i].common: "+postsForArtist[i].common);
                                    if(typeof postsForArtist[i].common != 'undefined' && postsForArtist[i].common != "") {
                                        postsArray[j] = postsForArtist[i];
                                        j ++;
                                    }
                                };
                                console.log("ALL posts related to the user ROLE: "+postsArray.length);
                                // res.render("Landing", {user: req.session.user, postss: posts, events: eventsInDB, users:recentUsers,
                                // appId:config.facebook.clientID, dropdowns:dropdowns,recentPostsForArtist:postsArray})

                                if(typeof foundUser.local.notificationClickDate != 'undefined') {
                                        var recentPosts = {};
                                        var recentPostsArray = new Array();
                                        Posts.aggregate([{ $project: {'post.role': 1, 'post.city': 1,'post.date': 1, 'post.postTitle': 1,'post.postDetail': 1,'post.userid': 1, 'post.user': 1, 'post.lang':1, common:{ $setIntersection: [ "$post.role", foundUser.local.role ]},_id: 1 } }, {$match: { $and: [ { 'post.city': { $in: selectedCity } }, 
                                        { 'post.date': { $gte: new Date(foundUser.local.notificationClickDate) } } ,{ 'post.userid': { $ne: req.session.user.facebook.id} }] }} ,{ $sort : { 'post.date' : -1 } },{$limit:10}],
                                                            function(err, postsinDB) {
                                        console.log("have reached here " + postsinDB)
                                        if(!err) {
                                            recentPosts = postsinDB;
                                            console.log("have reached here " + postsinDB.length)
                                        }
                                        console.log("POSTS based upon last notification click date: "+ recentPosts.length);
                                        
                                        var j = 0;
                                        for (var i = 0 ; i < recentPosts.length; i++) {
                                            console.log(" postsForArtist[i].common " + recentPosts[i].common);
                                            if(typeof postsForArtist[i].common != 'undefined' && recentPosts[i].common != "") {
                                                recentPostsArray[j] = recentPosts[i];
                                                j ++;
                                            }
                                        };
                                        console.log("POSTS related to user ROLE based upon last notification click date: "+recentPostsArray.length);
                                        
                                        // res.render("Landing", {user: req.session.user, postss: posts, events: eventsInDB, users:recentUsers,
                                        // appId:config.facebook.clientID, dropdowns:dropdowns,recentPostsForArtist:postsArray,notificationCount:recentPostsArray.length})

                                        res.render("notification", {recentPostsForArtist:postsArray,notificationCount:recentPostsArray.length})
                                    });
                        }

                             });
    }
};

exports.index_home = function(req, res) {
    console.log("req.session " + req.session);
    
    var posts; 
    var events;
    var playEvents=null;;
    var workshopEvents=null;
    var otherEvents=null;
    
    var then = new Date();
    var now = new Date();

    then.setDate(then.getDate() - 10);
    var selectedCity = new Array();
    
    var uCnt = 0,eCnt=0,pCnt=0;
    var posts = {};
    var events = {};
    var users = {};
    var allDBPosts = {};
    var postsArray = new Array();
    var recentPostsArray = new Array();
    var allLastUpdtdUsers = new Array();
    var allForumThreads = {};
    var recentJoinedUsers = {};
    var eventsInDB = {};
    var allBlogPosts = {};
    async.parallel([            
            function(callback) {
                console.log("i am here2222")
                if(typeof selectedCity != undefined && selectedCity.length != 0) {
                    Event.aggregate([{ $match: { $and: [ { 'event.city': { $in: selectedCity } },  
                                               { $or: [ { 'event.date': {$gte: new Date(new Date().toISOString()) } },  
                                                        { 'event.endDate': { $ne : null , $gte: new Date(new Date().toISOString()) } } 
                                                      ] } ] } }, 
                                     { $sort : { 'event.date' : 1 } }, {$limit:12}]

                            // ,  
                            // { 'event.endDate': { $and: [ { $ne : null}, {$lte: new Date(new Date().toISOString()) } ] } } ] } }, 
                            // { $sort : { 'event.date' : 1 } }, {$limit:5}]
                        , function(err, eventsCriteria) {
                        if(err) {
                            eventsInDB = {};
                            console.log("Event aggregated");
                            console.log("error is " + err)
                            
                         } else {
                            eventsInDB = eventsCriteria;
                            if(typeof eventsCriteria != 'undefined' && eventsCriteria.length ==0) {
                                Event.aggregate([{ $match: { $or: [ { 'event.date': {$gte: new Date(new Date().toISOString()) } },  
                                                        { 'event.endDate': { $ne : null , $gte: new Date(new Date().toISOString()) } } 
                                                      ] } },  { $sort : { 'event.date' : 1 } }, {$limit:12}],
                                            function(err, allEventsInDB) {
                                                if(err) {
                                                    eventsInDB = {};
                                                    console.log("Error when getting all events in Database when city doesnt have any events");
                                                } else {
                                                    eventsInDB = allEventsInDB;
                                                    console.log("DONE with 2222 FROM EVENTS FROM OTHER CITIES WHILE THE CURRENT CITY DOESNT HV EVENTS")
                                                    callback(null, "DONE2");
                                                }
                                });                
                            } else {
                                console.log("DONE with 2222 CURRENT CITY HAS EVENTS")
                                callback(null, "DONE2");
                            }
                         }   
                         
                    }); 
                 } else {
                    Event.aggregate([{ $match: { $or: [ { 'event.date': {$gte: new Date(new Date().toISOString()) } },  
                                                        { 'event.endDate': { $ne : null , $gte: new Date(new Date().toISOString()) } } 
                                                      ] } },  
                                    { $sort : { 'event.date' : 1 } }, {$limit:12}],
                            function(err, allEventsInDB) {
                        if(err) {
                            eventsInDB = {};
                            console.log("Error when getting all events in Database");
                        } else {
                            eventsInDB = allEventsInDB;
                        }
                        console.log("DONE with 2222")
                        callback(null, "DONE2");
                    });

                 }   
            },
            function(callback){
                console.log("i am here3333")
                
                    Posts.aggregate([{ $match: { 'post.date': { $lte: (now) } } } , { $sort : { 'post.date' : -1 } }, {$limit:8} ],
                        function(err, allpostsinDB) {
                        if (err || typeof allpostsinDB == 'undefined') {
                            console.log("Error while getting all posts");
                        }    

                        console.log("allpostsinDB is " + allpostsinDB.length);
                        
                        if(!err) {
                            allDBPosts = allpostsinDB;
                        } else {
                            allDBPosts = {};
                        }

                        console.log("DONE with 3333")
                        callback(null, "DONE3")
                    }); 
            },
            function(callback) {
                console.log("i am here4444")
                User.aggregate([{ $match: { 'local.joiningDate': { $lte: new Date() } } } , { $sort : { 'local.joiningDate' : -1 } }, {$limit:5} ],
                         function(err, recentUsers) {
                    
                    if(err) {
                            recentJoinedUsers = {};
                            console.log("Error when getting recent joined Users");
                        } else {
                            recentJoinedUsers = recentUsers;
                        } 
                        console.log("DONE with 4444")
                    callback(null,"DONE4")    
                });   
            },
            function(callback){
                console.log("i am here5555")
                
                User.aggregate([{ $match: { 'local.lastProfileUpdateDate': { $lte: new Date() } } } , { $sort : { 'local.lastProfileUpdateDate' : -1 } }, {$limit:12} ],
                    function(err, lastUpdtdUsers) {
                    if (err || typeof lastUpdtdUsers == 'undefined') {
                        console.log("Error while getting last updated users");
                    }    

                    console.log("lastUpdatedUsers length is " + lastUpdtdUsers.length);
                    
                    if(!err) {
                        allLastUpdtdUsers = lastUpdtdUsers;
                    } else {
                        allLastUpdtdUsers = {};
                    }

                    console.log("DONE with 5555")
                    callback(null, "DONE5")
                }); 
            },
            function(callback){
                console.log("i am here6666")
                BlogPost.aggregate([{ $match: {'blogPost.approved':true} },{ $sort : { 'blogPost.date' : -1 } }, {$limit:5}], function(err, allblogposts) {
                    //console.log(blogposts);
                    //console.log(count);
                    if(err) {
                        console.log("errror in fetching all blog posts");
                        allBlogPosts = {};
                        
                    }
                    else {
                        console.log("All blog posts fetched");
                        allBlogPosts = allblogposts;
                        
                        
                    } 
                    callback(null, "DONE6")
                });
               
            },
            function(callback){
                console.log("i am here777")
                Forum.aggregate([{ $match: { 'thread.date': { $lte: (now) } } } , { $sort : { 'thread.date' : -1 } }, {$limit:5} ], function(err, threads) {
                    //console.log(blogposts);
                    //console.log(count);
                    if(err) {
                        console.log("errror in fetching all forum threads");
                        allForumThreads = {};
                        
                    }
                    else {
                        console.log("All forum posts fetched " + threads.length);
                        allForumThreads = threads;
                        
                        
                    } 
                    callback(null, "DONE7")
                });
               
            },

            function(callback) {
                console.log("i am here 888")
                User.count(function(err, uCount) {
                    if(!err) {
                        uCnt = uCount;
                    }
                    Posts.count(function(err, pCount) {
                        if(!err) {
                            pCnt = pCount;   
                        }
                        Event.count(function(err, eCount) {
                            if(!err) {
                                eCnt = eCount;   

                            } 
                            callback(null, "DONE8")
                        });    
                    }); 
                });
                
            }


        ],
        // optional callback
        function(err, results){
            console.log("Finally")
            // //allDBPosts= allDBPosts.concat(allBlogPosts);
            // //console.log("All Blogs posts " + JSON.stringify(allDBPosts));
            // //allDBPosts.sort(function(a,b) { return new Date(a.result.date).getTime() - new Date(b.result.date).getTime(); });
            // var mainArray = new Array();
            // mainArray = mainArray.concat(allDBPosts)
            // mainArray = mainArray.concat(allBlogPosts)
            // mainArray = mainArray.concat(allForumThreads);
            // mainArray = mainArray.sort(function(a, b){
            //         var keyA, keyB;
            //         if(typeof a.post != 'undefined') { keyA = new Date(a.post.date)}
            //         if(typeof a.blogPost != 'undefined') { keyA = new Date(a.blogPost.date)}
            //         if(typeof a.thread != 'undefined') { keyA = new Date(a.thread.date)}

            //         if(typeof b.post != 'undefined') { keyB = new Date(b.post.date)}
            //         if(typeof b.blogPost != 'undefined') { keyB = new Date(b.blogPost.date)}
            //         if(typeof b.thread != 'undefined') { keyB = new Date(b.thread.date)}

            //         // Compare the 2 dates
            //         if(keyA < keyB) return 1;
            //         if(keyA > keyB) return -1;
            //         return 0;
            //         });
            console.log("message is " + req.flash('loginMessage'))
            res.render("index_Landing", {events: eventsInDB, users:recentJoinedUsers, allPosts: allDBPosts, 
                appId:config.facebook.clientID, dropdowns:dropdowns, lastProfileUpdtd:allLastUpdtdUsers,
                allBlogs:allBlogPosts, allThreads:allForumThreads, aCount:uCnt, pCount:pCnt, eCount:eCnt, allBlogs:allBlogPosts, allForum:allForumThreads})
            // the results array will equal ['one','two'] even though
            // the second function had a shorter timeout.
        }
    );
}   


exports.landing_home = function(req, res) {
    console.log("req.session " + req.session);
    console.log("req.session.user " + req.session.user);
    console.log("req.session.user.dateee: "+req.session.user.local.notificationClickDate);
    console.log("req.session.user.facebook.id: "+req.session.user.facebook.id);
    var posts; 
    var events;
    var playEvents=null;;
    var workshopEvents=null;
    var otherEvents=null;
    var foundUser = req.session.user
    var then = new Date();
    var now = new Date();

    then.setDate(then.getDate() - 10);
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
    console.log("found user notificationClickDate: "+foundUser.local.notificationClickDate);
    console.log("config.facebook.clientID: "+config.facebook.clientID);
    var uCnt = 0,eCnt=0,pCnt=0;
    var posts = {};
    var events = {};
    var users = {};
    var allDBPosts = {};
    var postsArray = new Array();
    var recentPostsArray = new Array();
    var allLastUpdtdUsers = new Array();
    var allForumThreads = {};
    var recentJoinedUsers = {};
    var eventsInDB = {};
    var allBlogPosts = {};
    async.parallel([
            function(callback){
                var postsForArtist = {};
                console.log("i am here1111")
                if(typeof selectedCity != undefined && selectedCity.length != 0) {
                    Posts.aggregate([{ $project: {'post.role': 1, 'post.city': 1, 'post.date': 1, 'post.postTitle': 1,'post.postDetail': 1,'post.userid': 1, 'post.user': 1, 'post.lang':1, common:{ $setIntersection: [ "$post.role", foundUser.local.role ]},_id: 1 } }, {$match: { $and: [ { 'post.city': { $in: selectedCity } }, 
                                        { 'post.date': { $lte: new Date() } }, { 'post.userid': { $ne: req.session.user.facebook.id} } ] }} ,{ $sort : { 'post.date' : -1 } }, {$limit:10}],
                                                            function(err, postsinDB) {
                                if(!err) {
                                    postsForArtist = postsinDB;
                                }
                                console.log("postsForArtist length ELSE part: "+postsForArtist.length);
                                var j = 0;
                                 for (var i = 0; i < postsForArtist.length; i++) {
                                    if(typeof postsForArtist[i].common != 'undefined' && postsForArtist[i].common != "") {
                                        postsArray[j] = postsForArtist[i];
                                        j ++;
                                    }
                                };
                                console.log("postsArray length: "+postsArray.length);
                                if(typeof foundUser.local.notificationClickDate != 'undefined') {
                                        var recentPosts = {};
                                        // var recentPostsArray = new Array();
                                        Posts.aggregate([{ $project: {'post.role': 1, 'post.city': 1,'post.date': 1, 'post.postTitle': 1,'post.postDetail': 1,'post.userid': 1, 'post.user': 1, 'post.lang':1, common:{ $setIntersection: [ "$post.role", foundUser.local.role ]},_id: 1 } }, {$match: { $and: [ { 'post.city': { $in: selectedCity } }, 
                                        { 'post.date': { $gte: new Date(foundUser.local.notificationClickDate) } }, { 'post.userid': { $ne: req.session.user.facebook.id} } ] }} ,{ $sort : { 'post.date' : -1 } }, {$limit:10}],
                                                            function(err, postsinDB) {
                                        if(!err) {
                                            recentPosts = postsinDB;
                                            console.log("have reached here " + postsinDB.length)
                                        }
                                        console.log("postsForArtist length: "+ recentPosts.length);
                                        
                                        var j = 0;
                                        for (var i = 0 ; i < recentPosts.length; i++) {
                                            if(typeof recentPosts[i].common != 'undefined' && recentPosts[i].common != "") {
                                                recentPostsArray[j] = recentPosts[i];
                                                j ++;
                                            }
                                        };
                                        console.log("postsArray length: DONE111 "+recentPostsArray.length);
                                        callback(null, "DONE1")
                                    });
                                } else  {
                                        recentPostsArray = postsArray;
                                        console.log("DONE111 notification clickDate not found");
                                        callback(null, "DONE1")
                                }

                             });
                    } else {
                        console.log("DONE with 1111")
                        callback(null, "DONE1")
                    }   
            },
            function(callback) {
                console.log("i am here2222")
                if(typeof selectedCity != undefined && selectedCity.length != 0) {
                    Event.aggregate([{ $match: { $and: [ { 'event.city': { $in: selectedCity } },  
                                               { $or: [ { 'event.date': {$gte: new Date(new Date().toISOString()) } },  
                                                        { 'event.endDate': { $ne : null , $gte: new Date(new Date().toISOString()) } } 
                                                      ] } ] } }, 
                                     { $sort : { 'event.date' : 1 } }, {$limit:12}]

                            // ,  
                            // { 'event.endDate': { $and: [ { $ne : null}, {$lte: new Date(new Date().toISOString()) } ] } } ] } }, 
                            // { $sort : { 'event.date' : 1 } }, {$limit:5}]
                        , function(err, eventsCriteria) {
                        if(err) {
                            eventsInDB = {};
                            console.log("Event aggregated");
                            console.log("error is " + err)
                            // res.render('Landing', { user: req.session.user, postss: posts, events: events, appId:config.facebook.clientID, dropdowns:dropdowns});
                           // return;
                         } else {
                            eventsInDB = eventsCriteria;
                            if(typeof eventsCriteria != 'undefined' && eventsCriteria.length ==0) {
                                Event.aggregate([{ $match: { $or: [ { 'event.date': {$gte: new Date(new Date().toISOString()) } },  
                                                        { 'event.endDate': { $ne : null , $gte: new Date(new Date().toISOString()) } } 
                                                      ] } },  { $sort : { 'event.date' : 1 } }, {$limit:12}],
                                            function(err, allEventsInDB) {
                                                if(err) {
                                                    eventsInDB = {};
                                                    console.log("Error when getting all events in Database when city doesnt have any events");
                                                } else {
                                                    eventsInDB = allEventsInDB;
                                                    console.log("DONE with 2222 FROM EVENTS FROM OTHER CITIES WHILE THE CURRENT CITY DOESNT HV EVENTS")
                                                    callback(null, "DONE2");
                                                }
                                });                
                            } else {
                                console.log("DONE with 2222 CURRENT CITY HAS EVENTS")
                                callback(null, "DONE2");
                            }
                         }   
                         
                    }); 
                 } else {
                    Event.aggregate([{ $match: { $or: [ { 'event.date': {$gte: new Date(new Date().toISOString()) } },  
                                                        { 'event.endDate': { $ne : null , $gte: new Date(new Date().toISOString()) } } 
                                                      ] } },  
                                    { $sort : { 'event.date' : 1 } }, {$limit:12}],
                            function(err, allEventsInDB) {
                        if(err) {
                            eventsInDB = {};
                            console.log("Error when getting all events in Database");
                        } else {
                            eventsInDB = allEventsInDB;
                        }
                        console.log("DONE with 2222")
                        callback(null, "DONE2");
                    });

                 }   
            },
            function(callback){
                console.log("i am here3333")

                    Posts.aggregate([{ $match: { 'post.date': { $lte: (now) } } } , { $sort : { 'post.date' : -1 } }, {$limit:12} ],
                        function(err, allpostsinDB) {
                        if (err || typeof allpostsinDB == 'undefined') {
                            console.log("Error while getting all posts");
                        }    

                        console.log("allpostsinDB is " + allpostsinDB.length);
                        
                        if(!err) {
                            allDBPosts = allpostsinDB;
                        } else {
                            allDBPosts = {};
                        }

                        console.log("DONE with 3333")
                        callback(null, "DONE3")
                    }); 
            },
            function(callback) {
                console.log("i am here4444")
                User.aggregate([{ $match: { 'local.joiningDate': { $lte: new Date() } } } , { $sort : { 'local.joiningDate' : -1 } }, {$limit:5} ],
                         function(err, recentUsers) {
                    
                    if(err) {
                            recentJoinedUsers = {};
                            console.log("Error when getting recent joined Users");
                        } else {
                            recentJoinedUsers = recentUsers;
                        } 
                        console.log("DONE with 4444")
                    callback(null,"DONE4")    
                });   
            },
            function(callback){
                console.log("i am here5555")
                
                User.aggregate([{ $match: { 'local.lastProfileUpdateDate': { $lte: new Date() } } } , { $sort : { 'local.lastProfileUpdateDate' : -1 } }, {$limit:12} ],
                    function(err, lastUpdtdUsers) {
                    if (err || typeof lastUpdtdUsers == 'undefined') {
                        console.log("Error while getting last updated users");
                    }    

                    console.log("lastUpdatedUsers length is " + lastUpdtdUsers.length);
                    
                    if(!err) {
                        allLastUpdtdUsers = lastUpdtdUsers;
                    } else {
                        allLastUpdtdUsers = {};
                    }

                    console.log("DONE with 5555")
                    callback(null, "DONE5")
                }); 
            },
            function(callback){
                console.log("i am here6666")
                BlogPost.aggregate([{ $match: {'blogPost.approved':true} },{ $sort : { 'blogPost.date' : -1 } }, {$limit:5}], function(err, allblogposts) {
                    //console.log(blogposts);
                    //console.log(count);
                    if(err) {
                        console.log("errror in fetching all blog posts");
                        allBlogPosts = {};
                        
                    }
                    else {
                        console.log("All blog posts fetched");
                        allBlogPosts = allblogposts;
                        
                        
                    } 
                    callback(null, "DONE6")
                });
               
            },
            function(callback){
                console.log("i am here777")
                Forum.aggregate([{ $match: { 'thread.date': { $lte: (now) } } } , { $sort : { 'thread.date' : -1 } }, {$limit:5} ], function(err, threads) {
                    //console.log(blogposts);
                    //console.log(count);
                    if(err) {
                        console.log("errror in fetching all forum threads");
                        allForumThreads = {};
                        
                    }
                    else {
                        console.log("All forum posts fetched " + threads.length);
                        allForumThreads = threads;
                        
                        
                    } 
                    callback(null, "DONE7")
                });
               
            },

            function(callback) {
                console.log("i am here 888")
                User.count(function(err, uCount) {
                    if(!err) {
                        uCnt = uCount;
                    }
                    Posts.count(function(err, pCount) {
                        if(!err) {
                            pCnt = pCount;   
                        }
                        Event.count(function(err, eCount) {
                            if(!err) {
                                eCnt = eCount;   

                            } 
                            callback(null, "DONE8")
                        });    
                    }); 
                });
                
            }
        ],
        // optional callback
        function(err, results){
            // console.log("Finally")
            // //allDBPosts= allDBPosts.concat(allBlogPosts);
            // //console.log("All Blogs posts " + JSON.stringify(allDBPosts));
            // //allDBPosts.sort(function(a,b) { return new Date(a.result.date).getTime() - new Date(b.result.date).getTime(); });
            // var mainArray = new Array();
            // mainArray = mainArray.concat(allDBPosts)
            // mainArray = mainArray.concat(allBlogPosts)
            // mainArray = mainArray.concat(allForumThreads);
            // mainArray = mainArray.sort(function(a, b){
            //         var keyA, keyB;
            //         if(typeof a.post != 'undefined') { keyA = new Date(a.post.date)}
            //         if(typeof a.blogPost != 'undefined') { keyA = new Date(a.blogPost.date)}
            //         if(typeof a.thread != 'undefined') { keyA = new Date(a.thread.date)}

            //         if(typeof b.post != 'undefined') { keyB = new Date(b.post.date)}
            //         if(typeof b.blogPost != 'undefined') { keyB = new Date(b.blogPost.date)}
            //         if(typeof b.thread != 'undefined') { keyB = new Date(b.thread.date)}

            //         // Compare the 2 dates
            //         if(keyA < keyB) return 1;
            //         if(keyA > keyB) return -1;
            //         return 0;
            //         });
          
            res.render("index_Landing", {user: req.session.user, events: eventsInDB, users:recentJoinedUsers, allPosts: allDBPosts, 
                appId:config.facebook.clientID, dropdowns:dropdowns, recentPostsForArtist:postsArray,notificationCount:recentPostsArray.length, lastProfileUpdtd:allLastUpdtdUsers,
                allBlogs:allBlogPosts, allThreads:allForumThreads, aCount:uCnt, pCount:pCnt, eCount:eCnt, allBlogs:allBlogPosts, allForum:allForumThreads})
            // the results array will equal ['one','two'] even though
            // the second function had a shorter timeout.
        }
    );

};