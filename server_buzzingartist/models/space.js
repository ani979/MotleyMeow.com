// app/models/user.js
// load the things we need
var mongoose = require('mongoose');


// define the schema for our user model
var spaceSchema = mongoose.Schema({

    space             :{
        type : String, 
        name : String,
        city : String,
        capacity : Number
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
module.exports = mongoose.model('Space', spaceSchema);
// // create the model for users and expose it to our app
// module.exports = mongoose.model('Post', postSchema);
	