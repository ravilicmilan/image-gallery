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

imageSchema.statics.updatePosition = function(id, pos, callback) {
	this.update({_id: id }, {$set: {position: pos}}, callback);
};

module.exports = mongoose.model('ImageModel', imageSchema);