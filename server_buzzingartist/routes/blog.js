var BlogPost = require('../models/blogPost'); //load up blogPost model
var User = require('../models/user.js');	//load up user model
var app = require('../app.js');

exports.newBlogPost = function(req, res){
	res.render('newBlogPost.ejs');
	console.log("User is " + req.session.user.facebook.email);
}

exports.saveNewBlogPostData = function(req, res){
	console.log(req.body);
	var newblogpost = new BlogPost();

	newblogpost.blogPost.postTitle = req.body.postTitle;
	newblogpost.blogPost.postBody = req.body.postBody;
	newblogpost.blogPost.categories = req.body.categories;
	newblogpost.blogPost.author = req.session.user.facebook.id 
	//newblogpost.blogPost.date = new Date();
	//console.log(newblogpost.blogPost.date); 

	newblogpost.save(function(err, post) {
                       if (err) {
                            console.log("Error in saving" + err);
                            res.send({completed: "NOK"});  
                        } else {
                            console.log("Saved");
                            res.send({completed: "OK"});
                        }
                    });

};