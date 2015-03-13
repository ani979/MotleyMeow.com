// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var deletedUserSchema = mongoose.Schema({

    local            : {
        reason      : String,
        email		: String
    },
    facebook         : {
        id           : String
    }

});



// create the model for users and expose it to our app
module.exports = mongoose.model('DeletedUser', deletedUserSchema);
// // create the model for users and expose it to our app
// module.exports = mongoose.model('Post', postSchema);
	