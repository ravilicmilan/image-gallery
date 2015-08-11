var express = require('express');
var User = require('../models/db').User;
var router = express.Router();

router.get('/', function(req, res, next) {
	User.findOne({}, function(err, user) {
		if (err) throw err;
		if (user.token !== '' || user.token !== undefined) {
			res.render('index', {token: user.token});
		} else {
			res.render('index', {token: null});
		}
	});
});

module.exports = router;