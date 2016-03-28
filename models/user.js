var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	token: String
});

module.exports =  mongoose.model('User', userSchema);