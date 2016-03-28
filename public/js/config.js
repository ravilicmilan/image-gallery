var app = {
	Models: {},
	Views: {},
	Collections: {},
	Routers: {},
	router: {},
	vent: {},

	startOverlay: function() {
    	$("body")
	    .append('<div class="overlay"></div><div class="overlay-container"><img src="/img/ajax-loader.gif" /></div>')
	    .css({"overflow-y": "hidden"});
	},

	removeOverlay: function() {
		$("body").css({"overflow-y": "auto"});
		$(".overlay-container, .overlay").animate({"opacity": "0"}, 200, "linear", function() {
			$(".overlay-container, .overlay").remove();  
		});
	},

	showMessage: function(msgClass, msg, delay) {
		var div = $('#response');

		if (div.hasClass('response-success')) {
			div.removeClass('response-success');
		} else if (div.hasClass('response-error')) {
			div.removeClass('response-error');
		}	
		div.addClass(msgClass).fadeIn().html(msg).delay(delay).fadeOut();
	},

	getToken: function() {
		return localStorage.getItem('images_token');
	},

	setToken: function(token) {
		localStorage.setItem('images_token', token);
	},

	removeToken: function() {
		localStorage.setItem('images_token', '');
	},

	getImagesArray: function() {
		return localStorage.getItem('images_position_array').split(',');
	},

	setImagesArray: function(array) {
		localStorage.setItem('images_position_array', array);
	},

	removeImagesArray: function() {
		localStorage.setItem('images_position_array', '');
	},

	Auth: {
		loggedIn: false,
		user: ''
	},

	checkAuth: function() {
		var token = app.getToken();

		if (!token)
			app.Auth.loggedIn = false;
		else
			app.Auth.loggedIn = true;
	},

	rerender: function(views) {
		views.forEach(function(view) {
			view.render();
		});
	},
	
	init: function() {
		_.extend(app.vent, Backbone.Events);
		app.vent.on('admin:login', app.rerender);
		app.vent.on('admin:logout', app.rerender); 
		app.vent.on('tags:add', app.rerender); 


		$.ajaxSetup({
			beforeSend: function() {
				app.startOverlay();
			},
			complete: function() {
				app.removeOverlay();
			}
		});

		Backbone.View.prototype.close = function () {
		    if (this.beforeClose) {
		        this.beforeClose();
		    }
		    this.remove();
		    this.unbind();
		};

		app.checkAuth();
	}
};