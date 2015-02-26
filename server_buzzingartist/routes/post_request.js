var Posts = require('../models/posts.js');
var User = require('../models/user.js');


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

                    db.post.postTitle = req.body.postTitle;
                    db.post.postDetail = req.body.post;
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
            newPost.post.userid    = req.session.user._id; 
            newPost.post.postTitle = req.body.postTitle;
            newPost.post.postDetail = req.body.post;
            newPost.post.date = new Date();
            newPost.post.city = cityarr;
            newPost.post.role = rolearr;
            newPost.post.lang = langarr;
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
	 console.log("req.session " + req.sesson);
            console.log("req.session.user " + req.session.user);
            var allUsers;
            console.log("req.user.email " + req.session.user.facebook.email);

            Posts.find({ 'post.userid' : req.session.user._id }, function(error, db) {
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
                    res.render('browserequests', { user: req.session.user, allposts: posts });

        });

    } else {
        console.log("city array selected is " + cityarr);
        Posts.distinct('post',{ $and:[{'post.city':{$in : cityarr.split(",")}}, {'post.role':{$in : rolearr.split(",")}},
            {'post.lang':{$in : langarr.split(",")}}]}, function ( err, posts, count ){
         // Posts.distinct('post',{'post.city':{$in : cityarr.split(",")}}, function ( err, posts, count ){   
                    
                    console.log("posts are " + posts);
                    console.log("cityarr is " + err);
                    res.render('browserequests', { user: req.session.user, allposts: posts, cityarr:cityarr, rolearr:rolearr, langarr:langarr });

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
                
                            
                res.render('browserequests', { user: req.session.user, allposts: posts, rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia"});

                
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
                  req.flash('info', "Error while trying to find the user's post");
                  res.redirect('/error');
                } else {
                  console.log("found post " + db);
                  User.findOne({ '_id' : req.body._id }, function(error, user) {
                    if(error) {
                        console.log("Error in retrieving user, something is not correct, check in DB");
                        // res.redirect("/searchposts");
                        req.flash('info', "Error in retrieving user, something is not correct, check in DB");
                        res.redirect('/error');
                    } else {
                        console.log("user " + user);
                        res.render("viewapost", {post:db, user: user, sessionUser: req.session.user});    
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