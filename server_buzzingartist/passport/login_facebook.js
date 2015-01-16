var FacebookStrategy = require('passport-facebook').Strategy

module.exports = function(passport_facebook){

        	passport.use(new FacebookStrategy({
            clientID: 1580350615516688,
            clientSecret:"fdcbede19a01da8c5d67f846384be768",
            callbackURL:"http://localhost:3000/auth/facebook/callback"
          },
          function(accessToken, refreshToken, profile, done) {
            process.nextTick(function () {
              //Check whether the User exists or not using profile.id
              //Further DB code.
              return done(null, profile);
            });
          }
        ));
    );
    
}