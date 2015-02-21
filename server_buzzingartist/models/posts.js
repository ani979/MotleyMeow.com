var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({

    post             :{
        userid          : String,
        postTitle         : String,
        postDetail         : String,
        date         : Date,
        city         :[{}],
        role         :[{}],
        lang         :[{}],
    }

});

module.exports = mongoose.model('post', postsSchema);