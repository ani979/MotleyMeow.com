// app/models/user.js
// load the things we need
var mongoose = require('mongoose');


// define the schema for our user model
var eventSchema = mongoose.Schema({

    event             :{
        userid          : String,
        eventId         : String,
        eventcover         : String,
        city:String,
        date:Date,
        eventCategory:String,
        title:String,
        link: String,
        user : [{}],
        endDate     : Date,
        imagePath   : String
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


// create the model for users and expose it to our app
module.exports = mongoose.model('Event', eventSchema);
// // create the model for users and expose it to our app
// module.exports = mongoose.model('Post', postSchema);
	