
var express       = require('express'),
    FB            = require('fb'),
    http          = require('http'),
    path          = require('path'),
    config        = require('./oauth.js'),
    home          = require('./routes/home_landing'),
    ejs           = require('ejs'),
    mongoose      = require('mongoose'),
    post_request  = require('./routes/post_request'),
    post_event  = require('./routes/post_event'),
    artists  = require('./routes/artist'),
    multer  = require('multer');

var moment = require('moment');
var argv = require('optimist').argv;
var crypto = require('crypto');
var fsExtra = require('fs')
exports.fsExtra = fsExtra;

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var User = require('./models/user.js');
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
         passReqToCallback: true,
         enableProof: true
         
},
    function(req,accessToken, refreshToken, profile, done) {

             // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    console.log("not found");
                    console.log("here errrrrr: " + err);
                    if (err) {
                        req.flash('info', "There is an error connecting to the database")
                        res.redirect('/error');
                        return done(err);
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
                        hash = crypto.createHmac('sha256', config.facebook.clientSecret).update(accessToken).digest('hex');
                        req.session.hashValue = hash;
                        if (!user.facebook.link) {
                            console.log("not found fb link");
                            FB.api(
                                    '/me?access_token=' + accessToken + '&appsecret_proof=' + req.session.hashValue,
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
                                                                    req.flash('info', "Something went wrong in saving facebook link")
                                                                    res.redirect('/error');
                                                                }
                                        });                        
                                      } else {
                                        console.log("error in saving FB link " + response.error.message);
                                        req.flash('info', "Error in saving FB link")
                                        res.redirect('/error');
                                      }
                                    }
                            );                      
                        }                        
                        req.session.fbAccessToken = accessToken;
                        
                        console.log("hash is " + hash);
                        return done(null, user); // user found, return that user
                    } else {
                        console.log("i am here");
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();
                        hash = crypto.createHmac('sha256', config.facebook.clientSecret).update(accessToken).digest('hex');
                        req.session.hashValue = hash;

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id                   
                        newUser.facebook.token = profile.token; // we will save the token that facebook provides to the user                    
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        console.log("email id " + newUser.facebook.name);
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.local.picture  = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken + '&appsecret_proof=' + req.session.hashValue;
                        FB.api(
                                    '/me?access_token=' + accessToken + '&appsecret_proof=' + req.session.hashValue,
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
                                                                    req.flash('info', "Something went wrong in saving facebook link")
                                                                    res.redirect('/error');
                                                                }
                                        });                        
                                      } else {
                                        console.log("error in saving FB link " + response.error.message);
                                        req.flash('info', "Error in saving FB link")
                                        res.redirect('/error');
                                      }
                                    }
                        );    
                        console.log("email id " + newUser.facebook.email);
                        req.session.fbAccessToken = accessToken;


                        // save our user to the database
                        newUser.save(function(err) {
                            if (err) {
                                req.flash('info', "Error while saving the user in the database")
                                res.redirect('/error');
                                return done(err);
                            }

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
//app.use(multer({  dest: './views/tempUploads' }))
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

// app.get( '/signup',          home.signup);
// app.post( '/signup',         passport.authenticate('local', {
//         failureRedirect: '/',
//         failureFlash : true  
//     }), function(req, res) {
//             console.log("coming here");
//             res.redirect('/');
// });

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


            
            // User.find( function ( err, users, count ){
                
            //     allUsers = users
                        
            //     res.render('Landing', { user: req.session.user, users: allUsers });

            // });

app.get( '/home',  ensureAuthenticated, home.landing_home);
app.get( '/profile', home.profile);
app.get('/logout', home.logout);
var mwMulter1 = multer({ dest: './views/uploads' });
app.post( '/post',  mwMulter1, post_request.post);
app.post( '/searchallposts',  post_request.searchallposts);
app.post( '/editpost', ensureAuthenticated, mwMulter1,post_request.editpost);
app.post( '/viewpost', ensureAuthenticated, mwMulter1,post_request.viewpost);
app.post( '/deletepost', ensureAuthenticated, mwMulter1, post_request.deletepost);

app.get( '/searchPosts', ensureAuthenticated, post_request.searchPosts);
app.get( '/viewallposts', ensureAuthenticated, post_request.viewallposts);
app.get( '/postarequest', ensureAuthenticated, mwMulter1, post_request.postarequest);


app.get( '/artists', artists.artist);
app.post( '/update', artists.update);

app.get( '/postevents',ensureAuthenticated, post_event.postevents);
app.get( '/allEvents', ensureAuthenticated, post_event.allEvents);
app.post( '/posteventDetails', post_event.posteventDetails);


app.get('/error', function(req, res){
    console.log("ERROR OCCURRED " + req.flash('info') + "for User" + req.session.user.facebook.email);
  res.render('error', { message: req.flash('info'),  user: req.session.user});
});

app.get('/aboutus', function(req, res){
  res.render('AboutUs', { user: req.session.user });
});

app.get('/theTeam', function(req, res){
  res.render('AboutUs', { user: req.session.user, hashValue: "slide-3" });
});

app.get('/whereweare', function(req, res){
   res.render('AboutUs', { user: req.session.user, hashValue: "slide-5" });
});

app.get('/faq', function(req, res){
  res.render('faqPage', { user: req.session.user });
});

app.get('/credits', function(req, res){
  res.render('credits', { user: req.session.user });
});

app.get('/privacy', function(req, res){
  res.render('privacypolicy', { user: req.session.user });
});

var mwMulter2 = multer({ dest: './views/tempUploads' });
app.post('/postPhotos', mwMulter2, post_request.postPhoto);

function ensureAuthenticated(req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
           

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

// console.log("argv.fe_ippp: "+argv.fe_ip);
// app.listen(8080,argv.fe_ip);
// console.log("Express serverrrr listening on port 8080");