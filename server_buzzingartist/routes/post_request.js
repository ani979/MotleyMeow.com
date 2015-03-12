var Posts = require('../models/posts.js');
var User = require('../models/user.js');
var app = require('../app.js');
var dropdowns = require('../views/js/theatreContrib.js');

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

    app.fsExtra.readdirSync('./views/tempUploads').forEach(function(fileName) {
        console.log("Removing file " + fileName);
        app.fsExtra.unlinkSync('./views/tempUploads/'+fileName);
    });
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

                    console.log("found post " + db);
                    console.log("message db.post.postTitle: "+db.post.postTitle);
                    console.log("req.body.postTitle:::::::::: "+req.body.postTitle);  
                    console.log("req.files " + JSON.stringify(req.files));
                    db.post.postTitle = req.body.postTitle;
                    db.post.postDetail = req.body.post;
                    // managing images. If image pat in DB is not defined
                    console.log("req.body.postedImage value = " + req.body.postedImage);
                    // if(req.body.postedImage == "true") {
                    //     db.post.imagePath = req.files.imagePost.name;
                    // } else {

                    // }
                    if(typeof db.post.imagePath != 'undefined' || db.post.imagePath != "") {
                        // Check if request has some files. If it has check if both the files are same, if yes dont do anthing else delete file from tmp folder
                        // if both the files are same, dont do anything. Set db image to imagePath
                        // if req.files is undefined, dont do anything it means user has not selectedt any new image and has just posted as it is. 
                        if(typeof req.files != 'undefined' && typeof req.files.imagePost != 'undefined') {
                            if(db.post.imagePath != req.files.imagePost.name) {
                                console.log("found an image " + db.post.imagePath);
                                app.fsExtra.unlink('./views/uploads/'+db.post.imagePath, function (err) {
                                    if (err) { console.log("cannto delete as file not present"); return; }
                                        console.log('successfully deleted');
                                });
                            } else {
                                console.log("No change in image " + db.post.imagePath);
                            }
                            db.post.imagePath = req.files.imagePost.name;
                        }  else {
                            // We are here when db has an image but req doesnt have. Then dont do anything
                            // Dont do anything db.post.imagePath = "";
                            if(req.body.postedImage == "removed") {
                                db.post.imagePath = "";
                                app.fsExtra.unlink('./views/uploads/'+db.post.imagePath, function (err) {
                                    if (err) { console.log("cannto delete as file not present"); return; }
                                        console.log('successfully deleted');
                                });
 
                            }
                        }
                       
                    } else {
                        // We come here when image is not in DB. If req.files is undefined, the n set image path to empty else set it to whatever req.files has.
                        if(typeof req.files == 'undefined' || typeof req.files.imagePost == 'undefined') {
                            db.post.imagePath = "";
                        } else {
                            db.post.imagePath = req.files.imagePost.name;
                        }   
                    }
                    db.post.date = new Date();
                    db.post.city = cityarr;
                    db.post.role = rolearr;
                    db.post.lang = langarr;

                   // update the user object found using findOne
                   console.log("req.body.title" + req.body.postTitle);
                    db.save(function (err, user) {
                                if (err) {
                                // res.json(err) ;
                                    req.flash('info', "Error while saving the modifications done in the existing post")
                                    res.redirect('/error');
                                } else {
                                    res.redirect('/searchPosts');
                                }
                            });
                }  
            });
    } else {
        console.log("New post");
            var newPost = new Posts();

            // set all of the facebook information in our user model
            newPost.post.userid    = req.session.user.facebook.id; 
            newPost.post.postTitle = req.body.postTitle;
            newPost.post.postDetail = req.body.post;
            newPost.post.date = new Date();
            newPost.post.city = cityarr;
            newPost.post.role = rolearr;
            newPost.post.lang = langarr;
            if(typeof req.files == 'undefined' || typeof req.files.imagePost == 'undefined') {
                newPost.post.imagePath = "";    
            } else {
                newPost.post.imagePath = req.files.imagePost.name;
            }
            newPost.save(function(err) {
                       if (err) {
                            req.flash('info', "Error while saving the new Post in the database")
                            res.redirect('/error');  
                        } else {
                            res.redirect('/searchPosts');
                        }
                    });
    }

};


exports.searchPosts = function (req, res) {
	 //console.log("req.session " + req.sesson);
    //console.log("req.session.user " + req.session.user);
    var allUsers;
    //console.log("req.user.email " + req.session.user.facebook.email);

    Posts.find({ 'post.userid' : req.session.user.facebook.id }, function(error, db) {
        //     console.log("coming 1");
        if (error || !req.user) {
            console.log("ERROR NOT A VALID");
          // res.send({ error: error });          
          req.flash('info', "Error while trying to find the user's post")
          res.redirect('/error'); 
        } else {
          // console.log("found user " + db.facebook.email);
          console.log("found user: " + db);
          // console.log("found user's post: " + db.post);
          console.log("found user's post length: " + db.length);
          res.render('post_search', { postdb: db,  user:req.session.user});
        }    
     });   
};

exports.getRecentPosts = function (req, res) {
    //console.log(" here in recent posts");
     var selectedCity = new Array();
     //console.log(" req.session.user " + req.session.user)
    if(typeof req.session.user.local.city != 'undefined' && req.session.user.local.city != "") {
        if(req.session.user.local.city == "Bengaluru" || req.session.user.local.city == "Bangalore") {
            selectedCity.push("Bangalore", "Bengaluru");
        } else if(req.session.user.local.city == "Calcutta" || req.session.user.local.city == "Kolkata") {
            selectedCity.push("Calcutta", "Kolkata");
        } else if(req.session.user.local.city == "Mumbai" || req.session.user.local.city == "Bombay") {
            selectedCity.push("Mumbai", "Bombay");
        } else if (req.session.user.local.city != "None") {
            selectedCity.push(req.session.user.local.city);
        } 
    
    
    
        // console.log("selected city " + selectedCity[0])
        // console.log("selected City length " + selectedCity.length)
         //console.log("new Date() " + new Date())
        Posts.aggregate([{ $match: { $and: [ { 'post.city': { $in: selectedCity } }, 
                                { 'post.date': { $lte: new Date() } } ] } } , { $sort : { 'post.date' : -1 } }, {$limit:5} ],
                                function(err, recentPosts) {
                                  if(typeof recentPosts != 'undefined') {
                                    // for(var i = 0; i < recentPosts.length; i++) {
                                    //     console.log("recentPosts in city " + recentPosts[i].post.postTitle);
                                    // }
                                      
                                      res.render("recentPostsPage", {postss:recentPosts, citysel:req.session.user.local.city})
                                  }    
                                });  
    } else {
         Posts.aggregate([{ $match: { 'post.date': { $lte: new Date() } } } , { $sort : { 'post.date' : -1 } }, {$limit:5} ],
                                function(err, recentPosts) {
                                  if(typeof recentPosts != 'undefined') {
                                      console.log("recentPosts " + recentPosts.length);
                                      res.render("recentPostsPage", {postss:recentPosts})
                                  }    
                                });
    }    
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
            Posts.aggregate([{ $match: { 'post.date': { $gte: new Date(then.toISOString()) } } }],
                                    function(err, postsinDB) {
                console.log("here");
                if(!err) {
                    posts = postsinDB;
                }
                console.log("posts is " + posts);
                console.log("posts length is " + posts.length);
                console.log("req.user " + req.user);
                
                            
                res.render('browserequests', { user: req.session.user, allposts: posts, rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia", dropdowns:dropdowns});

                
            });
};

exports.postarequest = function (req, res) {
	var allUsers;
    console.log("req.user " + req.user);
    res.render('postarequest', { user: req.session.user, users: allUsers }); 
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
                  res.render('postarequest', { post: db, user:req.session.user });
                }  
            });
};

exports.viewpost = function (req, res) {
	console.log("user id " + req.body._id);
            console.log("post id " + req.body._postid);
            Posts.findOne({ '_id' : req.body._postid }, function(error, db) {
                if (error || !req.user) {
                    console.log("ERROR NOT A VALID");
                  req.flash('info', "Error in retrieving post, something is not correct. Please try again or contact us if it happens repeatedly");
                  res.redirect('/error');
                } else {
                  console.log("found post " + db);
                  User.findOne({ 'facebook.id' : req.body._id }, function(error, user) {
                    if(error) {
                        console.log("Error in retrieving post, something is not correct. Please try again or contact us if it happens repeatedly");
                        // res.redirect("/searchposts");
                        req.flash('info', "Error in retrieving post, something is not correct. Please try again or contact us if it happens repeatedly");
                        res.redirect('/error');
                    } else {
                        console.log("user " + user);
                        if(user != null) {
                            res.render("viewapost", {post:db, user: user, sessionUser: req.session.user});   
                        } else {
                                                    // res.redirect("/searchposts");
                            req.flash('info', "Error in retrieving post, something is not correct. Please try again or contact us if it happens repeatedly");
                            res.redirect('/error');
                        }    
                    }
                  });     
                  
                }  
            });
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
    console.log(JSON.stringify(req.files));
    console.log("image name is " + req.files.image.name);
    res.send({path: req.files.image.name});
}