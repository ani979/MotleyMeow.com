
var express       = require('express'),
    FB            = require('fb'),
    http          = require('http'),
    path          = require('path'),
    config        = require('./oauth.js'),
    home          = require('./routes/home'),
    mongoose      = require('mongoose');

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
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
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
         callbackURL: config.facebook.callbackURL
         
},
    function(accessToken, refreshToken, profile, done) {

             // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id                   
                        newUser.facebook.token = profile.token; // we will save the token that facebook provides to the user                    
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        console.log("email id " + newUser.facebook.name);
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.local.picture  = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken;
                        
                        console.log("email id " + newUser.facebook.email);

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
        app.use(express.static(__dirname + '/public'));
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
           // update the user object found using findOne
           console.log("here inside city setting " + req.body.city);
           db.facebook.name=req.body.fullname;
           db.local.city = req.body.city;
           console.log("here inside city setting " + db.local.city);
           console.log("here inside name setting " + req.body.name);
           console.log("name set is " + db.facebook.name);
           // now update it in MongoDB

           db.save(function (err, user) {
               if (err) {
                    console.log("ERRRORRRR");
                    res.json(err) ;
                    
                }

               req.session.user = user;
               req.session.loggedIn = true;
               res.redirect('/profile');
           });
        }
    });
});

app.get('/logout', home.logout);
app.get( '/home',  ensureAuthenticated, function(req, res){
            console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);

            console.log("req.user " + req.user);
            res.render('Landing', { user: req.session.user });
});
app.get( '/profile', home.profile);



// app.get( '/',                home.index);
// app.get( '/login/callback',  home.loginCallback);
// app.get( '/logout',          home.logout);
// app.post( '/login',          passport.authenticate('login', {
//         successRedirect: '/home',
//         failureRedirect: '/',
//         failureFlash : true  
//     }));
// app.get( '/signup',          home.signup);
// app.post( '/signup',          passport.authenticate('signup', {
//         successRedirect: '/home',
//         failureRedirect: '/',
//         failureFlash : true  
//     }));
// app.get( '/home',          isAuthenticated,home.home);

// // port
// app.listen(1337);

// test authentication
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next(); }
res.redirect('/')
}

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});




// if(!config.facebook.appId || !config.facebook.appSecret) {
//     throw new Error('facebook appId and appSecret required in config.js');
// }

// app.configure(function() {
//     app.set('port', process.env.PORT || 3000);
//     app.set('views', __dirname + '/views');
//     app.set('view engine', 'ejs');
//     app.use(express.favicon());
//     app.use(express.logger('dev'));
//     app.use(express.cookieParser());
//     app.use(express.cookieSession({ secret: 'secret'}));
//     app.use(express.bodyParser());
//     app.use(express.methodOverride());

//     // TODO - Why Do we need this key ?
//     app.use(expressSession({secret: 'mySecretKey'}));
//     app.use(passport.initialize());
//     app.use(passport.session());

//     app.use(flash());
//     app.use(app.router);
//     app.use(express.static(path.join(__dirname, 'public')));

// });

// app.configure('development', function() {
//     app.use(express.errorHandler());
// });

// var dbConfig = require('./db');
// var mongoose = require('mongoose');
// // var mongoClient = require('mongodb').MongoClient;
// // Connect to DB
// mongoose.connect(dbConfig.url);


// // Initialize Passport
// var initPassport = require('./passport/init');
// initPassport(passport);

// var isAuthenticated = function (req, res, next) {
//     // if user is authenticated in the session, call the next() to call the next request handler 
//     // Passport adds this method to request object. A middleware is allowed to add properties to
//     // request and response objects
//     console.log("req.session.access_token inside isAuthenticated: "+req.session.access_token);
//     if (req.isAuthenticated() || req.session.access_token)
//         return next();
//     // if the user is not authenticated then redirect him to the login page
//     res.redirect('/');
// }





// http.createServer(app).listen(app.get('port'), function() {
//     console.log("Express server listening on port " + app.get('port'));
// });
