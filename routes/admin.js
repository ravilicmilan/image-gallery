var express = require('express');
var crypto = require('crypto');
var Models = require('../models/db');
var User = Models.User;
var jwt = require('jsonwebtoken');
var router = express.Router();

var secret = 'ujka-Mile_Zida!Satelit:625#';

router.post('/login', function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;

	var sha256 = crypto.createHash('sha256').update(password).digest("hex");
	
	User.findOne({username: username, password: sha256}, function(err, user) {
		if (err) {
			res.json({error: 'User not found'});
		} else if (!user) {
			res.json({error: 'Wrong username or password'});
		} else {
			var token = jwt.sign(user, secret, {expiresInMinutes: 1440   });// expires in 24 hours
			req.session.loggedIn = true;
			req.session.user = {
				'username': user.username,
				'_id': user._id
			};
			req.session.token = token;
			user.token = token;
			user.save(function(err) {
				if (err) throw err;
				res.json({
					user: user.username,
					loggedIn: true,
					token: token
				});				
			});
		}
	});
});

router.post('/logout', function(req, res, next) {
	if (!req.headers['x-access-token']) {
		res.status(403).json({error: 'You have to be logged in before you can logout!'});
	} 
	User.findOne({token: req.headers['x-access-token']}, function(err, user) {
		if (err) {
			res.status(500).json({error: 'Invalid token, you hacker!'});
		}
		user.token = '';
		user.save(function(err) {
			req.session.loggedIn = false;
			req.session.user = null;
			req.session.token = '';
			res.json({success: 'You have successefully logged out'});
		});
	});
});



module.exports = router;