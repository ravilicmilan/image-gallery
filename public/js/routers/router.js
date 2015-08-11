app = app || {};

app.Routers.Router = Backbone.Router.extend({
	routes: {
		'': 'listImages',
		'images/page/:num/perpage/:perpage': 'listImages',
		'about': 'about',
		'images/:_id': 'showImage',
		'add': 'uploadImage',
		'admin/login': 'adminLogin',
		'images/search/:searchTerm': 'searchImages',
		'images/search/:searchTerm/page/:num/perpage/:perpage': 'searchImages'
	},

	route: function(route, name, callback) {
        var router = this;
        if (!callback) callback = this[name];

        var f = function() {
            app.startOverlay()
            callback.apply(router, arguments);
            app.removeOverlay();
        };
        return Backbone.Router.prototype.route.call(this, route, name, f);
    },

	initialize: function(options) {
		this.headerView = new app.Views.HeaderView({vent: app.vent});
		this.num = 1;
		this.perpage = 12;
		this.imageCollection = [];
		$('#header').html(this.headerView.render().el);
	},

	listImages: function(num, perpage) {
		var self = this;

		if (num == undefined) {
			num = 1;
		}

		if (perpage == undefined) {
			perpage = 12;
		}

		if (!$('#pagination-wrapper').is(':visible'))
            $('#pagination-wrapper').show();

		var images = new app.Collections.Images([], {
			pageNum: num, 
			perPage: perpage
		});
		this.imageCollection = [];

		$('#main').empty();

		images.fetch({
			success: function(model, response, options) {
				images.forEach(function(model) {
					self.imageCollection.push(model.attributes._id);
				});

				self.imagesView = new app.Views.ImagesView({collection: images});
				$('#main').append(self.imagesView.render().el);

				var pagination = new app.Views.Pagination({
					totalRecords: response.totalRecords, 
					currentLinkNumber: parseInt(num),
					perPage: parseInt(perpage),
					pageUrl: '/images'
				});
					
				$('#pagination-wrapper').append(pagination.render().el);

				$('.sortable').sortable({
					items: 'div.image-wrapper',
					stop: function(event, ui) {
			            ui.item.trigger('drop', ui.item.index());
			        }
				});
			},
			error: function(model, response, options) {
				var notFound = new app.Views.NotFound({
					message: response.message
				});
				$('#main').append(notFound.render().el);
				$('#pagination-wrapper').hide();
			}
		});
		this.headerView.selectMenu('home');
	},

	about: function() {
		var aboutView = new app.Views.AboutView();
		$('#main').html(aboutView.el);
		this.headerView.selectMenu('about');
		$('#pagination-wrapper').hide();
	},

	showImage: function(_id) {
		var image = new app.Models.ImageModel({_id: _id});
		$('#main').empty();
		var showImageView = new app.Views.ShowImageView({
			model: image, 
			imageCollection: this.imageCollection
		});
		
		image.fetch().then(function(model, response, options) {
			$('#main').append(showImageView.render().el);
			$('#pagination-wrapper').hide();
		});
		this.headerView.selectMenu('home');
	},

	uploadImage: function() {
		$('#main').empty();
		var formView = new app.Views.ImageFormView();
		$('#main').append(formView.render().el);
		$('#pagination-wrapper').hide();
		this.headerView.selectMenu('add');
	},

	adminLogin: function() {
		$('#main').empty();
		var adminLoginView = new app.Views.AdminLogin({vent: app.vent});
		$('#pagination-wrapper').hide();
		$('#main').append(adminLoginView.render().el);
		this.headerView.selectMenu('admin');
	},

	searchImages: function(searchTerm, num, perpage) {
		var self = this;
		if (num == undefined) {
			num = 1;
		}

		if (perpage == undefined) {
			perpage = 12;
		}

		if (searchTerm == undefined || searchTerm == '') {
			return;
		}

		if (!$('#pagination-wrapper').is(':visible'))
            $('#pagination-wrapper').show();

        $('#main').empty();

		var images = new app.Collections.Images([], {
			searchTerm: searchTerm,
			pageNum: num,
			perPage: perpage
		});
		var imagesView = new app.Views.ImagesView({collection: images});
		this.imageCollection = [];

		images.fetch({
			success: function(model, response, options) {
				images.forEach(function(model) {
					self.imageCollection.push(model.attributes._id);
				});

				$('#main').append(imagesView.render().el);
				var pagination = new app.Views.Pagination({
					totalRecords: response.totalRecords, 
					currentLinkNumber: parseInt(num),
					perPage: parseInt(perpage),
					pageUrl: '/images/search/' + searchTerm
				});
				$('#pagination-wrapper').html(pagination.render().el);
			}, 
			error: function(model, response, options) {
				var notFound = new app.Views.NotFound({
					message: 'There are no images with this serach criteria: ' + searchTerm
				});
				$('#main').append(notFound.render().el);
				$('#pagination-wrapper').hide();
			}
		});
	}
});