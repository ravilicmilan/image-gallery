var User = require('../models/db').User;

module.exports = function(req, res, next) {
	var token = req.headers['x-access-token']; 

	if (token === undefined || token === '') {
		res.json({error: 'You must be logged in to add or delete images'}).status(403);
	} else {
		User.findOne({token: token}, function(err, user) {
			if (err || !user) {
				res.json({error: 'You are a hacker get lost'}).status(401);
			} else {
				next();
			}		
		});		
	}
};