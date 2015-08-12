# image-gallery
Image Gallery with Image Tagging

This project is SPA (Single Page Application) on MEBN stack (Mongoose, Express, Backbone, Node). It is based upon tutorial of Sebastian Sulinski: image gallery with image tagging with PHP, MYSQL and JQuery.

The purpose of this project is to upload images, add and remove tags on image, view the images, and delete. Images can be searched by caption attribute.
Technologies implemented are: 

	CRUD - PATCH instead of PUT. Only for admin avaialble and only image caption can be updated.
	Authentication - there is only one user which is admin and this user needs to be set manually in the mongolabs database using hashed password ofcourse. Authentication is implemented with json web tokens and sessions
	File uploads - using multer middleware for Node. This is only avaialble for admin as well as deletion of images
	Adding and removing tags - using JQuery DOM manipulation. This can be done by anyone
	Pagination - which is accomplished server side
	Sorting - accomplished with JQuery UI with server side data persistence. Images can be sorted by dragging and dropping
