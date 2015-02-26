var argv = require('optimist').argv;
var config = { };

// should end in /
config.rootUrl  = process.env.ROOT_URL                  || 'http://localhost:3000/';
// config.rootUrl  = process.env.ROOT_URL                  || 'http://' + localhost + ':8080/';

config.facebook = {
    appId:          process.env.FACEBOOK_APPID          || '1580350615516688',
    appSecret:      process.env.FACEBOOK_APPSECRET      || 'fdcbede19a01da8c5d67f846384be768',
    appNamespace:   process.env.FACEBOOK_APPNAMESPACE   || 'nodescrumptious',
    redirectUri:    process.env.FACEBOOK_REDIRECTURI    ||  config.rootUrl + 'login/callback'
};

module.exports = config;
