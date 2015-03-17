
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
    multer  = require('multer'),
    argv = require('optimist').argv;

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

                     console.log("found user");
                        hash = crypto.createHmac('sha256', config.facebook.clientSecret).update(accessToken).digest('hex');
                        req.session.hashValue = hash;
                        if(typeof user.local.joiningDate == 'undefined' || user.local.joiningDate == "") {
                            User.update({'facebook.email' : user.facebook.email},
                                                 { $set: {"local.joiningDate": new Date()}},
                                                            function (err, user) {
                                                                if(err) {
                                                                    console.log("Something went wrong in saving date");
                                                                    req.flash('info', "Something went wrong in saving joining date")
                                                                    res.redirect('/error');
                                                                }
                            });                        
                        }
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
                        newUser.local.joiningDate    = new Date(); 
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
app.use(session({
 name: 'artistSession',
 secret: 'eg[isfd-8gG10]-7w2315df{}}}+I;li;;t;uy',
}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(app.router);
app.use(express.static(__dirname + '/views'));



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


app.get( '/home',  ensureAuthenticated, home.landing_home);
app.get( '/profile', home.profile);
app.get('/logout', home.logout);
var mwMulter1 = multer({ dest: './views/uploads' });
app.post( '/post',  mwMulter1, post_request.post);
app.post( '/searchallposts',  post_request.searchallposts);
app.post( '/editpost', ensureAuthenticated, mwMulter1,post_request.editpost);
app.get( '/viewpost', mwMulter1,post_request.viewpost);
app.post( '/deletepost', ensureAuthenticated, mwMulter1, post_request.deletepost);

app.get( '/searchPosts', ensureAuthenticated, post_request.searchPosts);
app.get( '/viewallposts', ensureAuthenticated, post_request.viewallposts);
app.get( '/postarequest', ensureAuthenticated, mwMulter1, post_request.postarequest);


app.get( '/artists', artists.artist);
app.post('/deleteArtist', artists.deleteArtist);
app.get( '/getRecentPosts', post_request.getRecentPosts);
app.get( '/getRecentArtists', artists.getRecentArtists);
app.post( '/update', artists.update);
app.get( '/contactArtists', artists.contactArtists);
app.post( '/getEmails', artists.getEmails);
app.post( '/getCity', artists.updateCityAndRoles);

app.get( '/postevents',ensureAuthenticated, post_event.postevents);
app.get( '/allEvents', ensureAuthenticated, post_event.allEvents);
app.post( '/posteventDetails', post_event.posteventDetails);


app.get('/error', function(req, res){
  res.render('error', { message: req.flash('info')});
});

app.get('/header', function(req, res){
  console.log(" FOR HEADER");
  res.render('header', { user: req.session.user});
});

app.get('/aboutus', function(req, res){
  res.render('AboutUs', { user: req.session.user });
});

app.get('/theTeam', function(req, res){
  res.render('AboutUs', { user: req.session.user, hashValue: "slide-8" });
});

app.get('/whereweare', function(req, res){
   res.render('AboutUs', { user: req.session.user, hashValue: "slide-5" });
});
app.get('/supportUs', function(req, res){
   res.render('SupportUs', { user: req.session.user});
});

app.get('/comingsoon', function(req, res){
   res.render('comingsoon', { user: req.session.user});
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

app.get('/terms', function(req, res){
  res.render('terms', { user: req.session.user });
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

