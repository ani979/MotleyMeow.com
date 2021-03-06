var mongoose = require('mongoose');

var blogPostSchema = mongoose.Schema({

    blogPost:
    {
        authorid        : String, //author's facebook unique_ID
        authorName      : String, //author's fb name
        authorPic       : {type: String, default:''},
        postTitle       : {type: String, default:'Not mentioned'},
        postSubtitle    : {type: String, default:'Not mentioned'},
        postBody        : {type: String, default:'Not mentioned'},
        date            : {type: Date, default: Date.now},
        category      : {type: String, default:'General'},
        tags            : [{}],
        comments        : [{commentorid:String, commentorName:String, commentorPic:String, comment:String, date:Date}],
        approved        : {type: Boolean, default: false},
        myPhotos     : [{}],
        myVideos     : [{}],
        link     : {type: String, default:''}
    }

});

module.exports = mongoose.model('blogPost', blogPostSchema);