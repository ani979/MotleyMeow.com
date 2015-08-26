var User = require('../models/user.js');
var FB            = require('fb');
var Events = require('../models/event.js');
var dropdowns = require('../views/js/theatreContrib.js');
var Posts = require('../models/posts.js');
var app = require('../app.js');

exports.startAdministration = function (req, res) {
	console.log("coming here in startAdministration");
    res.render('maintenanceInProgress', { user: req.session.user});
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
