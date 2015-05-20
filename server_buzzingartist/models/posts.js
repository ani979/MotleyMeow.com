var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({

        post: {
            userid          : String,
            postTitle         : {type: String,default:'Not mentioned'},
            postDetail         : {type: String,default:'Not mentioned'},
            date         : Date,
            city         :[{}],
            user : [{}],
            imagePath        : String,
            kind : String
        },

        requirement : {
            role         :[{}],
            lang         :[{}]
        },

        event             :{
            userid          : String,
            eventId         : String,
            eventcover         : String,
            city:String,
            date:Date,
            eventCategory:String,
            title:String,
            link: String,
            endDate     : Date
        }
});

module.exports = mongoose.model('post', postsSchema);