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
    forum = require('./routes/forum'),
    blog = require('./routes/blog'),
    admin = require('./routes/admin'),
    multer  = require('multer'),
    argv = require('optimist').argv,
    im = require('imagemagick');

var moment = require('moment');
var argv = require('optimist').argv;
var crypto = require('crypto');
var fsExtra = require('fs')
var request = require('request');



exports.fsExtra = fsExtra;
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var nodemailer = require('nodemailer');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var User = require('./models/user.js');
var app = express();
var domain = require('domain');

// Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
 var async = require('async');
var validator = require('validator');
 
 //=> true 

var flash = require('connect-flash');
// Configuring Passport
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook');
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
     TwitterStrategy  = require('passport-twitter').Strategy;
var mandrill = require('mandrill-api/mandrill');
var m = new mandrill.Mandrill('_r3bNHCw5JzpjPLfVRu24g');

var nodemailer = require('nodemailer_old');
var mandrillTransport = require('nodemailer-mandrill-transport');
// var transport = nodemailer.createTransport(mandrillTransport({
//   auth: {
//     apiKey: '_r3bNHCw5JzpjPLfVRu24g'
//   }
// }));
var transport = nodemailer.createTransport("SMTP",{
    service: "Mandrill",
    auth: {
        user: "motleymeow@gmail.com",
        pass: "_r3bNHCw5JzpjPLfVRu24g"
    }
});

//var expressSession = require('express-session');

var dbConfig = require('./db');

mongoose.connect(dbConfig.url);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
            done(err, user);
        });
});
//
passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'facebook.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.log("error " + err);
                return done(err);

            }
                

            // if no user is found, return the message
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            }    

            //if (user.local.password=='0')
              if (typeof user.local.password == 'undefined' || user.local.password=='0' )

                return done(null, false, req.flash('loginMessage', 'Email registered with Social Login.'));
            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong email or password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return su
        
            return done(null, user);
        });


    }));


    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
     

        User.findOne({ 'facebook.email' : email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                        var newUser            = new User();
                        newUser.facebook.name    = req.body.username;
                        newUser.facebook.email    = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.joiningDate  = new Date().toISOString();
                        newUser.facebook.id      = email.substring(0,3) + Math.floor(Math.random()*1000000001);

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            sendTheMail(newUser.facebook.email);
                            return done(null, newUser);
                        });            
            }

        });    


    });

    }));


// config
passport.use(new FacebookStrategy({
         clientID: config.facebook.clientID,
         clientSecret: config.facebook.clientSecret,
         callbackURL: config.facebook.callbackURL,
         passReqToCallback: true,
         enableProof: true
         
},
    function(req,accessToken, refreshToken, profile, done) {
        User.findOne({ $or: [ { 'facebook.email' : profile.emails[0].value }, { 'facebook.id' : profile.id } ] }, function(err, user) {
            if (err)
                return done(err);

            if (user) {
                console.log("here in profile pic")
                hash = crypto.createHmac('sha256', config.facebook.clientSecret).update(accessToken).digest('hex');
                req.session.hashValue = hash;
                if(typeof user.local.joiningDate == 'undefined' || user.local.joiningDate == "") {
                    User.update({'facebook.id' : user.facebook.id},
                                         { $set: {"local.joiningDate": new Date()}},
                                                    function (err, user) {
                                                        if(err) {
                                                            console.log("Something went wrong in saving date");
                                                            req.flash('info', "Something went wrong in saving joining date")
                                                            res.redirect('/error');
                                                        }
                    });                        
                }
                // if(typeof user.local.picture == 'undefined' || user.local.picture == "") {
                //     User.update({'facebook.id' : user.facebook.id},
                //                          { $set: {"local.picture": "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken + '&appsecret_proof=' + req.session.hashValue}},
                //                                     function (err, user) {
                //                                         if(err) {
                //                                             console.log("Something went wrong in saving picture");
                //                                             req.flash('info', "Something went wrong in saving picture")
                //                                             res.redirect('/error');
                //                                         }
                //     });                        
                // }

                if(typeof user.local.picture  == 'undefined' || user.local.picture == null || user.local.picture.substring(0, 4) == 'http') {
                    var picture = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken + '&appsecret_proof=' + req.session.hashValue;
                    if (!fsExtra.existsSync('./views/portfolio/' + user.facebook.id)) {
                    // Do something
                      console.log("The directory does not exist");
                      console.log("creating Directory")
                      fsExtra.mkdirSync('./views/portfolio/' + user.facebook.id);
                      fsExtra.mkdirSync('./views/portfolio/' + user.facebook.id + '/profilePicture');

                    } else if(!fsExtra.existsSync('./views/portfolio/' + user.facebook.id + '/profilePicture')) {
                        console.log("The directory profilePicture does not exist");
                        console.log("creating Directory")
                        fsExtra.mkdirSync('./views/portfolio/' + user.facebook.id + '/profilePicture');
                    }
                    request(picture).pipe(fsExtra.createWriteStream('./views/portfolio/'+user.facebook.id + "/profilePicture/myProfilePic.jpg"));
                    user.local.picture = "/portfolio/"+user.facebook.id + "/profilePicture/myProfilePic.jpg";
                    User.update({'facebook.id' : user.facebook.id},
                                         { $set: {"local.picture": "/portfolio/"+user.facebook.id + "/profilePicture/myProfilePic.jpg"}},
                                                    function (err, user) {
                                                        if(err) {
                                                            console.log("Something went wrong in saving picture");
                                                            req.flash('info', "Something went wrong in saving picture")
                                                            res.redirect('/error');
                                                        }
                    }); 
                }
                if(typeof user.facebook.link == 'undefined' || user.facebook.link == "") {
                    User.update({'facebook.id' : user.facebook.id},
                                         { $set: {"facebook.link": "https://www.facebook.com/" + profile.id}},
                                                    function (err, user) {
                                                        if(err) {
                                                            console.log("Something went wrong in saving link");
                                                            req.flash('info', "Something went wrong in saving link")
                                                            res.redirect('/error');
                                                        }
                    });                        
                }
                req.session.fbAccessToken = accessToken;
                console.log("hash is " + hash);
                return done(null, user); // user found, return that user
             } else {
                // if the user isnt in our database, create a new user
                var newUser          = new User();

                hash = crypto.createHmac('sha256', config.facebook.clientSecret).update(accessToken).digest('hex');
                req.session.hashValue = hash;
                // set all of the relevant information
                newUser.facebook.id    = profile.id; // set the users facebook id     
                newUser.facebook.token = profile.token; // we will save the token that facebook provides to the user                    
                newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                newUser.local.password = '0';
                console.log("facebook name " + newUser.facebook.name);
                if(typeof profile.emails == 'undefined' || profile.emails.length == 0) {
                    newUser.facebook.email = "";
                } else {
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first    
                }
                var userPicture  = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken + '&appsecret_proof=' + req.session.hashValue;
                if (!fsExtra.existsSync('./views/portfolio/' + profile.id)) {
                // Do something
                  console.log("The directory does not exist");
                  console.log("creating Directory")
                  fsExtra.mkdirSync('./views/portfolio/' + profile.id);
                  fsExtra.mkdirSync('./views/portfolio/' + profile.id + '/profilePicture');

                } else if(!fsExtra.existsSync('./views/portfolio/' + profile.id + '/profilePicture')) {
                    console.log("The directory profilePicture does not exist");
                    console.log("creating Directory")
                    fsExtra.mkdirSync('./views/portfolio/' + profile.id + '/profilePicture');
                }
                request(userPicture).pipe(fsExtra.createWriteStream('./views/portfolio/'+ newUser.facebook.id + "/profilePicture/myProfilePic.jpg"));
                newUser.local.picture = "/portfolio/"+newUser.facebook.id + "/profilePicture/myProfilePic.jpg";
                //} 
                newUser.local.joiningDate    = new Date(); 
                newUser.facebook.link  = "https://www.facebook.com/" + profile.id;
                //    console.log("email id " + newUser.facebook.email);
                req.session.fbAccessToken = accessToken;


                // save our user to the database
                newUser.save(function(err) {
                    if (err) {
                        req.flash('info', "Error while saving the user in the database")
                        res.redirect('/error');
                        return done(err);
                    }
                    else {

                        sendTheMail(newUser.facebook.email);

                        // if successful, return the new user
                        return done(null, newUser);
                    }
                });
             }

        });
         
            
    }
));


passport.use(new GoogleStrategy({

        clientID        : config.googleAuth.clientID,
        clientSecret    : config.googleAuth.clientSecret,
        callbackURL     : config.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {
        console.log(" In the callback: Google");
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            console.log(" In the callback: Google - 2");
            User.findOne({ $or: [ { 'facebook.email' : profile.emails[0].value }, { 'facebook.id' : profile.id } ] }, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    if(typeof user.google.id == 'undefined' || user.google.id == "" || user.google.id == null) {
                        user.google.id = profile.id;
                        user.google.link = "https://plus.google.com" + profile.id;

                        user.save(function(err) {
                            if (err) throw err;
                        });
                    } 
                    return done(null, user);
                 
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.facebook.id    = profile.id;
                    newUser.google.token = token;
                    newUser.facebook.name  = profile.displayName;
                    newUser.facebook.email = profile.emails[0].value; // pull the first email
                    newUser.local.joiningDate  = new Date();
                    newUser.local.password='0';
                    //newUser.local.picture ="https://www.googleapis.com/plus/v1/people/"+profile.id+"?fields=image&key="+"AIzaSyAyDiSzWn36310CxR7rbmbu2A_Iu0E-5PI";
                    newUser.google.link = "https://plus.google.com/" + profile.id;
                    newUser.save(function(err) {
                    if (err)
                        throw err;

                        sendTheMail(newUser.facebook.email);
                        return done(null, newUser);
                    });
                }
            });
        });

    }));


var app = express();

// configure upload middleware 
// upload.configure({
//     imageVersions: {
//         thumbnail: {
//             width: 80,
//             height: 80
//         }
//     }
// });


//app.configure(function() {
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
d = domain.create();
//app.use(logger());
app.use(session({
 store: new MongoStore({mongooseConnection: mongoose.connection,ttl: 2 * 24 * 60 * 60,autoRemove: 'native'}),
 secret: 'eg[isfd-8gG10]-7w2315df{}}}+I;li;;t;uy',
 resave:false,
 saveUninitialized:false
}));
 
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

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
app.get( '/',  goToHome, home.index_home);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email' ] }),
    function(req, res){
    });
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
     console.log("setting here");
     console.log("session " + JSON.stringify(req.session));
     req.session.user = req.user;
     res.redirect(req.get('referer'));
});

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }),
    function(req, res){

    });

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
           passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
     console.log("setting here");
     console.log("session " + JSON.stringify(req.session));
     req.session.user = req.user;
     res.redirect(req.get('referer'));
            });

    //  app.get('/auth/twitter', passport.authenticate('twitter'));

    // // handle the callback after twitter has authenticated the user
    // app.get('/auth/twitter/callback',
    //        passport.authenticate('twitter', { failureRedirect: '/' }),
    // function(req, res) {
    //  console.log("setting here");
    //  console.log("session " + JSON.stringify(req.session));
    //  req.session.user = req.user;
    //  res.redirect('/home');
    //         });

    
    app.post('/landing', function(req, res, next) {
        console.log(" Here in Landing post")
        passport.authenticate('local-login', function(err, user, info) {
            if(err) {
                console.log(" Here in error ")
                res.send({message: req.flash('loginMessage')});
                return next(err);
            }
            if(!user) {
                console.log("here in user")
                return res.send({message: req.flash('loginMessage')});
                //return next(err);
            }
            if(user) {
                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    req.session.user = user;
                    return res.send({completed: "OK", redirect: req.get('referer')});
                });
                
            }    
        })(req, res, next);
    });

//   app.post('/landing', passport.authenticate('local-login', function(err, user, info) {
//     console.log("coming here in Login " + info);

//   }), function(req, res) {
//      console.log("setting here");
//      console.log("session " + JSON.stringify(req.session));
//      req.session.user = req.user;
//      res.send({message: req.flash('loginMessage')});
// });
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup',{ failureRedirect: '/signup' }),
        function(req, res) {
             console.log("setting here");
             console.log("session " + JSON.stringify(req.session));
             req.session=null;
             res.redirect('/');
        });    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/landing', isAuthenticated, function(req, res) {
        res.render('/home', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', home.logout);


app.get('/forgot', function(req, res) {
  res.render('forgot', {
    user: req.user,
 //   message: req.flash('info'),
    message: req.flash('error'),
    failureFlash : true
  });
});

app.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ 'facebook.email': req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }
        // if (user){
        //     if (user.facebook.link || user.google.link) {
        //         req.flash('error','You are registered with social login.');
        //         return res.redirect('/forgot');
        //      }   
        // }
        if (user){
            if (typeof user.local.password == 'undefined' || user.local.password=='0' ) {
                req.flash('error','You are registered with social login.');
                return res.redirect('/forgot');
            }
         }   
        user.local.resetPasswordToken = token;
        user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        console.log("ForgotPassword : Save Token")
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
        console.log("ForgotPassword : Send mail")
        var mailOptions = {
            // to: req.body.email,
            // from: 'noreply@motleymeow.com',
            // subject: 'this contains a link',
            // text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            //   'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            //   'http://' + req.headers.host + '/reset?token=' + token + '\n\n' +
            //   'If you did not request this, please ignore this email and your password will remain unchanged.\n'

              "message": {
                    "from_email":"motleymeow@gmail.com",
                    "from_name":"Motley Meow",
                    "to":[{"email":req.body.email}],
                    "subject": "This contains a link",
                    "text": 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
               'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
               'http://' + req.headers.host + '/reset?token=' + token + '\n\n' +
               'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                }
        };


        // transport.sendMail(mailOptions, function(err, info) {
        //m.messages.send(mailOptions, function(res) {
            // if(err) {
            //     req.flash('error', 'Some problem sending email to ' + user.facebook.email + '. Please try later or login with any of your social accounts');
            //     done(err, 'done');
            // } else {
            //     console.log("ForgotPassword : mail sent");
            //     req.flash('error', 'An e-mail has been sent to ' + user.facebook.email + ' with further instructions.');
            //     console.log("Flash message sent")
            //     done(null, 'done');
            //  } 
            m.messages.send(mailOptions, function(res) {
                console.log("Send mail result is " + JSON.stringify(res));
                req.flash('error', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
                done(null, 'done');
            }, function(err) {
                console.log("Send mail err is " + JSON.stringify(err));
                req.flash('error', 'Some problem sending email to ' + req.body.email + '. Please try later or login with any of your social accounts');
                done(err, 'done');
            });  
        //});
    }
  ], function(err, result) {
        if (err) {
            console.log("Error occurred in forgot email " + err)
            return next(err);
            res.redirect('/forgot');
        } else {
            console.log("Mail sent");
            return res.redirect('/forgot');
        }   
  });
});
app.get('/reset', function(req, res) {

    
  User.findOne({ 'local.resetPasswordToken': req.query.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
       
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }

    res.render('reset.ejs', {
      user: req.user,
       message: req.flash('error')
  
    });

  });
});
app.post('/reset', function(req, res) {
  async.waterfall([
    function(done) {
     User.findOne({ 'local.resetPasswordToken': req.query.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
  
     if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        user.local.password = user.generateHash(req.body.password);
        
        user.local.resetPasswordToken = undefined;
        user.local.resetPasswordExpires = undefined;

         user.save(function(err) {
          
            done(err, user);
          });
        
      });
    },
    function(user, done) {

      var mailOptions = {
        // to: user.facebook.email,
        // from: 'noreply@motleymeow.com',
        // subject: 'Your password has been changed',
        // text: 'Hello,\n\n' +
        //   'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        "message": {
                    "from_email":"motleymeow@gmail.com",
                    "from_name":"MotleyMeow",
                    "to":[{"email":user.facebook.email}],
                    "subject": 'Your password has been changed',
                    "text": 'Hello,\n\n' +
                            'This is a confirmation that the password for your account ' + user.facebook.email + ' has just been changed.\n'
                }
      };
      // transport.sendMail(mailOptions, function(err, info) {
      //   req.flash('success', 'Success! Your password has been changed.');
      //   if(err) {
      //       done(err, 'done');
      //   } else {
      //       done(null, 'done');
      //   }
      // });
        m.messages.send(mailOptions, function(res) {
            console.log("Send mail result is " + JSON.stringify(res));
            req.flash('loginMessage', 'Success! Your password has been changed.');
            done(null, 'done');
        }, function(err) {
            console.log("Send mail err is " + JSON.stringify(err));
            req.flash('loginMessage', 'Some problem changing password ');
            done(err, 'done');
        });  
    }
  ], function(err, result) {
    res.redirect('/');
  });
});

app.get( '/home',  ensureAuthenticated, home.landing_home);
app.post( '/saveNotificationClickDate', home.saveNotificationClickDate);
app.get( '/getNotification', home.getNotification);
app.get( '/profile', home.profile);
app.get( '/profileEdit', ensureAuthenticated, home.profileEdit);
app.get('/logout', home.logout);
var mwMulter1 = multer({ dest: './views/uploads' });
app.post( '/post', post_request.post);
app.post( '/crispPost', post_request.crispPost);
app.post( '/searchallposts',  post_request.searchallposts);
app.post( '/editpost', ensureAuthenticated, mwMulter1,post_request.editpost);
app.get( '/viewpost', mwMulter1,post_request.viewpost);
app.post( '/deletepost', ensureAuthenticated, mwMulter1, post_request.deletepost);

app.get( '/searchPosts', ensureAuthenticated, post_request.searchPosts);
app.get( '/viewallposts', ensureAuthenticated, post_request.viewallposts);
app.get( '/viewNotificationPosts', post_request.viewNotificationPosts);

app.get( '/postarequest', ensureAuthenticated, mwMulter1, post_request.postarequest);


app.get( '/artists', artists.artist);
app.post('/saveProfilePic', ensureAuthenticated, artists.saveProfilePic);
app.post('/addProfilePicsLocally', ensureAuthenticated, admin.addProfilePicsLocally);
app.post('/deleteArtist', artists.deleteArtist);
app.get( '/getRecentPosts', ensureAuthenticated, post_request.getRecentPosts);
app.get( '/getRecentArtists', ensureAuthenticated,  artists.getRecentArtists);
// var mwMulter3 = multer({ dest: './views/profile' });
app.post( '/update',
                    multer({ 
                    dest: './views/portfolio/', 
                    changeDest: function(dest, req, res) {
                                    var newDestination = dest + req.session.user.facebook.id;
                                    var stat = null;
                                    try {
                                      stat = fsExtra.statSync(newDestination);
                                    } catch (err) {
                                    fsExtra.mkdirSync(newDestination);
                                    }

                                    var newDestination_1 = newDestination + "/pictures"
                                    try {
                                      stat = fsExtra.statSync(newDestination_1);
                                    } catch (err) {
                                    fsExtra.mkdirSync(newDestination_1);
                                    }
                                    if (stat && !stat.isDirectory()) {
                                        throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
                                    }
                                    return newDestination_1
                                }
                    }), ensureAuthenticated, artists.update);
app.get( '/contactArtists', artists.contactArtists);
app.post( '/getEmails', artists.getEmails);
app.post( '/getEmailsForPost', artists.getEmailsForPost);
app.post('/sendMailsToArtists', artists.sendMailsToArtists);
app.get('/unsubscribeme', artists.unsubscribeme);
app.post('/unsubscribeFromMailing', artists.unsubscribeFromMailing);

app.post( '/getCity', artists.updateCityAndRoles);
app.post( '/showRespect', ensureAuthenticated, artists.showRespect);
app.get( '/postevents',ensureAuthenticated, post_event.postevents);
app.get( '/allEvents', ensureAuthenticated, post_event.allEvents);
app.post( '/posteventDetails', post_event.posteventDetails);
app.post('/sendPostMailsToArtists', post_request.sendPostMailsToArtists);
app.post('/indicateMailToBeSent', post_request.indicateMailToBeSent);

app.get('/error', function(req, res){
  res.render('error', { message: req.flash('info'), user:req.session.user});
});

app.get('/header', function(req, res){
  console.log(" FOR HEADER");
  res.render('header', { user: req.session.user});
});

app.get('/aboutus', function(req, res){
  res.render('AboutUs', { user: req.session.user });
});

app.get('/theTeam', function(req, res){
  res.render('AboutUs', { user: req.session.user, hashValue: "section-testimonials" });
});

app.get('/whereweare', function(req, res){
   res.render('AboutUs', { user: req.session.user, hashValue: "section-pricing" });
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
app.post('/addBlogPics', ensureAuthenticated, multer({ 
                    dest: './views/blog/', 
                    putSingleFilesInArray: true,
                    limits: { fileSize: 25* 1024 * 1024},
                    changeDest: function(dest, req, res) {
                                    var newDestination = dest + req.session.user.facebook.id;
                                    var stat = null;
                                    try {
                                      stat = fsExtra.statSync(newDestination);
                                    } catch (err) {
                                    fsExtra.mkdirSync(newDestination);
                                    }

                                    var newDestination_1 = newDestination + "/pictures"
                                    try {
                                      stat = fsExtra.statSync(newDestination_1);
                                    } catch (err) {
                                    fsExtra.mkdirSync(newDestination_1);
                                    }
                                    if (stat && !stat.isDirectory()) {
                                        throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
                                    }
                                    return newDestination_1
                    },
                    onFileUploadStart: function (file, req, res) {
                        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
                            console.log("OK to start upload");
                        } else {
                            return false;
                        }
                    },
                    onFileUploadComplete: function (file, req, res) {
                        console.log("Upload completed " + file.name)
                        // if(file.size <= (500*1024)) {
                        //     console.log("req.files.image.length " + req.files.image.length)
                        //     console.log("req.files.length " + req.files.length)
                        //     if(uploadedFiles.length == req.files.image.length) {
                        //         console.log("Finally Ending here");
                        //         res.end();
                        //     } 
                            
                        // }
                        
                        
                    },
                    onFileSizeLimit: function (file) {
                      console.log('Failed: ', file.originalname)
                      fsExtra.unlink('./' + file.path) // delete the partially written file 
                      return false;
                    },
                    onParseEnd: function (req, next) {
                      console.log('Form parsing completed at: ', new Date());
                      // call the next middleware
                      next();
                    }
            }), function(req,res) {
                async.each(req.files.image, 
                    function(file, callback) {
                        // Perform operation on file here.
                        if(file.size <= (500*1024)) {
                            console.log("here")
                            callback();
                        } else {
                            im.resize({
                              srcPath: file.path,
                              dstPath: './views/blog/' + req.session.user.facebook.id + "/pictures/" + file.name,
                              width:   1024
                            }, function(err, stdout, stderr){
                              if (err) {
                                console.log("Some error occurred")
                                callback(err);
                              } else {
                                  console.log(" DONE " + file.path);
                                  callback();
                              }   

                            });
                        }    
                }, function(err){
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                          // One of the iterations produced an error.
                          // All processing will now stop.
                        console.log('A file failed to process');
                    } else {
                        res.send({path: req.files.image});
                        res.end();
                        console.log('All files have been processed successfully');
                    }
                });

                }   
);
//var mwMulter4 = multer({ dest: './views/profile/tempUploads' });
app.post('/postProfilePics', multer({ 
                    dest: './views/portfolio/', 
                    putSingleFilesInArray: true,
                    limits: { fileSize: 5* 1024 * 1024},
                    changeDest: function(dest, req, res) {
                                    var newDestination = dest + req.session.user.facebook.id;
                                    var stat = null;
                                    try {
                                      stat = fsExtra.statSync(newDestination);
                                    } catch (err) {
                                    fsExtra.mkdirSync(newDestination);
                                    }

                                    var newDestination_1 = newDestination + "/pictures"
                                    try {
                                      stat = fsExtra.statSync(newDestination_1);
                                    } catch (err) {
                                    fsExtra.mkdirSync(newDestination_1);
                                    }
                                    if (stat && !stat.isDirectory()) {
                                        throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
                                    }
                                    return newDestination_1
                    },
                    onFileUploadStart: function (file, req, res) {
                        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
                            console.log("OK to start upload");
                        } else {
                            return false;
                        }
                    },
                    onFileUploadComplete: function (file, req, res) {
                        console.log("file upload completed for profile picture" + file.path);
                        
                        // gm(file.path)
                        //     .resize(240, 240)
                        //     .noProfile()
                        //     .write('./views/portfolio/newImage.jpg', function (err) {
                        //       if (!err) { 
                        //         console.log('done') 
                        //       } else {
                        //         console.log("error " + err);
                        //       }  
                        // });
                    },
                    onFileSizeLimit: function (file) {
                      console.log('Failed: ', file.originalname)
                      fsExtra.unlink('./' + file.path) // delete the partially written file 
                      return false;
                    },
                    onParseEnd: function (req, next) {
                      console.log('Form parsing completed at: ', new Date());
                      // call the next middleware
                      next();
                    }
            }), function(req,res) {
                 console.log(JSON.stringify(req.files));
                 console.log(" req.files.image.length "+ req.files.image.length)
                 async.each(req.files.image, 
                    function(file, callback) {
                        // Perform operation on file here.
                        if(file.size <= (500*1024)) {
                            console.log("here")
                            callback();
                        } else {
                            im.resize({
                              srcPath: file.path,
                              dstPath: './views/portfolio/' + req.session.user.facebook.id + "/pictures/" + file.name,
                              width:   1024
                            }, function(err, stdout, stderr){
                              if (err) {
                                console.log("Some error occurred")
                                callback(err);
                              } else {
                                  console.log(" DONE " + file.path);
                                  callback();
                              }   

                            });
                        }    
                }, function(err){
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                          // One of the iterations produced an error.
                          // All processing will now stop.
                        console.log('A file failed to process');
                    } else {
                        res.send({path: req.files.image});
                        res.end();
                        console.log('All files have been processed successfully');
                    }
                });
                
});

app.post('/postProfileResume', multer({ 
    dest: './views/portfolio/', 
    changeDest: function(dest, req, res) {
                    var newDestination = dest + req.session.user.facebook.id;
                    var stat = null;
                    try {
                      stat = fsExtra.statSync(newDestination);
                    } catch (err) {
                    fsExtra.mkdirSync(newDestination);
                    }

                    var newDestination_1 = newDestination + "/resume"
                    try {
                      stat = fsExtra.statSync(newDestination_1);
                    } catch (err) {
                    fsExtra.mkdirSync(newDestination_1);
                    }
                    if (stat && !stat.isDirectory()) {
                        throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
                    }
                    return newDestination_1
                }
    }), artists.postProfileResume);


var mwMulter2 = multer({ dest: './views/uploads' });
app.post('/addPostImagePics', ensureAuthenticated, multer({ 
            dest: './views/uploads/', 
            putSingleFilesInArray: true,
            limits: { fileSize: 25* 1024 * 1024},
            changeDest: function(dest, req, res) {
                            var newDestination = dest + req.session.user.facebook.id;
                            var stat = null;
                            try {
                              stat = fsExtra.statSync(newDestination);
                            } catch (err) {
                            fsExtra.mkdirSync(newDestination);
                            }

                            var newDestination_1 = newDestination + "/pictures"
                            try {
                              stat = fsExtra.statSync(newDestination_1);
                            } catch (err) {
                            fsExtra.mkdirSync(newDestination_1);
                            }
                            if (stat && !stat.isDirectory()) {
                                throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
                            }
                            return newDestination_1
            },
            onFileUploadStart: function (file, req, res) {
                if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
                    console.log("OK to start upload");
                } else {
                    return false;
                }
            },
            onFileUploadComplete: function (file, req, res) {
                console.log("Upload completed " + file.name)
            },
            onFileSizeLimit: function (file) {
              console.log('Failed: ', file.originalname)
              fsExtra.unlink('./' + file.path) // delete the partially written file 
              return false;
            },
            onParseEnd: function (req, next) {
              console.log('Form parsing completed at: ', new Date());
              // call the next middleware
              next();
            }
    }), function(req,res) {
        async.each(req.files.image, 
            function(file, callback) {
                // Perform operation on file here.
                if(file.size <= (500*1024)) {
                    console.log("here")
                    callback();
                } else {
                    im.resize({
                      srcPath: file.path,
                      dstPath: './views/uploads/' + req.session.user.facebook.id + "/pictures/" + file.name,
                      width:   1024
                    }, function(err, stdout, stderr){
                      if (err) {
                        console.log("Some error occurred")
                        callback(err);
                      } else {
                          console.log(" DONE " + file.path);
                          callback();
                      }   

                    });
                }    
        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                  // One of the iterations produced an error.
                  // All processing will now stop.
                console.log('A file failed to process');
            } else {
                res.send({path: req.files.image});
                res.end();
                console.log('All files have been processed successfully');
            }
        });

        }   
);

app.post('/postPhotos', ensureAuthenticated, multer({ 
            dest: './views/tempUploads/', 
            putSingleFilesInArray: true,
            limits: { fileSize: 25* 1024 * 1024},
            changeDest: function(dest, req, res) {
                            var newDestination = dest;
                            var stat = null;
                            try {
                              stat = fsExtra.statSync(newDestination);
                            } catch (err) {
                            fsExtra.mkdirSync(newDestination);
                            }

                            return newDestination;
            },
            onFileUploadStart: function (file, req, res) {
                if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
                    console.log("OK to start upload");
                } else {
                    return false;
                }
            },
            onFileUploadComplete: function (file, req, res) {
                console.log("Upload completed " + file.name)
            },
            onFileSizeLimit: function (file) {
              console.log('Failed: ', file.originalname)
              fsExtra.unlink('./' + file.path) // delete the partially written file 
              return false;
            },
            onParseEnd: function (req, next) {
              console.log('Form parsing completed at: ', new Date());
              // call the next middleware
              next();
            }
    }), function(req,res) {
        async.each(req.files.image, 
            function(file, callback) {
                // Perform operation on file here.
                console.log("Going for resize " + file.name);
                im.resize({
                  srcPath: file.path,
                  dstPath: './views/tempUploads/' + file.name,
                  width:   200,
                  height:  200
                }, function(err, stdout, stderr){
                  if (err) {
                    console.log("Some error occurred")
                    callback(err);
                  } else {
                      console.log(" DONE " + file.path);
                      callback();
                  }   

                });
        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                  // One of the iterations produced an error.
                  // All processing will now stop.
                console.log('A file failed to process');
            } else {
                console.log("req.files " + JSON.stringify(req.files));
                res.send({path: req.files.image[0].name});
                res.end();
                console.log('All files have been processed successfully');
            }
        });

        }   
);

function ensureAuthenticated(req, res, next) {
    console.log("req.user " + req.user)
    console.log("req.session.user " + req.session.user);
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.isAuthenticated()) { 
        return next(); 
    }
    console.log("not authenticated");
    res.redirect('/')
}

function ensureAuthenticatedAndAdmin(req, res, next) {
    console.log("req.user " + req.user)
    console.log("req.session.user " + req.session.user);
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.isAuthenticated()) {
        if(req.user.local.adminRole) {
            return next();
        } else {
            console.log("user is not an admin")
        }
         
    }

    console.log("not authenticated");
    res.redirect('/')
}


/*Functions for Forum*/
app.get('/forum', ensureAuthenticated, forum.viewForum);
app.get('/viewCategory', ensureAuthenticated, forum.viewCategory);
app.post('/createNewThread', ensureAuthenticated, forum.createNewThread);
app.get('/viewThread', forum.viewThread);
app.post('/createReply', ensureAuthenticated, forum.createReply);
app.get('/displayForumReplies', forum.displayForumReplies);
app.post('/editOldThread', ensureAuthenticated, forum.editOldThread);
app.post('/deleteForumThread', ensureAuthenticated, forum.deleteForumThread);
app.post('/deleteForumThreadComment', ensureAuthenticated, forum.deleteForumThreadComment)
app.post('/editForumThreadComment', ensureAuthenticated, forum.editForumThreadComment)
app.post('/openOrCloseForumThread', ensureAuthenticated, forum.openOrCloseForumThread)
app.post('/subscribeme', ensureAuthenticated, forum.subscribeme)
app.post('/unsubscribeme', ensureAuthenticated, forum.unsubscribeme)
app.post('/subscribemeForThread', ensureAuthenticated, forum.subscribemeForThread)
app.post('/unsubscribemeForThread', ensureAuthenticated, forum.unsubscribemeForThread)


app.get('/newBlogPost', ensureAuthenticated, blog.newBlogPost);
app.post('/saveNewBlogPostData', ensureAuthenticated, blog.saveNewBlogPostData);
app.get('/myBlogPosts', ensureAuthenticated, blog.myBlogPosts);
app.post('/deleteBlogPost', ensureAuthenticated, blog.deleteBlogPost);

app.get('/displayComments', blog.displayComments);
//app.post('/displayFullBlogPost', blog.displayFullBlogPost);
app.get('/displayBlogPost', blog.displayBlogPost);
app.get('/allBlogs', blog.allBlogs);
app.post('/saveCommentBlogPost', ensureAuthenticated, blog.saveCommentBlogPost);
app.get('/editBlogPost', ensureAuthenticated, blog.editBlogPost);
app.post('/editBlogPostData', ensureAuthenticated, blog.editBlogPostData);
app.post('/searchBlogPosts', blog.searchBlogPosts);
app.get('/searchallblogposts', blog.searchallblogposts);
app.get('/searchmyblogposts', ensureAuthenticated, blog.searchmyblogposts);
app.post('/deleteBlogComment', ensureAuthenticated, blog.deleteBlogComment)
app.post('/editBlogComment', ensureAuthenticated, blog.editBlogComment)



// routes
app.get( '/startAdministration',  ensureAuthenticatedAndAdmin, admin.startAdministration);
app.post( '/retrieveOldPosts',  ensureAuthenticatedAndAdmin, admin.retrieveOldPosts);
app.post( '/deleteOldPosts',ensureAuthenticatedAndAdmin, admin.deleteOldPosts);

app.post( '/retrieveOldEvents',  ensureAuthenticatedAndAdmin, admin.retrieveOldEvents);
app.post( '/deleteOldEvents',ensureAuthenticatedAndAdmin, admin.deleteOldEvents);



// http.createServer(app).listen(app.get('port'), function() {
//     console.log("Express server listening on port " + app.get('port'));
// });

// console.log("argv.fe_ippp: "+argv.fe_ip);


d.run(function() {
    http.createServer(app).listen(app.get('port'), function() {
        console.log("Express server listening on port " + app.get('port'));
    });
    // console.log("argv.fe_ippp: "+argv.fe_ip);
    // app.listen(8080,argv.fe_ip);
    // console.log("Express serverrrr listening on port 8080");
});




d.on('error', function(err) {
  console.error(err);
});

// console.log("argv.fe_ippp: "+argv.fe_ip);
// app.listen(8080,argv.fe_ip);
    // console.log("Express serverrrr listening on port 8080");



function sendTheMail(email) {
    var params = {
                "template_name": "MotleyMeow Welcome Email",
                "template_content": [
                    {
                        "name": "example name",
                        "content": "example content"
                    }
                ],

                "message": {
                    "from_email":"motleymeow@gmail.com",
                    "from_name":"Motley Meow",
                    "to":[{"email":email}],
                    "subject": "Welcome to MotleyMeow!",
                    "text": "text in the message"
                }
            };
    // Send the email!
    console.log("Sending the mail")
    m.messages.sendTemplate(params, function(res) {
        console.log("Send mail result is " + JSON.stringify(res));
    }, function(err) {
        console.log("Send mail err is " + JSON.stringify(err));
    });
}

function goToHome(req, res, next){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.isAuthenticated()) {
        res.redirect('/home')
         
    } else {
        console.log("not authenticated");
        return next();
    }
};
