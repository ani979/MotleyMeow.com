var User = require('../models/user.js');
var Post = require('../models/posts.js');
var dropdowns = require('../views/js/theatreContrib.js');
var deletedArtists = require('../models/deletedArtists.js');
var mandrill = require('mandrill-api/mandrill');
var m = new mandrill.Mandrill('_r3bNHCw5JzpjPLfVRu24g');
var app = require('../app.js');
var fsEtxra = require('fs-extra')

//var mailer   = require("mailer")            //required for setting mail server
  //, mailerUsername = "motleymeow@gmail.com"
  //, mailerPassword = "_r3bNHCw5JzpjPLfVRu24g";

'use strict';
var nodemailer = require('nodemailer');
var mandrillTransport = require('nodemailer-mandrill-transport');
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
  var pfolioFlickrPics;
  var pfolioSocialPres;
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
    if (app.fsExtra.existsSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/')) {
    // Do something
      console.log("The directory does exist");
      console.log("removing all profile pictures")
      app.fsExtra.readdirSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/').forEach(function(fileName) {
          console.log("Removing file " + fileName);
          app.fsExtra.unlinkSync('./views/portfolio/' + req.session.user.facebook.id + '/pictures/' + fileName);
      });
    }  else {
      console.log("The directory for " +  req.session.user.facebook.id + " does not exist");
    }
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

  if(typeof req.body.mypfolioFlickrPics != 'undefined' && req.body.mypfolioFlickrPics.length > 0) {
    console.log(" req.body.mypfolioFlickrPics.length " + req.body.mypfolioFlickrPics.length);
    pfolioFlickrPics = JSON.parse(req.body.mypfolioFlickrPics);
    console.log("pfolioFlickrPics[0] " + pfolioFlickrPics[0].flickrURL)
  }

  if(typeof req.body.mypfolioSocialPres != 'undefined' && req.body.mypfolioSocialPres.length > 0) {
    console.log(" req.body.mypfolioSocialPres.length " + req.body.mypfolioSocialPres.length);
    pfolioSocialPres = JSON.parse(req.body.mypfolioSocialPres);
    console.log("pfolioSocialPres[0] " + pfolioSocialPres[0].url)
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
               db.portfolio.myFlickrPics = pfolioFlickrPics;
               db.portfolio.mySocialPresence = pfolioSocialPres;
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
  } else {
    var selectedLang = req.body.lang.split(",");
  }  

  User.distinct("facebook.email", { $and: [ {"local.city": { $in: selectedCity } }, 
                                            {"local.role": { $in: selectedRoles } },
                                            { $or: [ {"local.lang": { $in: selectedLang } }, {"local.lang": null}, {"local.lang": {$size: 0} } ] },
                                            {"local.emailDisplay": { $in: [Boolean(true), null] } } ] } ,
                          function(err, emails) {
      //console.log(emails);        
      res.send({selectedEmails: emails});
      
  //console.log(emails);
  //return emails;
  });

  //   User.distinct("facebook.email", { $and: [ {"local.city": { $in: selectedCity } }, 
  //                                           {"local.role": { $in: selectedRoles } },
  //                                           {"local.lang": { $in: selectedLang } },
  //                                           {"local.emailDisplay": { $in: [Boolean(true), null] } } ] } ,
  //                         function(err, emails) {
              
  //     res.send({selectedEmails: emails});

  // });
   
};


exports.getEmailsForPost = function (req, res) {
  var allUsers;

 if(req.body.cities == "" || req.body.roles == "" || req.body.lang == "") {
    console.log("Not all good")
     res.send({error: "City, roles and Language fields must be selected"});
     return;
  } 
  console.log("Its all good")
  var selectedCity = req.body.cities.split(",");
  var selectedRoles = req.body.roles.split(",");
  var selectedLang = req.body.lang.split(",");

 

  User.distinct("facebook.email", { $and: [ {"local.city": { $in: selectedCity } }, 
                                            {"local.role": { $in: selectedRoles } },
                                            { $or: [ {"local.lang": { $in: selectedLang } }, {"local.lang": null}, {"local.lang": {$size: 0} } ] },
                                            {"local.emailDisplay": { $in: [Boolean(true), null] } } ] } ,
                          function(err, emails) {
                            if(err) {
                              res.send({error: err});
                              return
                            }
                            console.log("emails = " + emails);
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

exports.unsubscribeme = function (req, res) {
    res.render('unsubscribeme', { user: req.session.user});
};

exports.unsubscribeFromMailing = function (req, res) {
  console.log("req.body.artistEmail " + req.body.artistEmail);
    User.findOne({ 'facebook.email' : req.body.artistEmail }, function(error, db) {
      if(error) {
        res.end();
      }
      if(!db.local.receiveNotif) {
        res.send({"alreadyUnsubscribedBefore":true});
        res.end();
        return;
      }
      db.local.receiveNotif = false;
      db.save(function (err, user) {
                   if (err) {
                        res.end();
                    }
                   res.send({"receiveNotification":db.local.receiveNotif});
      });
      
    });  
};


exports.sendMailsToArtists = function (req, res){

  console.log(req.body);
  //res.send();
  
  //console.log(req.body.bcc_Emails);
  //console.log(typeof bccEmails);
  //console.log("hello");
  var name = req.body.first_name,
      fromEmail = req.body.email,
      emailText = req.body.comments,
      bccEmails = req.body.bcc_Emails,
      toArtists = req.body.toArtists + ",motleymeow@gmail.com";
      var artistsArray = toArtists.split(",");
      var toArray = new Array();
      for(var index = 0; index < artistsArray.length; index++) {
          toArray.push({"email":artistsArray[index]});    
      }

      var mailOptions = {
                "message": {
                            "from_email":fromEmail,
                            "from_name":req.body.first_name,
                            "to":toArray,
                            "subject": "MotleyMeow: "+ name + " wants to contact you!",
                            "auto_html":true,
                            "text": emailText
                          }
                };

       m.messages.send(mailOptions, function(result) {
                    console.log("Send mail result is " + JSON.stringify(result));
                    res.send({completed: "OK"});
                }, function(err) {
                    console.log("Send mail err is " + JSON.stringify(err));
                    res.send({completed: "NOK"});
      });
      // transport.sendMail({
      //   //host: "smtp.mandrillapp.com",
      //   to:             toArtists,
      //   subject:        "MotleyMeow: "+ name + " wants to contact you!",
      //   from:           email,
      //   text:           emailText
      // }, 

      // function(err, info) {
      //   if (err) {
      //     console.log(err);
      //     res.send({completed:"NOK"});
      //   } else {
      //     console.log("Mail sent!" + JSON.stringify(info));
      //     res.send({completed:"OK"});
      //   }
      // });
  //var obj = {name:name, email:email, emailText:emailText, bccEmails};

  /*mailer.send(
  { host:           "smtp.mandrillapp.com"
  , port:           587
  , to:             "motleymeow@gmail.com"
  , bcc:            bccEmails
  , from:           email
  , subject:        "MotleyMeow: "+ name + " wants to contact you!"
  , body:           emailText
  , authentication: "login"
  , username:       mailerUsername
  , password:       mailerPassword
  }, function(err, result){
    if(err){
      console.log(err);
      res.send({completed:"NOK"});
    }
    else {
      console.log("Mail sent!" + result);
      res.send({completed:"OK"});
    }
  }
  );*/

  //res.send();
  


};

exports.updateCityAndRoles = function (req, res) {
            console.log("req.user " + req.user);
            var email = req.user.facebook.email;
            console.log("emaillllllll: "+email);
            var roles = new Array();
            console.log("req.body.role " + req.body.role)
            if(typeof req.body.role != 'undefined' && req.body.role != "") {
              roles = req.body.role.split(",");
            }
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

               db.local.role = roles;

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
              "repectedDate" : new Date()
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

exports.saveProfilePic = function(req,res) {
    console.log("req.body.imageName " + req.body.imageName);
    var dir = "./views/portfolio/" + req.session.user.facebook.id + "/profilePicture";
    
    fsEtxra.ensureDir(dir, function (err) {
      if(err)
      console.log(err) // => null 
      console.log("Directory created");
      app.fsExtra.readdirSync(dir).forEach(function(fileName) {
          console.log("Removing profile file " + fileName);
          app.fsExtra.unlinkSync('./views/portfolio/' + req.session.user.facebook.id + '/profilePicture/' + fileName);
      });
      fsEtxra.move('./views/tempUploads/' + req.body.imageName, './views/portfolio/'+req.session.user.facebook.id+"/profilePicture/" + req.body.imageName, function (err) {

      if (err) return console.error(err)
        console.log("success!")
        app.fsExtra.readdirSync('./views/tempUploads/').forEach(function(fileName) {
          console.log("Removing old profile file " + fileName);
          app.fsExtra.unlinkSync('./views/tempUploads/' + fileName);
        });
        User.findOne({ 'facebook.id' : req.session.user.facebook.id }, function(error, db) {
            db.local.picture = '/portfolio/'+req.session.user.facebook.id+"/profilePicture/" + req.body.imageName;
            db.save(function (err, user) {
               if (err) {
                    console.log("ERRRORRRR");
                    res.send({completed:"NOK", image: ""})
                }
                req.session.user = user;
               res.send({completed:"OK", image: db.local.picture})
           });
        });  
      });
      // dir has now been created, including the directory it is to be placed in 
  });

    
}