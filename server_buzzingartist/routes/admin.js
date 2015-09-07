var User = require('../models/user.js');
var FB            = require('fb');
var Events = require('../models/event.js');
var dropdowns = require('../views/js/theatreContrib.js');
var Posts = require('../models/posts.js');
var app = require('../app.js');
var request = require('request');
var fsExtra = require('fs');
var async        = require('async')

exports.startAdministration = function (req, res) {
	var uCnt = 0,eCnt=0,pCnt=0;
	console.log("coming here in startAdministration");
	User.count(function(err, uCount) {
                    if(!err) {
                        uCnt = uCount;
                    }
                    Posts.count(function(err, pCount) {
                        if(!err) {
                            pCnt = pCount;   
                        }
                        Events.count(function(err, eCount) {
                            if(!err) {
                                eCnt = eCount;   

                            } 
                            res.render('maintenanceInProgress', { user: req.session.user, aCount:uCnt, pCount:pCnt, eCount:eCnt});
                        });    
                    }); 
                });
    
};


exports.retrieveOldPosts = function (req, res) {
	console.log("coming here to retrieve old posts");
	var then = new Date();
    then.setDate(then.getDate() - 30);

	Posts.distinct('post', {'post.date': { $lte: then} }, function(error, db) {
		if(error) {
			res.send({"posts":null});
		}
		else {
			res.send({"posts":db});
		}
	});	
    
};

exports.deleteOldPosts = function (req, res) {
	console.log("coming here to delete old posts");
	var then = new Date();
    then.setDate(then.getDate() - 30);

	Posts.find({'post.date': { $lte: then} }, function(error, db) {
		if(error) {
			res.send({"completed":"NOK"});
			res.end();
		}
		else {
			console.log(" db.length " + db.length)
			for(var i = 0; i < db.length;i++) {
				console.log(" db[i].post.imagePath " + db[i].post.imagePath);
				if(typeof db[i].post.imagePath != "undefined" && db[i].post.imagePath != "") {
				   	var imagePath = db[i].post.imagePath;
		            app.fsExtra.unlink('./views/uploads/'+ imagePath, function (err) {
		                if (err) { console.log("cannto delete as file not present " + err); } else {
		                    console.log('successfully deleted');
		                }    
		            });

		             app.fsExtra.unlink('./views/uploads/'+ req.session.user.facebook.id + "/pictures/" + imagePath, function (err) {
		                if (err) { console.log("cannto delete as file not present err " + err); } else {
		                	console.log('successfully deleted');
		                }	
		            });
		        }    
		        Posts.remove({'post.date': { $lte: then} }, function(error, db) {
		            	if(error) {
							res.send({"completed":"NOK"});
							res.end();
							return;
						} 
		         });
			}
			res.send({"completed":"OK"});
			
		}
	});	
    
};


exports.retrieveOldEvents = function (req, res) {
	console.log("coming here to retrieve old events");
	var then = new Date();
    then.setDate(then.getDate() - 7);

	Events.distinct('event', {'event.endDate': { $lte: then} }, function(error, db) {
		if(error) {
			res.send({"events":null});
		}
		else {
			console.log("db found " + JSON.stringify(db));
			res.send({"events":db});
		}
	});	
    
};

exports.deleteOldEvents = function (req, res) {
	console.log("coming here to delete old events");
	var then = new Date();
    then.setDate(then.getDate() - 7);

	Events.find({'event.endDate': { $lte: then} }, function(error, db) {
		if(error) {
			res.send({"completed":"NOK"});
			res.end();
		}
		else {
			console.log(" db.length " + db.length)
			for(var i = 0; i < db.length;i++) {
				console.log(" db[i].event.imagePath " + db[i].event.imagePath);
				if(typeof db[i].event.imagePath != "undefined" && db[i].event.imagePath != "") {
				   	var imagePath = db[i].event.imagePath;
		            app.fsExtra.unlink('./views/uploads/'+ imagePath, function (err) {
		                if (err) { console.log("cannto delete as file not present " + err); } else {
		                    console.log('successfully deleted');
		                }    
		            });
		            app.fsExtra.unlink('./views/uploads/'+ req.session.user.facebook.id + "/pictures/" + imagePath, function (err) {
		                if (err) { console.log("cannto delete as file not present err " + err); } else {
		                	console.log('successfully deleted');
		                }	
		            });
		        }    
		        Events.remove({'event.endDate': { $lte: then} }, function(error, db) {
		            	if(error) {
							res.send({"completed":"NOK"});
							res.end();
							return;
						} 
		         });
			}
			res.send({"completed":"OK"});
		}
	});	
    
};


exports.addProfilePicsLocally = function(req,res) {
  var count = 0;
  console.log("here in add ProfilePicsLocally");
  User.find( function ( err, users ){
     //console.log("all users " + users);
     console.log("users is " + users.length);
  	 async.eachSeries(users, function(user, callback) {
  		console.log("user is " + user.facebook.name + " facebook id " + user.facebook.id);
        if(typeof user.local.picture  != 'undefined' && user.local.picture != null && user.local.picture.substring(0, 4) =='http') {
          console.log("Found user with picture from facebook " + user.facebook.name);
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
		  request(user.local.picture, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			  	console.log("NO ERROR")
			  	request(user.local.picture).pipe(fsExtra.createWriteStream('./views/portfolio/'+user.facebook.id + "/profilePicture/myProfilePic.jpg"));
			  	user.local.picture = "/portfolio/"+user.facebook.id + "/profilePicture/myProfilePic.jpg";
			  	count++;
			  	user.save(function (err, user) {
                   if (!err) {
                        console.log("User saved!!");
                        callback();
                    }
               });
			  } else {
			  	user.local.picture = "http://localhost:3000" + "/images/mask.png";
			  	count++;
			  	user.save(function (err, user) {
                   if (!err) {
                        console.log("User saved!!");
                        callback();
                    }
                });
			  }
		   })
		 } else {
		 	callback();
		 }
		}, function(err){
		    if( err ) {
		      console.log('A user failed to process');
		    } else {
		      console.log('All users have been processed successfully');
		      res.send({completed:"NOK", total: count});
		    }
	});
   //    for(var i =0; i < users.length; i++) {
   //      console.log("user is " + users[i].facebook.name + " facebook id " + users[i].facebook.id);
   //      if(typeof users[i].local.picture  != 'undefined' && users[i].local.picture != null && users[i].local.picture.substring(0, 4) =='http') {
   //        console.log("Found user with picture from facebook " + users[i].facebook.name);
   //        if (!fsExtra.existsSync('./views/portfolio/' + users[i].facebook.id)) {
		 //    // Do something
		 //      console.log("The directory does not exist");
		 //      console.log("creating Directory")
		 //      fsExtra.mkdirSync('./views/portfolio/' + users[i].facebook.id);
		 //      fsExtra.mkdirSync('./views/portfolio/' + users[i].facebook.id + '/profilePicture');

		 //  } else if(!fsExtra.existsSync('./views/portfolio/' + users[i].facebook.id + '/profilePicture')) {
		 //  		console.log("The directory profilePicture does not exist");
		 //      console.log("creating Directory")
		 //      fsExtra.mkdirSync('./views/portfolio/' + users[i].facebook.id + '/profilePicture');
		 //  }

		 //  // assuming openFiles is an array of file names

			
		 //  request(users[i].local.picture, function (error, response, body) {
			//   if (!error && response.statusCode == 200) {
			//   	console.log("NO ERROR")
			//    //  request
			//   	// .get(users[i].local.picture)
			//   	// .on('response', function(response) {
			// 	  //   if(response.statusCode != 200) {
			// 	  //   	console.log(" response.statusCode " + response.statusCode + " return")
			// 	  //   } else {
			// 	  //   	console.log(" response.statusCode " + response.statusCode + " Dont return")
			// 	  //   }
			// 	  // })
			//   	// .pipe(fsExtra.createWriteStream('./views/portfolio/'+users[i].facebook.id + "/profilePicture/myProfilePic.jpg"))
			//   	request(users[i].local.picture).pipe(fsExtra.createWriteStream('./views/portfolio/'+users[i].facebook.id + "/profilePicture/myProfilePic.jpg"));
			//   } else {
			//   	console.log("ERROR");
			//   	return;
			//   }
			// })
		  
   //        //request(users[i].local.picture).pipe(fsExtra.createWriteStream('./views/portfolio/'+users[i].facebook.id + "/profilePicture/myProfilePic.jpg"));
   //        //users[i].local.picture = "/portfolio/"+users[i].facebook.id + "/profilePicture/myProfilePic.jpg";
   //        count ++;
   //      } 
   //    }
      
  });
}