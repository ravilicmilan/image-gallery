var helpers = require('../utils/helpers');
var config = require('../config');
var ImageModel = require('../models/image');
var checkAuth = require('../utils/auth');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });

var imageFolder = config.multer.imageFolder;
var thumbFolder = config.multer.thumbFolder;
var cpUpload = helpers.setupMulter(imageFolder);
var totalImages;


var methods = {
	getImages: getImages,
	getImage: getImage,
	uploadImage: uploadImage,
	addTags: addTags,
	updateImagesPosition: updateImagesPosition,
	updateImageCaption: updateImageCaption,
	deleteImage: deleteImage,
	deleteImageTag: deleteImageTag
};

function getImages(req, res, next) {
	var page;
	var perPage;
	var query = null;
	var token;

	if (!req.params.num || req.params.num == undefined) {
		page = 1;
	} else {
		page = req.params.num;
	}

	if (!req.params.perpage || req.params.perpage == undefined) {
		perPage = 12;
	} else {
		perPage = req.params.perpage;
	}

	if (req.params.searchTerm) {
		query = { caption: new RegExp(req.params.searchTerm, 'i') };
	} else {
		query = {};
	}


	token = req.headers['x-access-token'] || req.session.token ||  '';

	ImageModel.count(query, function(err, count) {
		if (err) res.status(404).json({error: 'No images found!'});

		ImageModel.find(query).skip((page - 1) * perPage).limit(perPage).sort({position: 1}).exec(function(err, images) {
			if (err || images.length < 1) {
				res.status(404).json({error: 'Unable to find records'});
			} else {
				totalImages = count;
				res.json({
					images: images,
					totalRecords: count,
					token: token
				});				
			}
		});
	});
}

function getImage(req, res, next) {
	ImageModel.findOne({_id: req.params._id}, function(err, image) {
		if (err) {
			res.status(400).json({error: 'Unable to get image with an id: ' + req.params.id});
		} 
		res.json(image);
	});
}

function uploadImage(req, res, next) {
	if (!req.body.caption || req.body.caption === '' || req.body.caption.length < 1) {
		res.json({error: 'Caption cannot be empty!'});
	} else if (req.file.size > 1024 * 1024) {
		fs.unlink(imageFolder + req.file.filename, function(err) {
			if (err) throw err;
			res.json({error: 'File too large!'}).status(500);
		});
	} else {
		var oldPath = req.file.destination + req.file.filename;
		var newImagePath = oldPath + '-' + req.file.originalname;
		var thumbImagePath = thumbFolder + req.file.filename + '-' + req.file.originalname;

		fs.rename(oldPath, newImagePath, function(err) {
			if (err) {
				res.status(500).json({error: 'Something went wrong!'});
			}

			ImageModel.count({}, function(err, count) {
				var newImage = new ImageModel({
					caption: helpers.stripScriptTags(req.body.caption),
					fileName: req.file.filename + '-' + req.file.originalname,
					position: count + 1
				});

				console.log('newImage', newImage);

				newImage.save(function(err, image) {
					if (err) {
						throw err;
						res.json({eror: 'Unable to insert new image'}).status(500);
					} 
					gm(newImagePath)
						.resize(200)
						.write(thumbImagePath, function (err) {
						  	if (err) {
						  		res.json({eror: 'Unable to resize image'}).status(500);
						  	} else {
						  		res.json(image);
						  	}
						});	
				});	
			});
			
		});
	}
}

function addTags(req, res, next) {
	ImageModel.findOne({_id: req.params._id}, function(err, image) {
		if (err) throw err;
		var label = helpers.stripScriptTags(req.body.label);
		var viewTop = req.body.viewTop;
		var viewLeft = req.body.viewLeft;
		var tooltipTop = req.body.tooltipTop;
		var tooltipLeft = req.body.tooltipLeft;

		var newTag = {
			label : label,
			viewTop : viewTop,
			viewLeft : viewLeft,
			tooltipTop : tooltipTop,
			tooltipLeft : tooltipLeft
		};

		console.log(newTag);

        image.tags.push(newTag);

        image.save(function(err, image) {
        	if (err) {
        		res.json({error: 'Error saving tags on this image'});
        	} else {
        		res.json(image.tags[image.tags.length - 1]);
        	}
        });
	});
}

function updateImagesPosition(req, res, next) {
	var idsArr = req.body.ids.split(';');

	for (var i = 0; i < idsArr.length; i++) {
		var j = i + 1;
		ImageModel.updatePosition(idsArr[i], j, function(err) {});
	}

	res.json({success: 'Successfully updated images positions'});
}

function updateImageCaption(req, res, next) {
	if (!req.body.caption || req.body.caption === '' || req.body.caption.length < 1) {
		res.json({error: 'Caption cannot be empty!'});
	} else {
		ImageModel.findOne({_id: req.params._id}, function(err, image) {
			if (err) {
				res.json({error: 'Unable to get image with an id: ' + req.params._id});
				throw err;
			} 
			image.caption = helpers.stripScriptTags(req.body.caption);
			image.save(function(err) {
				if (err) {
					res.json({error: 'Unable to update image caption with an id: ' + req.params._id});
					throw err;
				}
				res.json(image);
			});
		});			
	}
}

function deleteImage(req, res, next) {
	ImageModel.findById(req.params._id, function(err, image) {
		if (err) {
			res.json({error: 'Image does not exist with an id: ' + req.params._id});
			throw err;
		}

		var imageFilePath = imageFolder + image.fileName;
		var thumbImagePath = thumbFolder + image.fileName;

		fs.unlink(imageFilePath, function(err) {
			if (err) {
				res.json({error: 'Unable to delete image with an id: ' + image.fileName}); throw err;
			}
			fs.unlink(thumbImagePath, function(err) {
				if (err) {
					res.json({error: 'Unable to delete thumb with an id: ' + image.fileName}); throw err;
				}
				image.remove(function(err) {
					if (err) {
						res.json({error: 'Unable to delete record with an id: ' + req.params._id}); throw err;
					}
					res.json({success: 'Ok'});
				});
			});
		}); 
	});
}

function deleteImageTag(req, res, next) {
	ImageModel.findById(req.params._id, function(err, image) {
		if (err) {
			res.json({error: 'Image not found with _id: ' + req.params._id}).status(400);
		} else {
			var tagId = req.params.tagId;
			image.tags.pull(tagId);
			image.save(function(err) {
				if (err) {
					res.json({error: 'Requested tag could not be deleted with _id: ' + tagId}).status(500);
				} else {
					res.json({success: 'Ok'}).status(200);
				}
			});
		}
	});
}

module.exports = methods;
