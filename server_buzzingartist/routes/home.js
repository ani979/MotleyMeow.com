
var FB              = require('fb'),
    Step            = require('step'),

    config          = require('../config');
    // passport = require('../passport/passport');
    // passport = require('passport');

var User = require('../models/user');

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

// var isAuthenticated = function (req, res, next) {
//     // if user is authenticated in the session, call the next() to call the next request handler 
//     // Passport adds this method to request object. A middleware is allowed to add properties to
//     // request and response objects
//     console.log("req.session.access_token inside home.isAuthenticated: "+req.session.access_token);
//     console.log("req.session.access_token inside home.req.isAuthenticated(): "+req.isAuthenticated());
//     if (req.isAuthenticated() || req.session.access_token)
//         return next();
//     // if the user is not authenticated then redirect him to the login page
//     // res.redirect('/');
//     return null;
// }

exports.index = function(req, res) {
    //req.session = null;
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

exports.loginCallback = function (req, res, next) {
    var code            = req.query.code;
    console.log("I am here in the callback and code is " + code);
    if(req.query.error) {
        // user might have disallowed the app
        console.log("Am i here1");
        return res.send('login-error ' + req.query.error_description);
    } else {
        console.log("Am i here2");
        return res.redirect('/');
    }

    Step(
        function exchangeCodeForAccessToken() {
            FB.napi('oauth/access_token', {
                client_id:      FB.options('appId'),
                client_secret:  FB.options('appSecret'),
                redirect_uri:   FB.options('redirectUri'),
                code:           code
            }, this);
        },
        function extendAccessToken(err, result) {
            if(err) throw(err);
            FB.napi('oauth/access_token', {
                client_id:          FB.options('appId'),
                client_secret:      FB.options('appSecret'),
                grant_type:         'fb_exchange_token',
                fb_exchange_token:  result.access_token
            }, this);
        },
        function (err, result) {
            if(err) return next(err);

            req.session.access_token    = result.access_token;
            req.session.expires         = result.expires || 0;
            return res.redirect('/');
        }
    );
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

exports.home = function (req,res) {
    console.log("HOME_PAGE accessToken: "+req.session.access_token);
    if(req.session.access_token) {
         FB.api('/me',{access_token :req.session.access_token}, function (result) {
                    console.log("resultttttt in index : "+ result);
                    console.log("resultttttt error in index: "+ result.error);
                    console.log("name: "+result.name);
                    var dataArray;
                            // for( x in result ) {
                            //         console.log( x + "::::: in index:: " + result[ x ] );
                            //         dataArray = result[ x ];
                            //         if(x === "first_name") {
                            //             res.render('home', { user: result[ x ]});
                            //         }
                            // }

                            pushFacebookId(result);
                            profile = {
                                firstName:result.first_name,
                                fullName:result.name,
                                email:result.email,
                                gender:result.gender,
                            };
                            res.render('home', { user: profile});

                    if(!result || result.error) {
                        console.log("ERRRORRRRR");
                        res.render('index', { user: null});
                    }
                });
    } else {
        console.log("usernameeeee: "+req.param('username'));
        console.log("req.user: "+req.user);
        console.log("usernameeeee from USER data: "+req.user.firstName);
        console.log("usernameeeee from USER data: "+req.user.lastName);
        var firstN = req.user.firstName;
        var lastN = req.user.lastName;
        var fullN = firstN + " " + lastN;
        console.log("var firstname: "+firstN);
                            profile = {
                                firstName:firstN,
                                fullName:fullN,
                                email:req.user.email,
                                gender:req.user.gender,
                            };
                            res.render('home', { user: profile});
    }
   
};

exports.signup = function (req, res) {
    console.log("SIGNUPPP");
    res.render('login_buzzingartist');
};

var pushFacebookId = function(profile) {
                 // find a user in Mongo with provided username
                User.findOne({ 'email' :  profile.email }, function(err, user) {
                    // In case of any error, return using the done method
                    console.log("user: "+user);
                    if (err){
                        console.log('Error in SignUp: '+err);
                        // return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with username: '+profile.email);
                        // return done(null, false, req.flash('message','User Already Exists'));
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = new User();
                        console.log("profile.email:::::::: "+profile.email);
                        // set the user's local credentials
                        newUser.email = profile.email;

                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            // return done(null, newUser);
                        });
                    }
                });
};
