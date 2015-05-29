var mongoose = require('mongoose');

var blogPostSchema = mongoose.Schema({

    blogPost:
    {
        author          : String, //author's facebook unique_ID
        postTitle       : {type: String, default:'Not mentioned'},
        postBody        : {type: String, default:'Not mentioned'},
        date            : {type: Date, default: Date.now},
        categories      : [{}],
        //comments        : [{commentorid:String, comment:String, date:Date}],
        approved        : {type: Boolean, default: false}
    }

});

module.exports = mongoose.model('blogPost', blogPostSchema);