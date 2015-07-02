// app/models/productionhouse.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var prodSchema = mongoose.Schema({

    local            : {
        
        picture      :  {type: String,default:'None'},
        establishedIn : {type: String,default:''},
        city         :  { type: String,default:''},
        contact         :{type: String,default:''},
        emailDisplay : {type:Boolean, default:true},
        myname :  String,
        ownername : {type: String,default:''},
        lastProfileUpdateDate : Date,
        PHid :String,
    },
   
    
    portfolio        : {
        myself      :  {type: String,default:''},
        myPhotos     : [{}],
        myPlays     :  [{}],
        myAddress : String,
        myFlickrPics     :  [{}],
        myHoursOfOperation : String ,
        myjourney : {type: String,default:''},
        
        mySocialPresence : [{}]
    },
    respect         : {
        userId      : [{}]
    }

});



// create the model for productionHouses and expose it to our app
module.exports = mongoose.model('productionhouse', prodSchema);

    