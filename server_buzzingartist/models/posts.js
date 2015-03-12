var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({

    post             :{
        userid          : String,
        postTitle         : {type: String,default:'Not mentioned'},
        postDetail         : {type: String,default:'Not mentioned'},
        date         : Date,
        city         :[{}],
        role         :[{}],
        lang         :[{}],
        imagePath		 : String
    }

});

module.exports = mongoose.model('post', postsSchema);