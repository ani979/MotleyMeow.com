var forum = require('../models/forum.js');
var forumSubs = require('../models/forumSubscribers');
var mongoose      = require('mongoose');
var app = require('../app.js');
var async        = require('async')
var User = require('../models/user.js');

exports.viewForum = function(req, res){
	
	
	var recentlyCommentedthreads = new Array();
	var allThreads = new Array();
	async.parallel([
		function(callback){
			console.log("i am here in FORUM 111")
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
			    callback(err, "DONE1")
			  })
			  .on('end', function(){
			    console.log("done");

			  });
			forum.find().sort({'thread.recentCommentDate': -1 }).limit(5).exec(function(err, threads){
				if(err)
				{
					console.log("Error in retrieving recently commented threads");
					callback(err, "DONE1")
				}
				else
				{
					//console.log(threads);
					callback(null, "DONE1")
					recentlyCommentedthreads = threads;
				}
			});
		},

		function(callback){
			console.log("i am here in FORUM 222");
			forum.find().sort({'thread.date': -1 }).limit(5).exec(function(err, threads){
				if(err)
				{
					console.log("Error in retrieving all threads");
					callback(err, "DONE2")
				}
				else
				{
					//console.log(threads);
					allThreads = threads;
					callback(null, "DONE2")
				}
			});
		}
	],
		// optional callback
	    function(err, results){
	    	res.render("forum", {user: req.session.user, recentCommentThreads:recentlyCommentedthreads, allThreads:allThreads});
    	}
    )	

}

exports.viewCategory = function(req, res){
	console.log(req.query.category);
	//res.render("Hello World")

	//mongoose.connection.db.createCollection('forums', function(err, collection){});

	var category = req.query.category;
	var categoryName = "";
	categoryName = convertCategoryToName(category);

	forum.find({'thread.category' : category}).sort({'thread.date': -1 }).exec(function(err, threads){

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
		else if(doc != null)

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

exports.displayForumReplies = function(req, res){
    console.log(req.query.forumid);

    forum.distinct("thread.replies", {'_id' : req.query.forumid}, function(err, comments)
    {
        if(err)
            {
                console.log("Error in fetching post comments");
            }
        else
            {

                    comments = comments.sort(function(a, b){
                    var keyA = new Date(a.date),
                    keyB = new Date(b.date);
                    // Compare the 2 dates
                    if(keyA < keyB) return 1;
                    if(keyA > keyB) return -1;
                    return 0;
                    });

                res.render('commentsOnForum.ejs', {replies: comments, user:req.session.user});
            }
    });
};

exports.editOldThread = function(req, res) {
	console.log("Going to edit a thread req.body " + req.body);
	forum.findOne({'_id' : req.body.threadid}, function(err, thread){
		thread.thread.topic = req.body.title;
		thread.thread.tbody = req.body.body;
		thread.save(function(err, thread) {
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
	});	
}

exports.deleteForumThread = function(req, res) {
	console.log("Going to delete a thread req.body " + req.body);
	forum.remove({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while removing the forum post")
          res.send({completed: "NOK"});
      } else {
            console.log("Forum post delete");
            res.send({completed: "OK", redirect: "/forum"});
       }
  });  
}

exports.subscribeme = function(req, res) {
	console.log("Going to subscribe " );
	async.parallel([
	 	function(callback) {	
	 		console.log("Subscribe 1111");
			forumSubs.findOne({ 'subscribers.category' : req.body.category }, function(error, db) {
		      if (error) {
		          console.log('info', "Error while retrieiving subscriber list")
		          callback(error, "DONE1")
		      } else {
		      	  if(db) {
		      	  	db.subscribers.emailids.push(req.session.user.facebook.email);
		      	  	db.save(function(err, save) {
						if(err) {
							console.log('info', "Error while saving new subscriber to an already maintained list")
		          			callback(err, "DONE1")
						} else {
							callback(null, "DONE1")
						}
					});
		      	  } else {
		      	  	var newSubs = new forumSubs();
		      	  	console.log(" Here req.body.category " + req.body.category)
					newSubs.subscribers.category = req.body.category;
					newSubs.subscribers.emailids = new Array();
					newSubs.subscribers.emailids.push(req.session.user.facebook.email);
					newSubs.save(function(err, save) {
						if(err) {
							console.log('info', "Error while saving new subscriber list")
		          			callback(err, "DONE1")
						} else {
							console.log(req.session.user.facebook.email + " is subscribed to " + req.body.category);
		          			callback(null, "DONE1")
						}
					});
		      	  }
		      	  
		       }

		  });  
		},
		function(callback) {	
			User.findOne({ 'facebook.id' : req.session.user.facebook.id }, function(error, db) {
		      if (error) {
		          console.log('info', "Error while retrieiving subscriber list")
		          callback(error, "DONE2")
		      } else {
		      	  if(db.local.subscribedCategories) {
		      	  	db.local.subscribedCategories.push(req.body.category);
		      	  } else {
		      	  	db.local.subscribedCategories = new Array();
		      	  	db.local.subscribedCategories.push(req.body.category);
		      	  }	
		      	  db.save(function(err, save) {
						if(err) {
							console.log('info', "Error while saving new subscriber list")
		          			callback(err, "DONE2")
						} else {
							console.log(req.session.user.facebook.email + " is subscribed to " + req.body.category);
							req.session.user = save;
		          			callback(null, "DONE2")
						}
						
				  });
		       }
		  	});  
		}
	],
		// optional callback
	    function(err, results){
	    	if(err) {
	    		res.send({completed: "NOK"});
	    	} else {
	    		console.log("Sending completed OK")
	    		res.send({completed: "OK"});
	    	}
		}
    )	
}

exports.unsubscribeme = function(req, res) {
	console.log("Going to unsubscribe " );
	async.parallel([
	 	function(callback) {	
	 		console.log("UnSubscribe 1111");
			forumSubs.findOne({ 'subscribers.category' : req.body.category }, function(error, db) {
		      if (error) {
		          console.log('info', "Error while retrieiving subscriber list")
		          callback(error, "DONE1")
		      } else {
		      	if(typeof db != 'undefined' && db.length !=0) {
		      	  	for(var index = 0; index < db.subscribers.emailids.length ; index++) {
		            	var result = db.subscribers.emailids[index];
		            	if(result == req.session.user.facebook.email) {
					      	console.log("FOUND " + result)
					          //Remove from array
					          db.subscribers.emailids.splice(index, 1);
					          break;
					     }    
					}
					db.save(function(err, eupdate){
						if(err) {
							console.log(req.session.user.facebook.email + " error getting unsubscribed to " + req.body.category);
	          				callback(err, "DONE1")
						} else {
							console.log(req.session.user.facebook.email + " is unsubscribed to " + req.body.category);
	          				callback(null, "DONE1")
						}
					});
				}	
		      } 
	      	  
		    });  
		},
		function(callback) {	
			User.findOne({ 'facebook.id' : req.session.user.facebook.id }, function(error, db) {
		      if (error) {
		          console.log('info', "Error while retrieiving subscriber list")
		          callback(error, "DONE2")
		      } else {
		      	if(typeof db.local.subscribedCategories != "undefined" && db.local.subscribedCategories.length != 0) {
		      	  for(var index = 0; index < db.local.subscribedCategories.length ; index++) {
		            	var result = db.local.subscribedCategories[index];
		            	if(result == req.body.category) {
					      	console.log("FOUND " + result)
					          db.local.subscribedCategories.splice(index, 1);
					     }    
					}

		      	  db.save(function(err, save) {
						if(err) {
							console.log('info', "Error while saving new subscriber list")
		          			callback(err, "DONE2")
						} else {
							console.log(req.session.user.facebook.email + " is unsubscribed to " + req.body.category);
							req.session.user = save;
	          				callback(null, "DONE2")
						}

				  });
				}  
		      }
		  	});  
		}
	],
		// optional callback
	    function(err, results){
	    	if(err) {
	    		res.send({completed: "NOK"});
	    	} else {
	    		console.log("Sending completed OK")
	    		res.send({completed: "OK"});
	    	}
		}
    )	
}


exports.deleteForumThreadComment = function(req, res) {
	console.log("Going to delete a comment of thread " + req.body.commentDate);

	forum.findOne({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while fetching the forum thread")
          res.send({completed: "NOK"});
      } else {
            
            for(index = 0; index < db.thread.replies.length ; index++) {
            	var result = db.thread.replies[index];
            	console.log("NOT FOUND " + result.commentorid)
		      if(result.commentorid == req.body.commentorid && result.date.getTime() == new Date(req.body.commentDate).getTime()) {
		      	console.log("FOUND " + result.commentorid)
		          //Remove from array
		          db.thread.replies.splice(index, 1);
		          db.save(function(err, eupdate){
						if(eupdate)
						{
							console.log("Saved");
						}
					});
		          break;
		      }    
		   }
            res.send({completed: "OK"});
       }
  }); 
}	

  exports.editForumThreadComment = function(req, res) {
	console.log("Going to edit a comment of thread " + req.body.commentDate);

	forum.findOne({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while fetching the forum thread")
          res.send({completed: "NOK"});
      } else {
            console.log("Forum post delete " + JSON.stringify(db.thread.replies) + "lenght is " + db.thread.replies.length);
            //findAndRemove(db.replies, 'commentorid', req.body.commentorid, 'date', req.body.date);
            for(index = 0; index < db.thread.replies.length ; index++) {
            	var result = db.thread.replies[index];
            	console.log("NOT FOUND " + result.commentorid)
		      if(result.commentorid == req.body.commentorid && result.date.getTime() == new Date(req.body.commentDate).getTime()) {
		      	console.log("FOUND " + result.commentorid)
		          //Remove from array
		          db.thread.replies[index].comment = req.body.comment;
		          db.save(function(err, eupdate){
						if(eupdate)
						{
							console.log("Saved");
						}
					});
		          break;
		      }    
		   }
            res.send({completed: "OK"});
       }
  });
}    
exports.openOrCloseForumThread = function(req, res) {
	console.log("Going to open or close forum req.body " + req.body.state + " thread id " + req.body.threadid);
	forum.findOne({'_id' : req.body.threadid}, function(err, thread){
		if(req.body.state == "open") {
			thread.thread.closed = false;
			thread.save(function(err, thread) {
	           if (err) {
	                console.log("Error in saving for closed" + err);
	                res.send({completed: "NOK"});  
	            } else {
	                console.log("Saved");
	                res.send({completed: "OK"});
	            }
	        });    
	    } else {
	    	thread.thread.closed = true;
			thread.save(function(err, thread) {
	           if (err) {
	                console.log("Error in saving for closed" + err);
	                res.send({completed: "NOK"});  
	            } else {
	                console.log("Saved");
	                res.send({completed: "OK"});
	            }
	        });
	    }    
	});	
}