var forum = require('../models/forum.js');
var forumSubs = require('../models/forumSubscribers');
var mongoose      = require('mongoose');
var app = require('../app.js');
var async        = require('async')
var User = require('../models/user.js');
var nodemailer = require('nodemailer');
var mandrill = require('mandrill-api/mandrill');
var m = new mandrill.Mandrill('_r3bNHCw5JzpjPLfVRu24g');
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
					recentlyCommentedthreads = threads;
					callback(null, "DONE1")
					
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
	newThread.thread.subscribedEmailids = new Array();
	newThread.thread.subscribedEmailids.push(req.session.user.facebook.email)

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
                console.log(thread.thread.subscribedEmailids.toString());
                var subscribedCategoryEmailIds = new Array();
                var allEmailIds; 
                forumSubs.findOne({ 'subscribers.category' : req.body.category }, function(error, db) {
		      		if (error) {
			          console.log('info', "Error while retrieiving subscriber list")
				    } else {
				    	
				      	if(typeof db != 'undefined' && db != null && db.subscribers.emailids.length !=0) {
				      		console.log(" DB.subscribers " + db.subscribers.emailids.length)
				      	  	subscribedCategoryEmailIds = db.subscribers.emailids;     
						}
						console.log(" subscribedCategoryEmailIds for this category " + req.body.category + " " + subscribedCategoryEmailIds)
						var toArray = new Array();
						toArray.push({"email":req.session.user.facebook.email});
						for(var index = 0; index < subscribedCategoryEmailIds.length; index++) {
							if(db.subscribers.emailids[index] != req.session.user.facebook.email) {
								toArray.push({"email":db.subscribers.emailids[index]});
							}
							
						}
		                console.log(" to Array " + JSON.stringify(toArray))
		                var mailOptions = {
				        "message": {
				                    "from_email":"noreply@motleymeow.com",
				                    "from_name":"Motley Meow",
				                    "to":toArray,
				                    "subject": 'A new forum post',
				                    "auto_html":true,
				                    "html": 'Hello,\n\n' +
				                            "A new thread " + "<b>" + thread.thread.topic + "</b>" + " is posted under the category" + 
				                            " '<b>" +  req.body.category + "</b>' at " + 'http://' + req.headers.host + '/viewThread?id=' + thread._id + 
				                            ". If you have posted this thread, you will get responses to your thread in email" + '<br/>' + " With Kind Regards," + '<br/>' + "MotleyMeow team"
				                }
				      	};

		                

					   m.messages.send(mailOptions, function(result) {
				            console.log("Send mail result is " + JSON.stringify(result));
				            res.send({completed: "OK"});
				        }, function(err) {
				            console.log("Send mail err is " + JSON.stringify(err));
				            res.send({completed: "NOK"});
				        });
				  	}
				});  	  

            }
    });


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
                                }
                                var toArray = new Array();
                                if(typeof post.thread.subscribedEmailids != 'undefined' && post.thread.subscribedEmailids != null) {
									for(var index = 0; index < post.thread.subscribedEmailids.length; index++) {
											toArray.push({"email":post.thread.subscribedEmailids[index]});
									}
								}	

			                	//send out email to the thread subscribers
			                	console.log("toArray is " + JSON.stringify(toArray))
				                var mailOptions = {
							        "message": {
						                    "from_email":"noreply@motleymeow.com",
						                    "from_name":"Motley Meow",
						                    "to":toArray,
						                    "subject": 'Your forum post' + " '"  + post.thread.topic + "'",
						                    "html": 'Hello,<br/>' +
						                            "Someone commented on your thread " + "'<b>"+ post.thread.topic + "'</b>. Have a look at it here " + 'http://' + req.headers.host + '/viewThread?id=' + post._id + '<br/>' 
						                            + " With Kind Regards," + '<br/>' + "MotleyMeow team"
						                }
						      	};

				                

							    m.messages.send(mailOptions, function(result) {
						            console.log("Send mail result is " + JSON.stringify(result));
						            res.send({completed: "OK"});
						        }, function(err) {
						            console.log("Send mail err is " + JSON.stringify(err));
						            res.send({completed: "NOK"});
						        });	
                    });
		}
	});
};

//helper functions

function convertCategoryToName(category){

	var categoryName="";
	switch(category){
		case "space":
			categoryName = "SPACES";
			break;
		case "props":
			categoryName = "PROPS";
			break;
		case "general":
			categoryName = "GENERAL";
			break;
		case "events":
			categoryName = "EVENTS";
			break;
		case "knowledge":
			categoryName = "KNOWLEDGE SHARING";
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


exports.subscribemeForThread = function(req, res) {
	console.log("Going to subscribe " );
	 		
	forum.findOne({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while retrieiving forum thread")
          res.send({completed: "NOK"});
      } else {
      	  if(typeof db.thread.subscribedEmailids != "undefined" && db.thread.subscribedEmailids != null &&
      	  	db.thread.subscribedEmailids.length > 0) {
      	  	db.thread.subscribedEmailids.push(req.session.user.facebook.email);
      	  } else {
      	  	db.thread.subscribedEmailids = new Array();
			db.thread.subscribedEmailids.push(req.session.user.facebook.email);
      	  }
      	  db.save(function(err, save) {
				if(err) {
					console.log('info', "Error while saving new subscriber to a thread whose id is" + req.body.threadid)
					res.send({completed: "NOK"});
				} else {
					res.send({completed: "OK"});
				}
		  });
       }
    });   
}

exports.unsubscribemeForThread = function(req, res) {
	console.log("Going to unsubscribe " );
	 		
	forum.findOne({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while retrieiving forum thread")
          res.send({completed: "NOK"});
      } else {
      	  if(typeof db.thread.subscribedEmailids == "undefined" || db.thread.subscribedEmailids == null ||
      	  	db.thread.subscribedEmailids.length == 0) {
      	  	console.log('info', "Error while retrieiving forum thread")
          	res.send({completed: "NOK"});
      	  } else {
      	  	for(var index = 0; index < db.thread.subscribedEmailids.length; index++) {
	      	  	var result = db.thread.subscribedEmailids[index];
            	if(result == req.session.user.facebook.email) {
			      	console.log("FOUND " + result)
			          db.thread.subscribedEmailids.splice(index, 1);
			          break;
			     }  
			}       

	        db.save(function(err, save) {
					if(err) {
						console.log('info', "Error while saving new subscriber list")
						res.send({completed: "NOK"});
					} else {
						console.log(req.session.user.facebook.email + " is unsubscribed to " + req.body.threadid);
						res.send({completed: "OK"});
					}

		    });
		  }  
      }
    });   
}