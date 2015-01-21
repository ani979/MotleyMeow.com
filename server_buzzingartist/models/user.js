
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	email: String,
	firstName:String,
	lastName:String,
	gender:String,
	password: String,
	// phoneNo:String
	// firstName: String,
	// lastName: String
});