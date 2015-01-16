var express = require('express');
var router = express.Router();
var FB = require('fb');
var config = require('../config');
var Step = require('step');

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    redirectUri:    config.facebook.redirectUri
});

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
		 var accessToken = req.session.access_token;
		 console.log("accessToken anupam singhhhh: "+accessToken);
		 if(!accessToken) {
		 	// Display the Login page with any flash message, if any
	    	console.log("message: "+req.flash('message'));
			res.render('index', { 
				user: null,
				loginUrl: FB.getLoginUrl({ scope: 'user_about_me' })
			});
		 } else {
   //      	res.render('index', { 
			// 	user: null,
			// });

	FB.api('/me',{fields:'first_name',access_token :accessToken}, function (result) {
                    console.log("resultttttt in index : "+ result);
                    console.log("resultttttt error in index: "+ result.error);
                    var dataArray;
                            for( x in result ) {
                                    console.log( x + "::::: in index:: " + result[ x ] );
                                    dataArray = result[ x ];
                                    if(x === "first_name") {
                                    	res.render('home', { user: result[ x ]});
                                    }
                                    // console.log("dataArrayyyyy: "+dataArray);
                            }
                            // for( x in dataArray ) {
                            //         console.log( x + "::anupam dataArray::: " + dataArray[ x ] );
                            //         // dataArray = result[ x ];
                            //         // console.log("dataArrayyyyy: "+dataArray);
                            // }
                    if(!result || result.error) {
                        // return res.send(500, result || 'error');
                        // return res.send(500, 'error');
                        res.render('index', { user: null});
                    }
                    // return res.redirect('/');
                    // res.render('index', { user: null});
                });
    	}
    	
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}),function(req, res) {
  console.log("message anupam singhhhhhhhhhhhh");
});

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		// res.render('register',{message: req.flash('message')});
		res.render('login_buzzingartist',{message: req.flash('message')});
		// res.render('testwelcome',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		// res.render('home', { user: req.user });
		res.render('index', { user: req.user.email });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
		// res.render('index', { 
		// 		user: null,
		// 		loginUrl: FB.getLoginUrl({ scope: 'user_about_me' })
		// 	});
	});

	return router;
}





