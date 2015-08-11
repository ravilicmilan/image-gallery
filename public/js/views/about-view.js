app = app || {};

app.Views.AboutView = Backbone.View.extend({
	template: _.template($('#about-template').html()),

	initialize: function(options) {
		this.render();
	},

	render: function() {
		this.$el.html(this.template());
		return this;
	}
});