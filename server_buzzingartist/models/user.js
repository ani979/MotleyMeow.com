// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        picture      : String,
        city         : {type: String,default:'None'},
        role         :[{}],
        lang         :[{}],
        emailDisplay : {type:Boolean, default:true},
        privelege    : {type:String, default:"somebody"},
        joiningDate  :Date,
        receiveNotif : {type:Boolean, default:true},
        notificationClickDate : Date,
        lastProfileUpdateDate : Date
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
        myResume     : String
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

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
// // create the model for users and expose it to our app
// module.exports = mongoose.model('Post', postSchema);
	