var argv = require('optimist').argv;

module.exports={
  "facebook_api_key"      :     "FB APP ID",
  "facebook_api_secret"   :     "FB API SECRET",
  "callback_url"          :     "http://localhost:3000/auth/facebook/callback",
  // "callback_url"          :     "http:// " + argv.fe_ip + ":8080/auth/facebook/callback",
  "use_database"          :     "false",
  "host"                  :     "localhost",
  "username"              :     "root",
  "password"              :     "",
  "database"              :     "DB NAME"
}
