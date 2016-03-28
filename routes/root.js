var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var token = (req.session.token !== undefined) ? req.session.token : '';
	res.render('index', {token: token});
});

module.exports = router;