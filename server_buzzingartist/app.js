
var express       = require('express'),
    FB            = require('fb'),
    http          = require('http'),
    path          = require('path'),
    config        = require('./config'),
    home          = require('./routes/home');

var app = express();
// Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

if(!config.facebook.appId || !config.facebook.appSecret) {
    throw new Error('facebook appId and appSecret required in config.js');
}

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.cookieSession({ secret: 'secret'}));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // TODO - Why Do we need this key ?
    app.use(expressSession({secret: 'mySecretKey'}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function() {
    app.use(express.errorHandler());
});

var dbConfig = require('./db');
var mongoose = require('mongoose');
// var mongoClient = require('mongodb').MongoClient;
// Connect to DB
mongoose.connect(dbConfig.url);


// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    console.log("req.session.access_token inside isAuthenticated: "+req.session.access_token);
    if (req.isAuthenticated() || req.session.access_token)
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}

app.get( '/',                home.index);
app.get( '/login/callback',  home.loginCallback);
app.get( '/logout',          home.logout);
app.post( '/login',          passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash : true  
    }));
app.get( '/signup',          home.signup);
app.post( '/signup',          passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash : true  
    }));
app.get( '/home',          isAuthenticated,home.home);



http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
