var express = require('express');
var ImagesController = require('../controllers/images');
var helpers = require('../utils/helpers');
var ImageModel = require('../models/image');
var router = express.Router();
var config = require('../config');

var cpUpload = helpers.setupMulter(config.multer.imageFolder);
var checkAuth = require('../utils/auth');

/* GET  */

router.get('/', ImagesController.getImages);
router.get('/page/:num/perpage/:perpage', ImagesController.getImages);
router.get('/search/:searchTerm', ImagesController.getImages);
router.get('/search/:searchTerm/page/:num/perpage/:perpage', ImagesController.getImages);

router.get('/:_id', ImagesController.getImage);

/* POST */

router.post('/', checkAuth, cpUpload, ImagesController.uploadImage);
router.post('/:_id/tags', ImagesController.addTags);
router.post('/position/update', ImagesController.updateImagesPosition);

/* PATCH */

router.patch('/:_id', checkAuth, ImagesController.updateImageCaption);

/* DELETE */

router.delete('/:_id', checkAuth, ImagesController.deleteImage);
router.delete('/:_id/tags/:tagId', checkAuth, ImagesController.deleteImageTag);


module.exports = router;