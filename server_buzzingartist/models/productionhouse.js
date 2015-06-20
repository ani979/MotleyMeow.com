// app/models/productionhouse.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var prodSchema = mongoose.Schema({

    local            : {
      
        picture      :  { type: String, default:'None'},
        establishedIn : {type: String,default:'None'},
        city         :  { type: String,default:'None'},
        contact         :{type: String,default:'None'},
        emailDisplay : {type:Boolean, default:true},
        myname : {type: String,default:'None'},
        ownername : {type: String,default:'None'},
        lastProfileUpdateDate : Date,
        
    },
    facebook         : {
        id           : String,
    },
    
    portfolio        : {
        myself      :  {type: String,default:'None'},
        myPhotos     : [{}],
        myPlays     :  [{}],
        myAddress : String,
        myFlickrPics     :  [{}],
        myHoursOfOperation : String ,
        myjourney : {type: String,default:'None'},
        
        mySocialPresence : [{}]
    },
    respect         : {
        userId      : [{}]
    }

});



// create the model for productionHouses and expose it to our app
module.exports = mongoose.model('productionhouse', prodSchema);

    