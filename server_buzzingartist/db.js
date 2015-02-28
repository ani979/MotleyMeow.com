var argv = require('optimist').argv;

module.exports = {
	//'url' : 'mongodb://<dbuser>:<dbpassword>@novus.modulusmongo.net:27017/<dbName>'
	'url' : 'mongodb://localhost:27017/buzzingartistDB'
	// 'url' : 'mongodb://' + argv.be_ip + ':28017/db'
}