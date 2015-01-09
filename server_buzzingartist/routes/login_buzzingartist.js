var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // res.send("Anupam Singh home");
  res.render('login_buzzingartist',{ title: 'facebook anupam' });
});

module.exports = router;