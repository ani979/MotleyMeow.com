// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : { 

        
        password     : String,
        picture      : String,
        city         : {type: String,default:'None'},
        role         :[{}],
        lang         :[{}],
        emailDisplay : {type:Boolean, default:true},
        privelege    : {type:String, default:"somebody"},
        joiningDate  : Date,
        receiveNotif : {type:Boolean, default:true},
        notificationClickDate : Date,
        lastProfileUpdateDate : Date,
        notificationCount : String,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        socialuser : Boolean
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        link         : String
    },
    portfolio        : {
        myself      : String,
        myPhotos     : [{}],
        myVideos     : [{}],
        myPlays     :  [{}],
        myFlickrPics     :  [{}],
        myResume     : String,
        mySocialPresence : [{}]
    },
    respect         : {
        userId      : [{}]
    }

});

// var postSchema = mongoose.Schema({

//     local            : {
//         post      : String,
//         postCity         :[{}],
//         postRole         :[{}],
//         postLang         :[{}]
//     },
//     facebook         : {
//         id           : String,
//         token        : String,
//         email        : String,
//         name         : String
//     }   

// });

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.updateUser = function(request, response){

    this.user.name = request.body.name;
    this.user.address = request.body.address;
     this.user.save();
    response.redirect('/user');
};

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
// // create the model for users and expose it to our app
// module.exports = mongoose.model('Post', postSchema);
    