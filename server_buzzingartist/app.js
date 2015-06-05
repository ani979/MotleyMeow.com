
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
    blog = require('./routes/blog'),
    multer  = require('multer'),
    argv = require('optimist').argv,
    im = require('imagemagick');

var moment = require('moment');
var argv = require('optimist').argv;
var crypto = require('crypto');
var fsExtra = require('fs')

exports.fsExtra = fsExtra;

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
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
                    console.log("found");
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
                                        User.update({'facebook.id' : user.facebook.id},
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
                        console.log("facebook name " + newUser.facebook.name);
                        if(typeof profile.emails == 'undefined' || profile.emails.length == 0) {
                            newUser.facebook.email = "";
                        } else {
                            newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first    
                        }
                        newUser.local.picture  = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken + '&appsecret_proof=' + req.session.hashValue;
                        newUser.local.joiningDate    = new Date(); 
                        // FB.api(
                        //             '/me?access_token=' + accessToken + '&appsecret_proof=' + req.session.hashValue,
                        //             function (response) {
                        //                 console.log("response "  + response);
                        //               if (response && !response.error) {
                        //                 console.log(" response.link " + response.link);
                        //                 /* handle the result */
                        //                 //user.facebook.link = response.link;
                        //                 User.update({'facebook.email' : newUser.facebook.email},
                        //                          { $set: {"facebook.link": response.link}},
                        //                                     function (err, user) {
                        //                                         if(err) {
                        //                                             console.log("Something went wrong in saving facebook link");
                        //                                             req.flash('info', "Something went wrong in saving facebook link")
                        //                                             res.redirect('/error');
                        //                                         }
                        //                 });                        
                        //               } else {
                        //                 console.log("error in saving FB link " + response.error.message);
                        //                 req.flash('info', "Error in saving FB link")
                        //                 res.redirect('/error');
                        //               }
                        //             }
                        // );    
                        newUser.facebook.link  = "https://www.facebook.com/" + profile.id;
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
     console.log("session " + JSON.stringify(req.session));
     req.session.user = req.user;
     res.redirect('/home');
});


app.get( '/home',  ensureAuthenticated, home.landing_home);
app.post( '/saveNotificationClickDate', home.saveNotificationClickDate);
app.get( '/getNotification', home.getNotification);
app.get( '/profile', home.profile);
app.get( '/profileEdit', ensureAuthenticated, home.profileEdit);
app.get('/logout', home.logout);
var mwMulter1 = multer({ dest: './views/uploads' });
app.post( '/post',  mwMulter1, post_request.post);
app.post( '/searchallposts',  post_request.searchallposts);
app.post( '/editpost', ensureAuthenticated, mwMulter1,post_request.editpost);
app.get( '/viewpost', mwMulter1,post_request.viewpost);
app.post( '/deletepost', ensureAuthenticated, mwMulter1, post_request.deletepost);

app.get( '/searchPosts', ensureAuthenticated, post_request.searchPosts);
app.get( '/viewallposts', ensureAuthenticated, post_request.viewallposts);
app.get( '/viewNotificationPosts', post_request.viewNotificationPosts);

app.get( '/postarequest', ensureAuthenticated, mwMulter1, post_request.postarequest);


app.get( '/artists', artists.artist);
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
app.post( '/getCity', artists.updateCityAndRoles);
app.post( '/showRespect', ensureAuthenticated, artists.showRespect);
app.get( '/postevents',ensureAuthenticated, post_event.postevents);
app.get( '/allEvents', ensureAuthenticated, post_event.allEvents);
app.post( '/posteventDetails', post_event.posteventDetails);


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

//var mwMulter4 = multer({ dest: './views/profile/tempUploads' });
var uploadedFiles = new Array();
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
                        console.log("now going to resize " + file.path);
                        if(file.size <= (500*1024)) {
                            console.log("req.files.image.length " + req.files.image.length)
                            console.log("req.files.length " + req.files.length)
                            if(uploadedFiles.length == req.files.image.length) {
                                res.end();
                            } 
                            
                        }
                        im.resize({
                          srcPath: file.path,
                          dstPath: './views/portfolio/' + req.session.user.facebook.id + "/pictures/" + file.name,
                          width:   1024
                        }, function(err, stdout, stderr){
                          if (err) {
                            console.log("Some error occurred")
                          }
                          uploadedFiles.push(file.path);
                          console.log(" uploadedFiles "+ uploadedFiles.length)
                          console.log(" req.files.image.length "+ req.files.image.length)
                          if(uploadedFiles.length == req.files.image.length || uploadedFiles.length > req.files.image.length) {
                            uploadedFiles = [];
                            res.send({path: req.files.image});
                          }
                        });
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
                    },
                    onParseStart: function() {
                        uploadedFiles = [];
                    }
            }), artists.postProfilePhoto);

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


var mwMulter2 = multer({ dest: './views/tempUploads' });
app.post('/postPhotos', mwMulter2, post_request.postPhoto);

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

app.get('/newBlogPost', blog.newBlogPost);
app.post('/saveNewBlogPostData', blog.saveNewBlogPostData);
app.get('/myBlogPosts', blog.myBlogPosts);
//app.post('/displayFullBlogPost', blog.displayFullBlogPost);
app.get('/displayBlogPost/:blogpostid', blog.displayBlogPost);
app.get('/allBlogs', blog.allBlogs);
app.post('/saveCommentBlogPost', blog.saveCommentBlogPost);
app.get('/editBlogPost/:blogpostid', blog.editBlogPost);
app.post('/editBlogPostData', blog.editBlogPostData);
app.post('/searchBlogPosts', blog.searchBlogPosts);
app.get('/searchallblogposts/:search', blog.searchallblogposts);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

// console.log("argv.fe_ippp: "+argv.fe_ip);
// app.listen(8080,argv.fe_ip);
// console.log("Express serverrrr listening on port 8080");

