var express = require('express');
var ImageModel = require('../models/db').ImageModel;
var router = express.Router();
var path = require('path');
var multer = require('multer');
var imageFolder = 'public/media/';
var thumbFolder = imageFolder + 'thumbs/';
var upload = multer({
	dest: imageFolder,
	fileFilter: function(req, file, cb) {
		var ext = file.originalname.split('.');
		ext = ext[ext.length - 1].toLowerCase();
		var allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

		if (allowedExtensions.indexOf(ext) === -1) {
			cb(null, false, {message: 'Only image type files are allowed: ' + allowedExtensions.toString()});
			console.log(file);
		} else {
			cb(null, true);
			console.log(file);
		}
  	}
});
var cpUpload = upload.single('file');
var checkAuth = require('../utils/auth');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var totalImages;

var getImages = function(req, res, next) {
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

	if (req.headers['x-access-token'] || req.session.token) {
		token = req.headers['x-access-token'] || req.session.token;
	} else {
		token = '';
	}


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
};



/* GET  */

router.get('/', function(req, res, next) {
	getImages(req, res, next);
});

router.get('/page/:num/perpage/:perpage', function(req, res, next) {
	getImages(req, res, next);
});

router.get('/:_id', function(req, res, next) {
	ImageModel.findOne({_id: req.params._id}, function(err, image) {
		if (err) {
			res.status(400).json({error: 'Unable to get image with an id: ' + req.params.id});
		} 
		res.json(image);
	});
});

router.get('/search/:searchTerm', function(req, res, next) {
	getImages(req, res, next);
});

router.get('/search/:searchTerm/page/:num/perpage/:perpage', function(req, res, next) {
	getImages(req, res, next);
});



/* POST */


router.post('/', cpUpload,  function(req, res, next) {
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

			var newImage = new ImageModel({
				caption: req.body.caption.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***'),
				fileName: req.file.filename + '-' + req.file.originalname,
				position: totalImages + 1
			});

			newImage.save(function(err, image) {
				if (err) {
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
	}
});


router.post('/:_id/tags', function(req, res, next) {
	ImageModel.findOne({_id: req.params._id}, function(err, image) {
		if (err) throw err;
		var label = req.body.label;
		var viewTop = req.body.viewTop;
		var viewLeft = req.body.viewLeft;
		var tooltipTop = req.body.tooltipTop;
		var tooltipLeft = req.body.tooltipLeft;

		label.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');

		var newTag = {
			label : label,
			viewTop : viewTop,
			viewLeft : viewLeft,
			tooltipTop : tooltipTop,
			tooltipLeft : tooltipLeft
		};

        image.tags.push(newTag);

        image.save(function(err, image) {
        	if (err) {
        		res.json({error: 'Error saving tags on this image'});
        	} else {
        		res.json(image.tags[image.tags.length - 1]);
        	}
        });
	});
});

router.post('/position/update', function(req, res, next) {
	var idsArr = req.body.ids.split(';');

	for (var i = 0; i < idsArr.length; i++) {
		var j = i + 1;
		ImageModel.updatePosition(idsArr[i], j, function(err) {});
	}

	res.json({success: 'Successfully updated images positions'});
});


/* PATCH */

router.patch('/:_id', checkAuth, function(req, res, next) {
	if (!req.body.caption || req.body.caption === '' || req.body.caption.length < 1) {
		res.json({error: 'Caption cannot be empty!'});
	} else {
		ImageModel.findOne({_id: req.params._id}, function(err, image) {
			if (err) {
				res.json({error: 'Unable to get image with an id: ' + req.params._id});
				throw err;
			} 
			image.caption = req.body.caption.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');
			image.save(function(err) {
				if (err) {
					res.json({error: 'Unable to update image caption with an id: ' + req.params._id});
					throw err;
				}
				res.json(image);
			});
		});			
	}
});

/* DELETE */

router.delete('/:_id', checkAuth, function(req, res, next) {
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
});

router.delete('/:_id/tags/:tagId', checkAuth, function(req, res, next) {
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
					res.json({success: 'Ok'});
				}
			});
		}
	});
});

module.exports = router;