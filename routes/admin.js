var express = require('express');
var UserController = require('../controllers/users');
var router = express.Router();

router.post('/login', UserController.login);
router.post('/logout', UserController.logout);

module.exports = router;