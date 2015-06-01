var mongoose = require('mongoose');

var blogPostSchema = mongoose.Schema({

    blogPost:
    {

    }

});

module.exports = mongoose.model('blogPost', blogPostSchema);