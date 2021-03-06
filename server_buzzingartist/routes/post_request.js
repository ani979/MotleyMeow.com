var Posts = require('../models/posts.js');
var User = require('../models/user.js');
var app = require('../app.js');
var dropdowns = require('../views/js/theatreContrib.js');
var mandrill = require('mandrill-api/mandrill');
var m = new mandrill.Mandrill('_r3bNHCw5JzpjPLfVRu24g');
var app = require('../app.js');
var async        = require('async')
var fsEtxra = require('fs-extra')
var request = require('request').defaults({ encoding: null });
//var mailer   = require("mailer")            //required for setting mail server
  //, mailerUsername = "motleymeow@gmail.com"
  //, mailerPassword = "_r3bNHCw5JzpjPLfVRu24g";

'use strict';
var nodemailer = require('nodemailer');
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

exports.crispPost = function (req, res) {
    console.log("New post");
    var newPost = new Posts();
    console.log("req.body = " + JSON.stringify(req.body));
    // set all of the facebook information in our user model
    newPost.post.userid    = req.session.user.facebook.id; 
    newPost.post.user    = req.session.user; 
    newPost.post.postTitle = req.body.postTitle;
    newPost.post.postDetail = req.body.post;
    newPost.post.date = new Date();
    console.log(" req.body.myPostPics " + req.body.myPostPics)
    if(typeof req.body.myPostPics != "undefined") {
        newPost.post.imagePath = req.body.myPostPics;
    }
    
    // console.log("req.files " + JSON.stringify(req.files));
    // //console.log("req.body.imageForAPost " + req.body.postedImage);
    // if(typeof req.files == 'undefined' || typeof req.files.imageForAPost == 'undefined') {
    //     // if(req.body.postedImage != "" && req.body.postedImage != "notChanged") {
    //     //     newPost.post.imagePath = req.body.postedImage;
    //     // }
    //     newPost.post.imagePath = "";    
    // } else {
    //     newPost.post.imagePath = req.files.imageForAPost.name;
    // }
    newPost.save(function(err, post) {
               if (err) {
                    req.flash('info', "Error while saving the new Post in the database")
                    res.redirect('/error');  
                } else {
                    req.session.postId = post.id;
                    res.redirect('/home');
                }
    });
}    


exports.post = function (req, res) {
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
    // app.fsExtra.remove('./views/tempUploads', function(err) {
    //           if (err) return console.error(err)
              
    //           console.log("successfully removed!")
    // })

    // app.fsExtra.readdirSync('./views/tempUploads').forEach(function(fileName) {
    //     console.log("Removing file " + fileName);
    //     app.fsExtra.unlinkSync('./views/tempUploads/'+fileName);
    // });
    console.log("req.body._postid: "+req.body._postid);
    if(typeof req.body._postid != 'undefined') {
        console.log("posts already existed");
        Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  // res.send({ error: error }); 
                    req.flash('info', "Error while finding the user exising post")
                    res.redirect('/error');         
                } else {

                    console.log("req.body:::::::::: "+JSON.stringify(req.body));  
                    db.post.postTitle = req.body.postTitle;
                    db.post.postDetail = req.body.post;
                    if(req.body.indicateMailToBeSent == "true") {
                        db.post.mailRequested = true;
                    }

                    if(typeof db.post.imagePath != 'undefined' || db.post.imagePath != "") {
                        // Check if request has some files. If it has check if both the files are same, if yes dont do anthing else delete file from tmp folder
                        // if both the files are same, dont do anything. Set db image to imagePath
                        // if req.files is undefined, dont do anything it means user has not selectedt any new image and has just posted as it is. 
                        if(typeof req.body.myPostPictures != 'undefined' && typeof req.body.myPostPictures != "") {
                            if(db.post.imagePath != req.body.myPostPictures) {
                                console.log("found an image " + db.post.imagePath);
                                app.fsExtra.unlink('./views/uploads/'+ req.session.user.facebook.id + "/pictures/" + db.post.imagePath, function (err) {
                                    if (err) { console.log("cannto delete as file not present"); return; }
                                        console.log('successfully deleted');
                                });
                            } else {
                                console.log("No change in image " + db.post.imagePath);
                            }
                            db.post.imagePath = req.body.myPostPictures;
                        }  else {
                            // We are here when db has an image but req doesnt have. Then dont do anything
                            // Dont do anything db.post.imagePath = "";
                            db.post.imagePath = "";
                            app.fsExtra.unlink('./views/uploads/'+ req.session.user.facebook.id + "/pictures/" +db.post.imagePath, function (err) {
                                if (err) { console.log("cannto delete as file not present"); return; }
                                    console.log('successfully deleted');

                            });
                        }
                       
                    } else {
                        // We come here when image is not in DB. If req.files is undefined, the n set image path to empty else set it to whatever req.files has.
                        if(typeof req.body.myPostPictures == 'undefined' || typeof req.body.myPostPictures == 'undefined') {
                            db.post.imagePath = "";
                        } else {
                            db.post.imagePath = req.body.myPostPictures;
                        }   
                    }
                    db.post.date = new Date();
                    db.post.city = cityarr;
                    db.requirement.role = rolearr;
                    db.requirement.lang = langarr;

                   // update the user object found using findOne
                   console.log("req.body.title" + req.body.postTitle);
                    db.save(function (err, post) {
                                if (err) {
                                // res.json(err) ;
                                    req.flash('info', "Error while saving the modifications done in the existing post")
                                    res.redirect('/error');
                                } else {
                                    req.session.postId = post.id;
                                    res.redirect('/searchPosts');
                                }
                            });
                }  
            });
    } else {
        console.log("New post");
            var newPost = new Posts();
            console.log("req.body = " + JSON.stringify(req.body));
            // set all of the facebook information in our user model
            newPost.post.userid    = req.session.user.facebook.id; 
            newPost.post.user    = req.session.user; 
            newPost.post.postTitle = req.body.postTitle;
            newPost.post.postDetail = req.body.post;
            newPost.post.date = new Date();
            newPost.post.city = cityarr;
            newPost.requirement.role = rolearr;
            newPost.requirement.lang = langarr;
            if(req.body.indicateMailToBeSent == "true") {
                newPost.post.mailRequested = true;
            }
            console.log(" req.body.myPostPictures " + req.body.myPostPictures)
            if(typeof req.body.myPostPictures != "undefined") {
                newPost.post.imagePath = req.body.myPostPictures;
            }
            
            // console.log("req.files " + JSON.stringify(req.files));
            // //console.log("req.body.imageForAPost " + req.body.postedImage);
            // if(typeof req.files == 'undefined' || typeof req.files.imageForAPost == 'undefined') {
            //     // if(req.body.postedImage != "" && req.body.postedImage != "notChanged") {
            //     //     newPost.post.imagePath = req.body.postedImage;
            //     // }
            //     newPost.post.imagePath = "";    
            // } else {
            //     newPost.post.imagePath = req.files.imageForAPost.name;
            // }
            newPost.save(function(err, post) {
                       if (err) {
                            req.flash('info', "Error while saving the new Post in the database")
                            res.redirect('/error');  
                        } else {
                            req.session.postId = post.id;
                            res.redirect('/searchPosts');
                        }
                    });
    }

};


exports.searchPosts = function (req, res) {
    var allUsers;
    var recentChangedPostId = "";
    //console.log("req.user.email " + req.session.user.facebook.email);
    if(typeof req.session.postId !='undefined') {
        recentChangedPostId = req.session.postId;
        req.session.postId = null;
    }

    Posts.find({ 'post.userid' : req.session.user.facebook.id }, function(error, db) {
        //     console.log("coming 1");
        if (error || !req.user) {
            console.log("ERROR NOT A VALID");
          // res.send({ error: error });          
          req.flash('info', "Error while trying to find the user's post")
          res.redirect('/error'); 
        } else {
          // console.log("found user's post: " + db.post);
          console.log("found user's post length: " + db.length);
          res.render('post_search', { postdb: db,  user:req.session.user, recentPostId:recentChangedPostId});
        }    
     });   
};

exports.getRecentPosts = function (req, res) {
    //console.log(" here in recent posts");
     //var selectedCity = new Array();

     Posts.aggregate([{ $match: { 'post.date': { $lte: new Date() } } } , { $sort : { 'post.date' : -1 } }, {$limit:5} ],
                                function(err, recentPosts) {
                                  if(typeof recentPosts != 'undefined') {
                                      console.log("recentPosts " + recentPosts.length);
                                      res.render("recentPostsPage", {allPosts:recentPosts})
                                  }    
                                });
     //console.log(" req.session.user " + req.session.user)
    // if(typeof req.session.user.local.city != 'undefined' && req.session.user.local.city != "") {
    //     if(req.session.user.local.city == "Bengaluru" || req.session.user.local.city == "Bangalore") {
    //         selectedCity.push("Bangalore", "Bengaluru");
    //     } else if(req.session.user.local.city == "Calcutta" || req.session.user.local.city == "Kolkata") {
    //         selectedCity.push("Calcutta", "Kolkata");
    //     } else if(req.session.user.local.city == "Mumbai" || req.session.user.local.city == "Bombay") {
    //         selectedCity.push("Mumbai", "Bombay");
    //     } else if (req.session.user.local.city != "None") {
    //         selectedCity.push(req.session.user.local.city);
    //     } 
    
    
        
        // console.log("selected city " + selectedCity[0])
        // console.log("selected City length " + selectedCity.length)
         //console.log("new Date() " + new Date())
    //     Posts.aggregate([{ $match: { $and: [ { 'post.city': { $in: selectedCity } }, 
    //                             { 'post.date': { $lte: new Date() } } ] } } , { $sort : { 'post.date' : -1 } }, {$limit:5} ],
    //                             function(err, recentPosts) {
    //                               if(typeof recentPosts != 'undefined') {
    //                                 // for(var i = 0; i < recentPosts.length; i++) {
    //                                 //     console.log("recentPosts in city " + recentPosts[i].post.postTitle);
    //                                 // }
                                      
    //                                   res.render("recentPostsPage", {postss:recentPosts, citysel:req.session.user.local.city})
    //                               }    
    //                             });  
    // } else {
    //      Posts.aggregate([{ $match: { 'post.date': { $lte: new Date() } } } , { $sort : { 'post.date' : -1 } }, {$limit:5} ],
    //                             function(err, recentPosts) {
    //                               if(typeof recentPosts != 'undefined') {
    //                                   console.log("recentPosts " + recentPosts.length);
    //                                   res.render("recentPostsPage", {postss:recentPosts})
    //                               }    
    //                             });
    // }    
};

exports.searchallposts = function (req, res) {
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
                    res.render('browserequests', { user: req.session.user, allposts: posts, dropdowns: dropdowns });

        });

    } else {
        console.log("city array selected is " + cityarr);
        Posts.distinct('post',{ $and:[{'post.city':{$in : cityarr.split(",")}}, {'post.role':{$in : rolearr.split(",")}},
            {'post.lang':{$in : langarr.split(",")}}]}, function ( err, posts, count ){
         // Posts.distinct('post',{'post.city':{$in : cityarr.split(",")}}, function ( err, posts, count ){   
                    
                    console.log("posts are " + posts);
                    console.log("cityarr is " + err);
                    res.render('browserequests', { user: req.session.user, allposts: posts, cityarr:cityarr, rolearr:rolearr, langarr:langarr, dropdowns: dropdowns });

        }); 

    }
};

exports.viewallposts = function (req, res) {
	var then = new Date();
            then.setDate(then.getDate() - 7);

            console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            var posts; 
            Posts.aggregate([{ $match: { 'post.date': { $lte: new Date() } } }, { $sort : { 'post.date' : -1 } } ],
                                    function(err, postsinDB) {
                console.log("here");
                if(!err) {
                    posts = postsinDB;
                }
                console.log("posts length is " + posts.length);
                console.log("req.user " + req.user);
                
                            
                res.render('browserequests', { user: req.session.user, allposts: posts, dropdowns:dropdowns});

                
            });
};

exports.viewNotificationPosts = function (req, res) {
    // console.log("viewNotificationPostsSSSSSSSSSSSSSSSS");
    // var foundUser = req.session.user;
    // var selectedCity = new Array();
    // var notificationClickDate = new Date(foundUser.local.notificationClickDate);
    // console.log("found user notificationClickDate: "+notificationClickDate);
    // var postsForArtist = {};
    // if(typeof foundUser.local.city != 'undefined' && foundUser.local.city != "") {
    //     if(foundUser.local.city == "Bengaluru" || foundUser.local.city == "Bangalore") {
    //         selectedCity.push("Bangalore", "Bengaluru");
    //     } else if(foundUser.local.city == "Calcutta" || foundUser.local.city == "Kolkata") {
    //         selectedCity.push("Calcutta", "Kolkata");
    //     } else if(foundUser.local.city == "Mumbai" || foundUser.local.city == "Bombay") {
    //         selectedCity.push("Mumbai", "Bombay");
    //     } else if (foundUser.local.city != "None") {
    //         selectedCity.push(foundUser.local.city);
    //     }
    // }

    // if(typeof selectedCity != undefined && selectedCity.length != 0) {
    //     console.log("req.session.user role: "+foundUser.local.role[0]);                                
    //                                     Posts.aggregate([{ $project: {'post.role': 1, 'post.city': 1, 'post.date': 1, 'post.postTitle': 1,'post.postDetail': 1,'post.userid': 1, 'post.user': 1, 'post.lang':1, commonToBoth:{ $setIntersection: [ "$post.role", "$foundUser.local.role" ]},_id: 1 } }, {$match: { $and: [ { 'post.city': { $in: selectedCity } }, 
    //                                         { 'post.date': { $lte: new Date() } } ] }},{ $sort : { 'post.date' : -1 } },{$limit:10}],
    //                                                             function(err, postsinDB) {
    //                                         if(!err) {
    //                                             postsForArtist = postsinDB;
    //                                         }
    //                                         res.render('browserequests', { user: req.session.user, allposts: postsForArtist, rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia", dropdowns:dropdowns});
    //                                     });
    // }

    var then = new Date();
    then.setDate(then.getDate() - 7);

    console.log("req.session " + req.sesson);
    console.log("req.session.user " + req.session.user);
    var allUsers;
    var posts; 
    Posts.aggregate([{ $match: { 'post.date': { $lte: new Date() } } }, { $sort : { 'post.date' : -1 } } ],
                            function(err, postsinDB) {
        console.log("here");
        if(!err) {
            posts = postsinDB;
        }
        console.log("posts length is " + posts.length);
        console.log("req.user " + req.user);
        
                    
        res.render('browserequests', { user: req.session.user, allposts: posts, rolearr:req.session.user.local.role,langarr:req.session.user.local.lang,
                cityarr:req.session.user.local.city, dropdowns:dropdowns});

        
    });
};

exports.postarequest = function (req, res) {
	var allUsers;
    console.log("req.title " + req.query.title);
    console.log("req.image " + req.query.postedImage);
    console.log("req.user " + req.user);
    res.render('postarequest', { user: req.session.user, users: allUsers, dropdowns:dropdowns, postTitle:req.query.title, postedImage: req.query.postedImage}); 
};

exports.editpost = function (req, res) {
	console.log("user idddddd " + req.body._id);
            console.log("post iddddddd " + req.body._postid);

            Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID POST TO EDIT: "+error);
                  // res.send({ error: error });
                  req.flash('info', "Error while trying to find the user's post");
                  res.redirect('/error');          
                } else {
                  console.log("found post " + db);
                  res.render('postarequest', { post: db, user:req.session.user,dropdowns:dropdowns });
                }  
            });
};

exports.viewpost = function (req, res) {
    if(typeof req.session == 'undefined' || typeof req.session.user == 'undefined') {
        console.log("req.query.postid " + req.query.postid)
        Posts.findOne({ '_id' : req.query.postid }, function(error, db) {
                if (error || !db) {
                    console.log("ERROR NOT A VALID POST. FROM LOGGED OUT USER");
                  req.flash('info', "Error in retrieving post, something is not correct. Please try again.");
                  res.redirect('/error');
                } else {
                  console.log("found post " + db);
                  res.render("viewapost", {post:db}); 
                }  
        });
     } else {
	        console.log("post id " + req.query.postid);
            Posts.findOne({ '_id' : req.query.postid }, function(error, db) {
                if (error || !db) {
                    console.log("ERROR NOT A VALID. FROM LOGGED IN USER");
                  req.flash('info', "Error in retrieving post, something is not correct. Please try again.");
                  res.redirect('/error');
                } else {
                  console.log("found post " + db);
                  if(typeof db.post.user == 'undefined' || db.post.user == null || db.post.user.length == 0) {
                      User.findOne({ 'facebook.id' : db.post.userid }, function(error, user) {
                        if(error || !db) {
                            console.log("Error in retrieving post, something is not correct. Please try again.");
                            // res.redirect("/searchposts");
                            req.flash('info', "Error in retrieving post, something is not correct. Please try again.");
                            res.redirect('/error');
                        } else {
                            if(user != null) {
                                res.render("viewapost", {post:db, user: user, sessionUser: req.session.user});   
                            } else {
                                                        // res.redirect("/searchposts");
                                req.flash('info', "Error in retrieving post, something is not correct. Please try again.");
                                res.redirect('/error');
                            }    
                        }
                      });    
                   } else {
                    console.log("found user details");
                    res.render("viewapost", {post:db, user: db.post.user[0], sessionUser: req.session.user}); 
                   }    
                  
                }  
            });
        }
};

exports.deletepost = function (req, res) {
	console.log("user id " + req.body._id);
    console.log("post id " + req.body._postid);
	Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  // res.send({ error: error });         
                  req.flash('info', "Error while trying to find the user's post in the database");
                  res.redirect('/error');
                } else {
                  console.log("found post " + db);
                  
                  db.remove(function (err, user) {
                           if (err) {
                                console.log("ERRRORRRR");
                                // res.json(err) ;
                                req.flash('info', "Error while trying to remove the user's post from the database");
                                res.redirect('/error');
                            } else {
                                res.redirect('/searchposts');
                            }
                       });
                  
                }  
            });
};

exports.postPhoto = function(req,res) {
    console.log("req.files " + JSON.stringify(req.files));
    console.log("image name is " + req.files.image.name);
    res.send({path: req.files.image.name});
}

exports.indicateMailToBeSent = function(req, res) {
  var name = req.body.first_name,
      fromEmail = req.body.fromEmail,
      emailText = req.body.postBody,
      subject = req.body.postTitle,
      toArtists = req.body.toArtists;
   var artistsArray = toArtists.split(",");
   var toArray = new Array();


   for(var index = 0; index < artistsArray.length; index++) {
    console.log("artistsEmail " + artistsArray[index]);
    toArray.push({"email":artistsArray[index]});    
   }

   mailOptions = {
                        "message": {
                                "from_email":fromEmail,
                                "from_name":req.body.first_name,
                                "to":toArray,
                                "subject": "MotleyMeow: someone requested you to send this mail: "+ subject,
                                "auto_html":true,
                                "text": emailText
                        }
                 }   
    m.messages.send(mailOptions, function(result) {
                console.log("Send mail result is " + JSON.stringify(result));
                res.send({completed: "OK"});
            }, function(err) {
                
                res.send({completed: "NOK"});
    });
};

exports.sendPostMailsToArtists = function (req, res){

  console.log(req.body);
  console.log("req.body.myPostPictures "  + req.body.myPostPictures);
  var name = req.body.first_name,
      fromEmail = req.body.fromEmail,
      emailText = req.body.postBody,
      subject = req.body.postTitle,
      toArtists = req.body.toArtists;
   var artistsArray = toArtists.split(",");
      var toArray = new Array();
      for(var index = 0; index < artistsArray.length; index++) {
            console.log("artistsEmail " + artistsArray[index]);
          toArray.push({"email":artistsArray[index]});    
      }
      var base64 = null;
      async.series( [ 
           function(callback) {
                if(typeof req.body.myPostPictures != "undefined" && req.body.myPostPictures != '') {
                    var attachedImage =  req.protocol + '://' + req.get('host') + "/uploads/"+ req.session.user.facebook.id + "/pictures/" + req.body.myPostPictures;
                    request.get(attachedImage, function (error, response, body) {
                        console.log("error " + error);
                        if (!error && response.statusCode == 200) {
                            base64 = new Buffer(body).toString('base64');
                            callback(null);
                        }
                    });
                 } else {
                    callback(null);
                 }       
            },        

            function(callback) {
                var mailOptions;
                if(base64 != null) {
                    mailOptions = {
                        "template_name": "ContactEmailArtists",
                        "template_content": [
                            {
                                "name": "header",
                                "content": emailText
                            }
                        ],
                        "message": {
                                "from_email":fromEmail,
                                "from_name":req.body.first_name,
                                "to":toArray,
                                "subject": "MotleyMeow:"+ subject,
                                "auto_html":true,
                                "text": emailText,
                                "attachments": [
                                  {type: "image/png", name: "postImage.png", content: base64}
                                ]
                        }
                    };
                 } else {
                    mailOptions = {
                        "template_name": "ContactEmailArtists",
                        "template_content": [
                            {
                                "name": "header",
                                "content": emailText
                            }
                        ],
                        "message": {
                                "from_email":fromEmail,
                                "from_name":req.body.first_name,
                                "to":toArray,
                                "subject": "MotleyMeow:"+ subject,
                                "auto_html":true,
                                "text": emailText
                        }
                    };
                 }   
                m.messages.sendTemplate(mailOptions, function(result) {
                            console.log("Send mail result is " + JSON.stringify(result));
                            callback(null);
                            
                        }, function(err) {
                            callback(err);
                            res.send({completed: "NOK"});
                });
            }
        ],
        function(err, results){
            if(err) {
                console.log("err is " + err);
                res.send({completed: "NOK"});
            } else {
                res.send({completed: "OK"});
            }
      });
};      

// exports.sendPostMailsToArtists = function (req, res){

//   console.log(req.body);
//   console.log("req.files.myPostPics "  + req.body.myPostPics);
//   var name = req.body.first_name,
//       fromEmail = req.body.fromEmail,
//       emailText = req.body.postBody,
//       subject = req.body.postTitle,
//       toArtists = req.body.toArtists;
//    var artistsArray = toArtists.split(",");
//       var toArray = new Array();
//       for(var index = 0; index < artistsArray.length; index++) {
//             console.log("artistsEmail " + artistsArray[index]);
//           toArray.push({"email":artistsArray[index]});    
//       }
//       var base64 = null;
//       async.series( [ 
//            function(callback) {
//                 if(typeof req.body.myPostPics != "undefined" && req.body.myPostPics.length == 1) {
//                     var attachedImage =  req.protocol + '://' + req.get('host') + "/uploads/"+ req.session.user.facebook.id + "/pictures/" + req.body.myPostPics[0];
//                     request.get(attachedImage, function (error, response, body) {
//                         console.log("error " + error);
//                         if (!error && response.statusCode == 200) {
//                             base64 = new Buffer(body).toString('base64');
//                             callback(null);
//                         }
//                     });
//                  } else {
//                     callback(null);
//                  }       
//             },        

//             function(callback) {
//                 var mailOptions;
//                 if(base64 != null) {
//                     mailOptions = {
//                         "template_name": "ContactEmailArtists",
//                         "template_content": [
//                             {
//                                 "name": "header",
//                                 "content": emailText
//                             }
//                         ],
//                         "message": {
//                                 "from_email":fromEmail,
//                                 "from_name":req.body.first_name,
//                                 "to":toArray,
//                                 "subject": "MotleyMeow:"+ subject,
//                                 "auto_html":true,
//                                 "text": emailText,
//                                 "attachments": [
//                                   {type: "image/png", name: "postImage.png", content: base64}
//                                 ]
//                         }
//                     };
//                  } else {
//                     mailOptions = {
//                         "template_name": "ContactEmailArtists",
//                         "template_content": [
//                             {
//                                 "name": "header",
//                                 "content": emailText
//                             }
//                         ],
//                         "message": {
//                                 "from_email":fromEmail,
//                                 "from_name":req.body.first_name,
//                                 "to":toArray,
//                                 "subject": "MotleyMeow:"+ subject,
//                                 "auto_html":true,
//                                 "text": emailText
//                         }
//                     };
//                  }   
//                 m.messages.sendTemplate(mailOptions, function(result) {
//                             console.log("Send mail result is " + JSON.stringify(result));
//                             callback(null);
                            
//                         }, function(err) {
//                             callback(err);
//                             res.send({completed: "NOK"});
//                 });
//             }
//         ],
//         function(err, results){
//             if(err) {
//                 console.log("err is " + err);
//                 res.send({completed: "NOK"});
//             } else {
//                 res.send({completed: "OK"});
//             }
//       });
      // request.get(attachedImage, function (error, response, body) {
      //   console.log("error " + error);
      //       if (!error && response.statusCode == 200) {
      //           base64 = new Buffer(body).toString('base64');
      //           var mailOptions = {
      //               "template_name": "ContactEmailArtists",
      //               "template_content": [
      //                   {
      //                       "name": "header",
      //                       "content": emailText
      //                   }
      //               ],
      //               "message": {
      //                       "from_email":fromEmail,
      //                       "from_name":req.body.first_name,
      //                       "to":toArray,
      //                       "subject": "MotleyMeow:"+ subject,
      //                       "auto_html":true,
      //                       "text": emailText,
      //                       "attachments": [
      //                         {type: "image/png", name: "abc.png", content: base64}
      //                       ]
      //                     }
      //           };

      //          m.messages.sendTemplate(mailOptions, function(result) {
      //                       console.log("Send mail result is " + JSON.stringify(result));
      //                       res.send({completed: "OK"});
      //                   }, function(err) {
      //                       console.log("Send mail err is " + JSON.stringify(err));
      //                       res.send({completed: "NOK"});
      //         });   
      //       }
      //  });
      //var base64 = new Buffer(attachedImage).toString('base64');
      
      
      // transport.sendMail({
      //   //host: "smtp.mandrillapp.com",
      //   to:             toArtists,
      //   subject:        "MotleyMeow: "+ name + " wants to contact you!",
      //   from:           email,
      //   text:           emailText
      // }, 

      // function(err, info) {
      //   if (err) {
      //     console.log(err);
      //     res.send({completed:"NOK"});
      //   } else {
      //     console.log("Mail sent!" + JSON.stringify(info));
      //     res.send({completed:"OK"});
      //   }
      // });
  //var obj = {name:name, email:email, emailText:emailText, bccEmails};

  /*mailer.send(
  { host:           "smtp.mandrillapp.com"
  , port:           587
  , to:             "motleymeow@gmail.com"
  , bcc:            bccEmails
  , from:           email
  , subject:        "MotleyMeow: "+ name + " wants to contact you!"
  , body:           emailText
  , authentication: "login"
  , username:       mailerUsername
  , password:       mailerPassword
  }, function(err, result){
    if(err){
      console.log(err);
      res.send({completed:"NOK"});
    }
    else {
      console.log("Mail sent!" + result);
      res.send({completed:"OK"});
    }
  }
  );*/

  //res.send();
  


//};