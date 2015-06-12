var forum = require('../models/forum.js');
var mongoose      = require('mongoose');
var app = require('../app.js');

exports.viewForum = function(req, res){
	
	console.log("User is " + req.session.user.facebook.email);

	mongoose.connection.db.createCollection('forums', function(err, collection){});

	forum.find({}).stream() //updating field recentCommentDate for all documents //check if this executes before next part
	  .on('data', function(e){
	    		var l = e.thread.replies.length;
	    		if(l>0)
				{
					e.thread.recentCommentDate = e.thread.replies[l-1].date;
					e.save(function(err, eupdate){
						if(eupdate)
						{
							console.log("Saved");
						}
					});
				}
	  })
	  .on('error', function(err){
	    console.log("error");
	  })
	  .on('end', function(){
	    console.log("done");
	  });


	forum.find().sort({'thread.recentCommentDate': -1 }).limit(5).exec(function(err, threads){
		if(err)
		{
			console.log("Error in retrieving threads");
		}
		else
		{
			//console.log(threads);

			res.render("forum", {user: req.session.user, threads:threads});
		}
	});

}

exports.viewCategory = function(req, res){
	console.log(req.query.category);
	//res.render("Hello World")

	//mongoose.connection.db.createCollection('forums', function(err, collection){});

	var category = req.query.category;
	var categoryName = "";
	categoryName = convertCategoryToName(category);

	forum.find({'thread.category' : category}, function(err, threads){

		if(err)
		{
			console.log("Error in retrieving threads");
		}
		else
		{
			//console.log()
			res.render("viewCategory", {user: req.session.user, threads: threads, categoryName:categoryName, category:category})
		}
	});
}

exports.createNewThread = function(req, res){
	console.log(req.body);
	//var c = mongoose.connection.db.collection('forum');
	var newThread = new forum();

	newThread.thread.authorid = req.session.user.facebook.id;
	newThread.thread.authorName = req.session.user.facebook.name;
	newThread.thread.authorPic = req.session.user.local.picture;
	newThread.thread.topic = req.body.title;
	newThread.thread.tbody = req.body.body;
	newThread.thread.category = req.body.category;

	/*var doc = {

		 authorid : req.session.user.facebook.id,
		 authorName : req.session.user.facebook.name,
		 authorPic : req.session.user.local.picture,
		 topic : req.body.title,
		 tbody : req.body.body,
		 category : req.body.category
	};*/

	newThread.save(function(err, thread) {
                       if (err) {
                            console.log("Error in saving" + err);
                            res.send({completed: "NOK"});  
                        } else {
                            console.log("Saved");
                            console.log(thread);
                            //req.session.blogId = newblogpost._id;
//                            res.send({completed: "OK", redirect: "/myBlogPosts"});
                            res.send({completed: "OK"});
                        }
    });

/*	c.insert(doc, {w:1}, function(err, result) {
		if (err) {
                            console.log("Error in saving" + err);
                            res.send({completed: "NOK"});  
                        } else {
                            console.log("Saved");
                            console.log(result);
                            //req.session.blogId = newblogpost._id;
//                            res.send({completed: "OK", redirect: "/myBlogPosts"});
                            res.send({completed: "OK"});
                        }
	});*/
};

exports.viewThread = function(req, res){
	console.log(req.query.id);
	var id = req.query.id;

	forum.findOne({'_id' : id}, function(err, doc){

		if(err)
		{
			console.log("Error in retrieving thread");
		}
		else

		{
			console.log(doc);
			var category = doc.thread.category;
			var categoryName = "";

			categoryName = convertCategoryToName(category);

			res.render("viewThread", {user: req.session.user, thread: doc, categoryName:categoryName, category:category})
		}
	});
}

exports.createReply = function(req, res){
	console.log(req.body);
	var id = req.body.threadid;
	var rbody = req.body.rbody;

	forum.findOne({'_id' : id}, function(err, doc){

		if(err)
		{
			console.log("Error in retrieving thread");
		}
		else

		{
			var arr = doc.thread.replies;
            var d = new Date();
            //console.log(d);
            arr.push({commentorid:req.session.user.facebook.id, commentorName:req.session.user.facebook.name, 
            	commentorPic:req.session.user.local.picture, comment:rbody, date:d});
            doc.thread.replies = arr;
            //newblogpost.blogPost.date = new Date();
            //console.log(newblogpost.blogPost.date); 

            doc.save(function(err, post) {
                               if (err) {
                                    console.log("Error in saving" + err);
                                    res.send({completed: "NOK"});  
                                } else {
                                    console.log("Saved");
                                    res.send({completed: "OK"});
                                }
                    });
		}
	});
};

//helper functions

function convertCategoryToName(category){

	var categoryName="";
	switch(category){
		case "rehearsal-space":
			categoryName = "REHEARSAL SPACE";
			break;
		case "props":
			categoryName = "PROPS";
			break;
		case "announcements":
			categoryName = "ANNOUNCEMENTS";
			break;
		case "events":
			categoryName = "EVENTS";
			break;
		case "posts":
			categoryName = "POSTS";
			break;
	}

	return categoryName;
}