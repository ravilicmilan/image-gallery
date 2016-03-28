var multer = require('multer');


var methods = {
	stripScriptTags: stripScriptTags,
	setupMulter: setupMulter
};

function stripScriptTags(text) {
	return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '***');
}


function setupMulter(imageFolder) {
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

	return upload.single('file');
}	

module.exports = methods;