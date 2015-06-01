var mongoose = require('mongoose');

var blogPostSchema = mongoose.Schema({

    blogPost:
    {
        authorid        : String, //author's facebook unique_ID
        authorName      : String, //author's fb name
        postTitle       : {type: String, default:'Not mentioned'},
        postBody        : {type: String, default:'Not mentioned'},
        date            : {type: Date, default: Date.now},
        categories      : [{}],
        comments        : [{commentorid:String, commentorName:String, comment:String, date:Date}],
        approved        : {type: Boolean, default: false}
    }

});

module.exports = mongoose.model('blogPost', blogPostSchema);