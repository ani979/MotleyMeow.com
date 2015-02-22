
var express       = require('express'),
    FB            = require('fb'),
    http          = require('http'),
    path          = require('path'),
    config        = require('./oauth.js'),
    home          = require('./routes/home'),
    ejs           = require('ejs'),
    mongoose      = require('mongoose');
var moment = require('moment');


var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var User = require('./models/user.js');
var Event = require('./models/event.js');
var Posts = require('./models/posts.js');
var app = express();
// Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
// Configuring Passport
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook');

//var expressSession = require('express-session');

var dbConfig = require('./db');
// var mongoClient = require('mongodb').MongoClient;
// Connect to DB
mongoose.connect(dbConfig.url);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    
    User.findById(id, function(err, user) {
            done(err, user);
        });
});



// passport.use(new LocalStrategy(
// {
//         // by default, local strategy uses username and password, we will override with email
//         usernameField : 'email',
//         passwordField : 'password',
//         passReqToCallback : true // allows us to pass back the entire request to the callback
//     },
//     function(req, email, password, done) {
//         console.log("hereerere");

//         // asynchronous
//         // User.findOne wont fire unless data is sent back
//         process.nextTick(function() {

//             // find a user whose email is the same as the forms email
//             // we are checking to see if the user trying to login already exists
//             User.findOne({ 'local.email' :  email }, function(err, user) {
//                 console.log("hereerere111");
//                 // if there are any errors, return the error
//                 if (err)
//                     return done(err);

//                 // check to see if theres already a user with that email
//                 if (user) {
//                     console.log("hereerereavc");
//                     return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
//                 } else {
//                     console.log("hereerere going for creation");


//                     // if there is no user with that email
//                     // create the user
//                     var newUser            = new User();

//                     // set the user's local credentials
//                     newUser.local.email    = email;
//                     newUser.local.password = newUser.generateHash(password);

//                     // save the user
//                     newUser.save(function(err) {
//                         if (err)
//                             throw err;
//                         return done(null, newUser);
//                     });
//                 }

//             });    

//         });

//   }));



// config
passport.use(new FacebookStrategy({
         clientID: config.facebook.clientID,
         clientSecret: config.facebook.clientSecret,
         callbackURL: config.facebook.callbackURL,
         passReqToCallback: true
         
},
    function(req,accessToken, refreshToken, profile, done) {

             // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    console.log("not found");
                    if (err) {
                        return done(err);
                        console.log("here err" + err);
                     }   
                    // if the user is found, then log them in
                    if (user) {

                        // FB.api(
                        //     '/890660314318987?access_token=' + accessToken,
                        //     function (response) {
                        //       if (response) {
                        //         /* handle the result */
                        //         console.log("came here" + response.name);
                        //       }
                        //     }
                        // );
                        // app.get('https://graph.facebook.com/events/350654041784862', function(req, res) {
                        //      console.log("got the event", res);
                        //     });
                        console.log("found user");
                        if (!user.facebook.link) {
                            console.log("not found fb link");
                            FB.api(
                                    '/me?access_token=' + accessToken,
                                    function (response) {
                                        console.log("response "  + response);
                                      if (response && !response.error) {
                                        console.log(" response.link " + response.link);
                                        /* handle the result */
                                        //user.facebook.link = response.link;
                                        User.update({'facebook.email' : user.facebook.email},
                                                 { $set: {"facebook.link": response.link}},
                                                            function (err, user) {
                                                                if(err) {
                                                                    console.log("Something went wrong in saving facebook link");
                                                                }
                                        });                        
                                      } else {
                                        console.log("error in saving FB link " + response.error.message);
                                      }
                                    }
                            );                      
                        }                        
                        req.session.fbAccessToken = accessToken;
                        return done(null, user); // user found, return that user
                    } else {
                        console.log("i am here");
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id                   
                        newUser.facebook.token = profile.token; // we will save the token that facebook provides to the user                    
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        console.log("email id " + newUser.facebook.name);
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.local.picture  = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken;
                        FB.api(
                                    '/me?access_token=' + accessToken,
                                    function (response) {
                                        console.log("response "  + response);
                                      if (response && !response.error) {
                                        console.log(" response.link " + response.link);
                                        /* handle the result */
                                        //user.facebook.link = response.link;
                                        User.update({'facebook.email' : req.session.user.facebook.email},
                                                 { $set: {"facebook.link": response.link}},
                                                            function (err, user) {
                                                                if(err) {
                                                                    console.log("Something went wrong in saving facebook link");
                                                                }
                                        });                        
                                      } else {
                                        console.log("error in saving FB link " + response.error.message);
                                      }
                                    }
                        );    
                        console.log("email id " + newUser.facebook.email);
                        req.session.fbAccessToken = accessToken;


                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

    }
));



var app = express();

//app.configure(function() {
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(logger());
app.use(cookieParser());
app.use(session({ secret: 'secret'}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
//app.use(express.methodOverride());
//app.use(express.session({ secret: 'my_precious' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(app.router);
app.use(express.static(__dirname + '/views'));
//        });

// if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
// }
// app.configure('development', function() {
//     app.use(express.errorHandler());
// });



var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    console.log("req.session.access_token inside isAuthenticated: "+req.session.access_token);
    console.log("req.session.access_token inside isAuthenticateddddd: "+req.isAuthenticated);
    if (req.isAuthenticated() || req.session.access_token)
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}

// routes
app.get( '/', home.index);
// app.get('/', function(req, res) {
//     res.render('index');
//     });

app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: [ 'email' ] }),
    function(req, res){

    });
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
     console.log("setting here");
     console.log("session " + req.session);
     console.log("user " + req.user);
     req.session.user = req.user;
     res.redirect('/home');
});

app.get( '/signup',          home.signup);
app.post( '/signup',         passport.authenticate('local', {
        failureRedirect: '/',
        failureFlash : true  
    }), function(req, res) {
            console.log("coming here");
            res.redirect('/');
});

app.post("/update", function (req, res) {
    var email = req.body.email;
    
    User.findOne({ 'facebook.email' : email }, function(error, db) {
        console.log("coming 1");
        if (error || !db) {
            console.log("ERRPRRR");
          res.send({ error: error });          
        } else {
            if(req.body.btnvalue == "submit") {
            console.log("i am submit");
               // update the user object found using findOne
               db.facebook.name=req.body.fullname;
               db.local.city = req.body.city;
               console.log("roles selected " + req.body.role);
               // now update it in MongoDB
               db.local.role = req.body.role;
               db.local.lang = req.body.lang;
               console.log("req.body.emailDisplay " + req.body.emailDisplay)
               if(req.body.emailDisplay) {
                    if (req.body.emailDisplay == "ok") db.local.emailDisplay = true;
                     else db.local.emailDisplay = false;
               }      
               db.save(function (err, user) {
                   if (err) {
                        console.log("ERRRORRRR");
                        res.json(err) ;
                        
                    }

                   req.session.user = user;
                   req.session.loggedIn = true;
                   res.redirect('/profile');
               });
            } else if(req.body.btnvalue == "delete") {
                console.log(" I am in delete");
                User.remove({ 'facebook.email' : email }, function(error, db) {
                    if (error) {
                        console.log("ERRRORRRR");
                        res.json(err) ;
                        
                    }
                    req.session = null;
                    res.redirect('/');
                });         
            }   
        }
    });
});


app.post("/post", function (req, res) {
    console.log("User is " + req.session.user.facebook.email)
    var city = req.body.city;
    var lang = req.body.lang;
    var role = req.body.role;
    var langarr="";
    var cityarr="";
    var rolearr="";
    var x= false;


    if(!city || (typeof city == 'undefined')) {
        //cityarr = {}.toString();
        //x= true;
    } else {
        console.log("city selected is " + city);
        cityarr = city;
        //x = false;
    }
    

    var role = req.body.role;
    if (!role || (typeof role == 'undefined')) {
        console.log("role selected is " + role);
        //rolearr = {}.toString();
        //x= true;
    } else {
        console.log("role selected is " + role);
        rolearr = role;
       //x = false;
    }

    var lang = req.body.lang;
    if (!lang || (typeof lang == 'undefined')) {
        console.log("lang selected is undefinded" + lang);
        //langarr = {}.toString();
        //x= true;
    } else {
        console.log("lang selected is " + lang);
        langarr = lang;
       //x = false;
    }
    console.log("req.body._postid: "+req.body._postid);
    if(typeof req.body._postid != 'undefined') {
        console.log("posts already existed");
        Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  res.send({ error: error });          
                } else {

                    console.log("found post " + db);
                    console.log("message db.post.postTitle: "+db.post.postTitle);
                    console.log("req.body.postTitle:::::::::: "+req.body.postTitle);  

                    db.post.postTitle = req.body.postTitle;
                    db.post.postDetail = req.body.post;
                    db.post.date = new Date();
                    db.post.city = cityarr;
                    db.post.role = rolearr;
                    db.post.lang = langarr;

                   // update the user object found using findOne
                   console.log("req.body.title" + req.body.postTitle);
                   // db.post ={ $addToSet:  {postTitle:req.body.postTitle,
                   //          postDetail:req.body.post,
                   //          city:cityarr,
                   //          role: rolearr,
                   //          lang: langarr,
                   //          date:new Date()}};

                   var postt ={
                            postTitle:req.body.postTitle,
                            postDetail:req.body.post,
                            city:cityarr,
                            role: rolearr,
                            lang: langarr,
                            date:new Date()};
                    console.log("post is " + postt)
                    db.update({ $push: {post: postt}}, { upsert: true },function (err, user) {
                            if (err) {
                                console.log("ERRRORRRR");
                            }
                            db.save(function (err, user) {
                                if (err) {
                                console.log("ERRRORRRR");
                                res.json(err) ;
                                
                                }

                                res.redirect('/searchPosts');
                            });
                     });   
                }  
            });
    } else {
        console.log("New post");
            var newPost = new Posts();

            // set all of the facebook information in our user model
            newPost.post.userid    = req.session.user._id; 
            newPost.post.postTitle = req.body.postTitle;
            newPost.post.postDetail = req.body.post;
            newPost.post.date = new Date();
            newPost.post.city = cityarr;
            newPost.post.role = rolearr;
            newPost.post.lang = langarr;
            newPost.save(function(err) {
                       if (err)
                            throw err;
                        else {
                            res.redirect('/searchPosts');
                        }
                    });
    }

        
});

app.post('/search', function (req, res) {
    var city = req.body.city;
    var lang = req.body.lang;
    var role = req.body.role;
    var x= false;
    if(!city && !lang && !role) {
        x=true;
    } else {
        x = false;
    }

    if(!city) {
        var cityarr = {}.toString();
        //x= true;
    } else {
        console.log("city selected is " + city);
        var cityarr = city.toString();
        //x = false;
    }
    

    var role = req.body.role;
    if (!role) {
        console.log("role selected is " + role);
        var rolearr = {}.toString();
        //x= true;
    } else {
        console.log("role selected is " + role);
       var rolearr = role.toString();
       //x = false;
    }

    var lang = req.body.lang;
    if (!lang) {
        console.log("lang selected is " + lang);
        var langarr = {}.toString();
        //x= true;
    } else {
        console.log("lang selected is " + lang);
       var langarr = lang.toString();
       //x = false;
    }
    
    if(x) {
        console.log("coming here as x is true");
        User.find(function ( err, cities, count ){
                    
                    console.log("cities are " + cities);
                    console.log("err is " + err);
                    res.render('search_artists', { user: req.session.user, users: cities });

        });

    } else {
        console.log("city array selected is " + cityarr);
        User.find({ $and:[{'local.city':{$in : cityarr.split(",")}}, {'local.role':{$in : rolearr.split(",")}},
            {'local.lang':{$in : langarr.split(",")}}]}, function ( err, artists, count ){
                    
                    console.log("artists are " + artists);
                    console.log("cityarr is " + err);
                    res.render('search_artists', { user: req.session.user, users: artists, cityarr:cityarr, rolearr:rolearr, langarr:langarr });

        }); 

// User.find({ $and:[{'local.city':{$in : cityarr.split(",")}}]}, function ( err, artists, count ){
                    
//                     console.log("artists are " + artists);
//                     console.log("err is " + err);
//                     res.render('search_artists', { user: req.session.user, users: artists });

//         }); 
    }   
    

});

app.get('/logout', home.logout);
app.get( '/searchPosts',  ensureAuthenticated, function(req, res){
            console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            console.log("req.user.email " + req.session.user.facebook.email);



            Posts.find({ 'post.userid' : req.session.user._id }, function(error, db) {
                //     console.log("coming 1");
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  res.send({ error: error });          
                } else {
                  // console.log("found user " + db.facebook.email);
                  console.log("found user: " + db);
                  // console.log("found user's post: " + db.post);
                  console.log("found user's post length: " + db.length);
                  res.render('post_search', { postdb: db });
                }    
             });   

});
            
            // User.find( function ( err, users, count ){
                
            //     allUsers = users
                        
            //     res.render('Landing', { user: req.session.user, users: allUsers });

            // });

app.get( '/home',  ensureAuthenticated, function(req, res){
            console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            var posts; 
            var events;
            var playEvents=null;;
            var workshopEvents=null;
            var otherEvents=null;


            User.find( function ( err, users, count ){

                if(err) res.render('index');

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

});

app.post('/searchallposts', function (req, res) {
    var city = req.body.city;
    var lang = req.body.lang;
    var role = req.body.role;
    var x= false;
    if(!city && !lang && !role) {
        x=true;
    } else {
        x = false;
    }

    if(!city) {
        var cityarr = {}.toString();
        //x= true;
    } else {
        console.log("city selected is " + city);
        var cityarr = city.toString();
        //x = false;
    }
    

    var role = req.body.role;
    if (!role) {
        console.log("role selected is " + role);
        var rolearr = {}.toString();
        //x= true;
    } else {
        console.log("role selected is " + role);
       var rolearr = role.toString();
       //x = false;
    }

    var lang = req.body.lang;
    if (!lang) {
        console.log("lang selected is " + lang);
        var langarr = {}.toString();
        //x= true;
    } else {
        console.log("lang selected is " + lang);
       var langarr = lang.toString();
       //x = false;
    }
    
    if(x) {
        console.log("coming here as x is true");
        User.find(function ( err, posts, count ){
                    
                    console.log("cities are " + cities);
                    console.log("err is " + err);
                    res.render('browserequests', { user: req.session.user, allposts: posts });

        });

    } else {
        console.log("city array selected is " + cityarr);
        Posts.distinct('post',{ $and:[{'post.city':{$in : cityarr.split(",")}}, {'post.role':{$in : rolearr.split(",")}},
            {'post.lang':{$in : langarr.split(",")}}]}, function ( err, posts, count ){
         // Posts.distinct('post',{'post.city':{$in : cityarr.split(",")}}, function ( err, posts, count ){   
                    
                    console.log("posts are " + posts);
                    console.log("cityarr is " + err);
                    res.render('browserequests', { user: req.session.user, allposts: posts, cityarr:cityarr, rolearr:rolearr, langarr:langarr });

        }); 

    }   
    

});

app.get( '/viewallposts',  ensureAuthenticated, function(req, res){
            var then = new Date();
            then.setDate(then.getDate() - 7);

            console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            var posts; 
            Posts.aggregate([{ $match: { 'post.date': { $gte: new Date(then.toISOString()) } } }],
                                    function(err, postsinDB) {
                console.log("here");
                if(!err) {
                    posts = postsinDB;
                }
                console.log("posts is " + posts);
                console.log("posts length is " + posts.length);
                console.log("req.user " + req.user);
                
                            
                res.render('browserequests', { user: req.session.user, allposts: posts, rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia"});

                
            });

});

app.get( '/allEvents',  ensureAuthenticated, function(req, res){
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
});



app.get( '/artists',  function(req, res){
            var allUsers;
            console.log("req.user " + req.user);
            User.find( function ( err, users, count ){
                //console.log("all users " + users);
                allUsers = users
                        
                res.render('search_artists', { user: req.session.user, users: allUsers,rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia" });

            });
});

app.get( '/postevents',  ensureAuthenticated, function(req, res){
            console.log("coming here posting an event");
            res.render('postevent', { user: req.session.user});

       
});
app.post( '/posteventDetails',  function(req, res){
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
});

app.get( '/profile', home.profile);

app.get( '/postarequest',  ensureAuthenticated, function(req, res){
            var allUsers;
            console.log("req.user " + req.user);
            res.render('postarequest', { user: req.session.user, users: allUsers });
});

app.post( '/editpost',  ensureAuthenticated, function(req, res){
            console.log("user id " + req.body._id);
            console.log("post id " + req.body._postid);

            Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID POST TO EDIT");
                  res.send({ error: error });          
                } else {
                  console.log("found post " + db);
                  res.render('postarequest', { post: db, user:req.session.user });
                }  
            });
});

app.post( '/viewpost',  ensureAuthenticated, function(req, res){
            console.log("user id " + req.body._id);
            console.log("post id " + req.body._postid);
            Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  res.send({ error: error });          
                } else {
                  console.log("found post " + db);
                  User.findOne({ '_id' : req.body._id }, function(error, user) {
                    if(error) {
                        console.log("Error in retrieving user, something is not correct, check in DB");
                        res.redirect("/searchposts");
                    } else {
                        console.log("user " + user);
                        res.render("viewapost", {post:db, user: user, sessionUser: req.session.user});    
                    }
                  });     
                  
                }  
            });
            
});

app.post( '/deletepost',  ensureAuthenticated, function(req, res){
            console.log("user id " + req.body._id);
            console.log("post id " + req.body._postid);


Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  res.send({ error: error });          
                } else {
                  console.log("found post " + db);
                  
                  db.remove(function (err, user) {
                           if (err) {
                                console.log("ERRRORRRR");
                                res.json(err) ;
                                
                            }

                           res.redirect('/searchposts');
                       });
                  
                }  
            });
});

function ensureAuthenticated(req, res, next) {

if (req.isAuthenticated()) { 
    console.log("here accessToken " + req.session.fbAccessToken);
    return next(); 
}
console.log("not authenticated");
res.redirect('/')
}

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});