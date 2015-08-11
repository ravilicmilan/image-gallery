var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
	label: String,
	viewTop: Number,
	viewLeft: Number,
	tooltipTop: Number,
	tooltipLeft: Number
});

var imageSchema = new mongoose.Schema({
	caption: String,
	fileName: String,
	position: Number,
	tags: [tagSchema]
}, { collection: 'images' });

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	orignalPassword: String,
	token: String
});

imageSchema.statics.updatePosition = function(id, pos, callback) {
	this.update({_id: id }, {$set: {position: pos}}, callback);
};

var ImageModel = mongoose.model('ImageModel', imageSchema);
var User = mongoose.model('User', userSchema);

var Models = {
	ImageModel: ImageModel,
	User: User
};

module.exports = Models;