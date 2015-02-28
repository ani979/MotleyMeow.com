var User = require('../models/user.js');

exports.artist = function (req, res) {
	 var allUsers;
            console.log("req.user " + req.user);
            User.find( function ( err, users, count ){
                //console.log("all users " + users);
                allUsers = users
                        
                res.render('search_artists', { user: req.session.user, users: allUsers,rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia" });

            });
};

exports.update = function (req, res) {
	var email = req.body.email;
    
    User.findOne({ 'facebook.email' : email }, function(error, db) {
        console.log("coming 1");
        if (error || !db) {
            console.log("ERRPRRR");
          req.flash('info', "Error while finding facebook email in the database")
          res.redirect('/error');          
        } else {
            if(req.body.btnvalue == "submit") {
            console.log("i am submit");
               // update the user object found using findOne
               db.facebook.name=req.body.fullname;
               db.local.city = req.body.city;
               console.log("roles selected " + req.body.role);
               console.log("city selected " + req.body.city);
               // now update it in MongoDB
               db.local.role = req.body.role;
               db.local.lang = req.body.lang;
               console.log("req.body.emailDisplay " + req.body.emailDisplay)
               if(req.body.emailDisplay) {
                    if (req.body.emailDisplay == "ok") db.local.emailDisplay = true;
                     else db.local.emailDisplay = false;
               }      
               db.save(function (err, user) {
                   if (err) {
                        console.log("ERRRORRRR");
                        // res.json(err) ;
                        req.flash('info', "Error while saving the new email in the database")
                        res.redirect('/error');
                        return done(err);
                    }

                   req.session.user = user;
                   req.session.loggedIn = true;
                   res.redirect('/profile');
               });
            } else if(req.body.btnvalue == "delete") {
                console.log(" I am in delete");
                User.remove({ 'facebook.email' : email }, function(error, db) {
                    if (error) {
                        req.flash('info', "Error while removing the facebook email")
                        res.redirect('/error');
                        return done(error);
                    }
                    req.session = null;
                    res.redirect('/');
                });         
            }   
        }
    });
};