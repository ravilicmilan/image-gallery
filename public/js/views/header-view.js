app = app || {};

app.Views.HeaderView = Backbone.View.extend({
	template: _.template($('#header-template').html()),

	events: {
		'click #logout_btn': 'logout',
		'click #search_btn': 'search'
	},

	selectMenu: function(menu) {
		this.$('.navbar-nav').find('li').removeClass('active');
		this.$('#' + menu).addClass('active');
	},

	initialize: function(options) {
	},

	render: function() {
		this.$el.html(this.template({loggedIn: app.Auth.loggedIn}));			
		return this;
	},

	logout: function(e) {
		e.preventDefault();
		var self = this;
		$.ajax({
			method: 'POST',
			url: '/admin/logout',
			success: function(data) {
				app.Auth.user = '';
				app.Auth.loggedIn = false;
				app.removeToken();
				app.showMessage('response-success', 'You have successfully logged out!', 1500);
				app.router.navigate('', {trigger: true});
				app.vent.trigger('admin:logout', [self, app.router.imagesView]);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				app.showMessage('response-error', 'You cannot logout if you are not logged in!', 3000);
			}
		});
	},

	search: function(e) {
		e.preventDefault();
		var searchTerm = this.$('#search_txt').val();
		app.router.navigate('images/search/' + searchTerm, {trigger: true});
		this.$('#search_txt').val('');
	}
});