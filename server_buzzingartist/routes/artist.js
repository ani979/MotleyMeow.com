var User = require('../models/user.js');
var Post = require('../models/posts.js');
var dropdowns = require('../views/js/theatreContrib.js');
var deletedArtists = require('../models/deletedArtists.js');
var app = require('../app.js');


exports.artist = function (req, res) {
	 var allUsers;
            User.find( function ( err, users, count ){
                //console.log("all users " + users);
                allUsers = users
                        
                res.render('search_artists', { user: req.session.user, users: allUsers,rolearr:"AllArtists",langarr:"AllLanguage",cityarr:"AllIndia",
                dropdowns:dropdowns });

            });
};

exports.update = function (req, res) {
  var pfolioPictures;
  var pfolioPicturesToBeRemoved;
  var pfolioVideos;
  var pfolioPlays;
	var id = req.body.userId;  
  console.log("Id is " + id);
  if(typeof req.body.mypfolioPics != 'undefined') {
    pfolioPictures = req.body.mypfolioPics.split(",");
    console.log("req.body.mypfolioPics " + pfolioPictures.length);
     app.fsExtra.readdirSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/').forEach(function(fileName) {
      var found = false;
      for(var i = 0; i < pfolioPictures.length; i++) {
        if(pfolioPictures[i] == fileName) {
          found = true;
        }  
      }
      if(found == false) {
        console.log("Removing file " + fileName);
        app.fsExtra.unlinkSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/' + fileName);
      }  
    });
  } else {
    console.log("removing all profile pictures")
    app.fsExtra.readdirSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/').forEach(function(fileName) {
        console.log("Removing file " + fileName);
        app.fsExtra.unlinkSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/' + fileName);
    });
  }

  if(typeof req.body.mypfolioVids != 'undefined' && req.body.mypfolioVids.length > 0) {
    console.log(" req.body.mypfolioVids.length " + req.body.mypfolioVids.length);
    pfolioVideos = JSON.parse(req.body.mypfolioVids);
    console.log("pfolioVideos[0] " + pfolioVideos[0].videoURL)
  }

  if(typeof req.body.mypfolioPlays != 'undefined' && req.body.mypfolioPlays.length > 0) {
    console.log(" req.body.mypfolioPlays.length " + req.body.mypfolioPlays.length);
    pfolioPlays = JSON.parse(req.body.mypfolioPlays);
    console.log("pfolioVideos[0] " + pfolioPlays[0].playName)
  }  

  // if(typeof req.body.mypfolioRemPics != 'undefined') {
  //   pfolioPicturesToBeRemoved = req.body.mypfolioRemPics.split(",");
  //   console.log("req.body.mypfolioPics to be removed " + pfolioPicturesToBeRemoved.length);
  //   for(var i = 0; i < pfolioPicturesToBeRemoved.length; i++) {
  //       console.log(" Going to remove " + pfolioPicturesToBeRemoved[i]);
  //       app.fsExtra.unlinkSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/' + pfolioPicturesToBeRemoved[i]);
  //   }
  // } 

    User.findOne({ 'facebook.id' : id }, function(error, db) {
        console.log("coming 1");
        if (error || !db) {
            console.log("ERRPRRR");
          req.flash('info', "Error while finding facebook id in the database")
          res.redirect('/error');          
        } else {
            if(req.body.btnvalue == "submit") {
            console.log("i am submit");
               // update the user object found using findOne
               db.facebook.name=req.body.fullname;
               db.facebook.email = req.body.email;
               db.local.city = req.body.city;
               console.log("roles selected " + req.body.role);
               console.log("city selected " + req.body.city);
               // now update it in MongoDB
               db.local.role = req.body.role;
               db.local.lang = req.body.lang;
               db.portfolio.myself = req.body.myself;
               db.portfolio.myPhotos = pfolioPictures;
               // if(typeof pfolioVideos != 'undefined' && pfolioVideos.length > 0) {
               //  for(var i = 0; i < pfolioVideos.length; i++) {
               //    db.portfolio.myVideos.push({
               //          "videoURL": pfolioVideos[i].videoURL,
               //          "videoText": pfolioVideos[i].videoText
               //    })
               //  }
               // }
               // if(typeof pfolioPlays != 'undefined' && pfolioPlays.length > 0) {
               //  for(var i = 0; i < pfolioPlays.length; i++) {
               //    db.portfolio.myPlays.push({
               //          "playName": pfolioPlays[i].playName,
               //          "playURL": pfolioPlays[i].playURL,
               //          "playContrib" : pfolioPlays[i].playContrib
               //    })
               //  }
               // }
               console.log("req.body.resume = " + req.body.myResume);
               db.portfolio.myPlays = pfolioPlays
               db.portfolio.myResume = req.body.myResume;
               db.portfolio.myVideos = pfolioVideos;
               console.log("req.body.emailDisplay " + req.body.emailDisplay)
               if(req.body.emailDisplay) {
                    if (req.body.emailDisplay == "ok") db.local.emailDisplay = true;
                     else db.local.emailDisplay = false;
               }   
               if(req.body.receiveNotif) {
                    if (req.body.receiveNotif == "ok") db.local.receiveNotif = true;
                     else db.local.receiveNotif = false;
               }
               db.local.lastProfileUpdateDate = new Date();
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
                   //res.render('profileEdit', {user: req.session.user, infomessage: "Your update is successful", dropdowns:dropdowns});
               });
            } 
        }
    });
};

exports.deleteArtist = function (req, res) {
  var id = req.body.facebookID;  
  var deletedArtist  = new deletedArtists();
  deletedArtist.facebook.id = id;
  deletedArtist.local.reason = req.body.deletedFeedback;
  deletedArtist.local.email = req.body.email;
  // save our user to the database
  deletedArtist.save(function(err) {
    if (err) {
        console.log('info', "Error while saving the deletedArtist in the database")
    }
    console.log("A artist deleted");
  });
  Post.remove({ 'post.userid' : id }, function(error, db) {
          if (error) {
              console.log('info', "Error while removing the posts")
              req.session = null;
              res.redirect('/');
              return done(error);
          }
          User.remove({ 'facebook.id' : id }, function(error, db) {
            if (error) {
              req.flash('info', "Error while removing the facebook user")
              res.redirect('/error');
              return done(error);
            }
            console.log("User removed");
            req.session = null;
            res.redirect('/');
          });  
  });  
}  


exports.getEmails = function (req, res) {
  var allUsers;

 if(req.body.cities == "") {
    console.log("All cities selected")
    var cityarr = dropdowns.alldropdowns.citiesForPost;
    var selectedCity = new Array();
    for(var i =0; i < cityarr.length; i++) {
      selectedCity.push(cityarr[i].city)
    }
    selectedCity.push(null);  

  } else {
    var selectedCity = req.body.cities.split(",");
  }

  if(req.body.roles == "") {
    console.log("All roles selected")
    var rolearr = dropdowns.alldropdowns.rolesForSearch;
    var selectedRoles = new Array();
    for(var i =0; i < rolearr.length; i++) {
      selectedRoles.push(rolearr[i].role)
    }
    selectedRoles.push(null);  

  } else {
    var selectedRoles = req.body.roles.split(",");
  }

  if(req.body.lang == "") {
    console.log("All lang selected")
    var langarr = dropdowns.alldropdowns.languages;
    var selectedLang = new Array();
    for(var i =0; i < langarr.length; i++) {
      selectedLang.push(langarr[i])
    }
    selectedLang.push(null);  

  } else {
    var selectedLang = req.body.lang.split(",");
  }  

  User.distinct("facebook.email", { $and: [ {"local.city": { $in: selectedCity } }, 
                                            {"local.role": { $in: selectedRoles } },
                                            {"local.lang": { $in: selectedLang } },
                                            {"local.emailDisplay": { $in: [Boolean(true), null] } } ] } ,
                          function(err, emails) {
              
      res.send({selectedEmails: emails});

  });
   


};

exports.getRecentArtists = function (req, res) {
   User.aggregate([{ $match: { 'local.joiningDate': { $lte: new Date() } } } , { $sort : { 'local.joiningDate' : -1 } }, {$limit:5} ],
                            function(err, recentUsers) {
                              res.render("recentArtistsPage", {users:recentUsers})
                            });  
};

exports.contactArtists = function (req, res) {
    res.render('emailArtists', { user: req.session.user, dropdowns:dropdowns});
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

exports.postProfilePhoto = function(req,res) {
    console.log(JSON.stringify(req.files));
    //res.send({path: req.files.image});
}

exports.postProfileResume = function(req,res) {
    console.log(JSON.stringify(req.files));
    console.log("req.files.resume.name " + req.files.resume.name);
    res.send({resumeName: req.files.resume});
}

exports.showRespect = function(req,res) {
    console.log("User is " + req.body.curUserId);
    var found = false;
    if(typeof req.body.curUserId == 'undefined') {
      res.send("ERROR");
    }
    User.findOne({ 'facebook.id' : req.body.curUserId }, function(error, db) {
        
        if (error || !db) {
            console.log("ERRPRRR in SHOWRESPECT");
            res.send("ERROR");        
        } else {
          for(var i = 0; i < db.respect.userId.length; i++) {
               if(db.respect.userId[i].fromUserId == req.session.user.facebook.id) {
                 console.log("FOUNDD")
                 found = true;
                 db.respect.userId.splice(i, 1);
                 break;
               }
          }
            
                  
          if( found) {
              db.save(function (err, user) {
               if (err) {
                    console.log("ERRRORRRR");
                    res.send("ERROR");
                }
               res.send({respectCount:user.respect.userId.length, isRemoved:true});
           });
         } else {
           db.respect.userId.push({
              "fromUserId": req.session.user.facebook.id,
              "fromUserName" : req.session.user.facebook.name,
            });

            db.save(function (err, user) {
               if (err) {
                    console.log("ERRRORRRR");
                    res.send("ERROR");
                }

               res.send({respectCount:user.respect.userId.length, isRemoved:false});
           });
         }   
        }
    });
}