var login_facebook = require('./login_facebook');

module.exports = function(passport_facebook){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport_facebook.serializeUser(function(user, done) {
            done(null, user);
        });
    passport_facebook.deserializeUser(function(obj, done) {
            done(null, obj);
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login_facebook(passport_facebook);

}