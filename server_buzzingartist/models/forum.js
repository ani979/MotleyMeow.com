var mongoose = require('mongoose');

var forumSchema = mongoose.Schema({

    thread:
    {
        authorid        : String, //author's facebook unique_ID
        authorName      : String, //author's fb name
        authorPic       : String,
        topic           : {type: String, default:'Not mentioned'},
        tbody            : {type: String, default:'Not mentioned'},
        date            : {type: Date, default: Date.now},
        category        : String,
        replies         : [{commentorid:String, commentorName:String, commentorPic:String, comment:String, date:Date}],
        recentCommentDate: Date,
        closed          : {type:Boolean, default:false},
        subscribedEmailids : [{}]
    }

});

module.exports = mongoose.model('forum', forumSchema);