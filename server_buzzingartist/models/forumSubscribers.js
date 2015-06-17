var mongoose = require('mongoose');

var forumSubsSchema = mongoose.Schema({

    subscribers:
    {
        category        : String, 
        emailids      : [{}]   
    }

});
module.exports = mongoose.model('forumSubs', forumSubsSchema);