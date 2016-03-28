var crypto = require('crypto');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config');

var secret = config.tokenSecret;

var methods = {
	login: login,
	logout: logout
};

function login (req, res, next) {
	var username = req.body.username;
	var password = req.body.password;

	var sha256 = crypto.createHash('sha256').update(password).digest("hex");
	
	User.findOne({username: username, password: sha256}, function(err, user) {
		if (err) {
			res.json({error: 'User not found'});
		} else if (!user) {
			res.json({error: 'Wrong username or password'});
		} else {
			var token = jwt.sign(user, secret, {expiresInMinutes: 60 * 24 * 7   }); // expires in 1 week
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
}

function logout(req, res, next) {
	User.findOne({token: req.headers['x-access-token']}, function(err, user) {
		if (err) {
			res.status(500).json({error: 'Invalid token hacker'});
		}
		user.token = '';
		user.save(function(err) {
			req.session.loggedIn = false;
			req.session.user = null;
			req.session.token = '';
			res.json({success: 'You have successefully logged out'});
		});
	});
}

module.exports = methods;