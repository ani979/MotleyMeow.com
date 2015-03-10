var User = require('../models/user.js');

exports.artist = function (req, res) {
	 var allUsers;
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
                   res.render('profileEdit', {user: req.session.user, infomessage: "Your update is successful"});
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

exports.getEmails = function (req, res) {
    var allUsers;

    console.log("coming here cities " + req.body.cities);
     console.log("coming here lang " + req.body.roles);
      console.log("coming here roles " + req.body.lang);
    var selectedCity = req.body.cities.split(",");
    var selectedRoles = req.body.roles.split(",");
    var selectedLang = req.body.lang.split(",");

    User.distinct("facebook.email", { $and: [ {"local.city": { $in: selectedCity } }, 
                                              {"local.role": { $in: selectedRoles } },
                                              {"local.lang": { $in: selectedLang } },
                                              {"local.emailDisplay": { $in: ["true", null] } } ] } ,
                            function(err, emails) {
        //console.log("all users " + users);
        
                
        res.send({selectedEmails: emails});

    });
   


};

exports.getRecentArtists = function (req, res) {
    console.log("here in recent artists");
    User.aggregate([{ $match: { 'local.joiningDate': { $lte: new Date() } } } , {$limit:5}, { $sort : { 'local.joiningDate' : -1 } } ],
                            function(err, recentUsers) {
                              console.log("users " + recentUsers.length);
                              res.render("recentArtistsPage", {users:recentUsers})
                            });  
};

exports.contactArtists = function (req, res) {
    res.render('emailArtists', { user: req.session.user});
};

exports.updateCityAndRoles = function (req, res) {
            console.log("req.user " + req.user);
            var email = req.user.facebook.email;
            console.log("emaillllllll: "+email);
            User.findOne({ 'facebook.email' : email }, function(error, db) {
        console.log("coming 1");
        if (error || !db) {
            console.log("ERRPRRR");
          req.flash('info', "Error while finding facebook email in the database")
          res.redirect('/error');          
        } else {
            console.log("city is going to be updated");
               console.log("city selected " + req.body.city);
               console.log("role selected " + req.body.role);
               db.local.city = req.body.city;
               db.local.role = req.body.role;

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
                   // res.render('profileEdit', {user: req.session.user, infomessage: "Your update is successful"});
                   res.send();
               });
        }
    });
};