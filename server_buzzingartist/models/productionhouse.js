// app/models/productionhouse.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var prodSchema = mongoose.Schema({

    local            : {
        picture      : {type: String,default:'None'},
        establishedIn : {type: String,default:'None'},
        city         : {type: String,default:'None'},
        contact         :String,
        emailDisplay : {type:Boolean, default:true},
        myname : String,
        ownername : String,
        lastProfileUpdateDate : Date,
        
    },
    facebook         : {
        id           : String,
    },
    
    portfolio        : {
        myself      : String,
        myPhotos     : [{}],
        myPlays     :  [{}],
        myAddress : String,
        myFlickrPics     :  [{}],
        myHoursOfOperation : String ,
        myjourney : String,
        mySocialPresence : [{}]
    },
    respect         : {
        userId      : [{}]
    }

});



// create the model for productionHouses and expose it to our app
module.exports = mongoose.model('productionhouse', prodSchema);

    