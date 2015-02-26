var argv = require('optimist').argv;

var ids = {
	facebook: {
 			clientID: 1381852852123169,
            clientSecret:"f81770c7ad1bac855b29c372dd1dc56d",
            callbackURL:"http://localhost:3000/auth/facebook/callback"
            // callbackURL:"http://" + argv.fe_ip + ":3000/auth/facebook/callback"
	}
}

module.exports = ids
