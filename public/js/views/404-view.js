app = app || {};

app.Views.NotFound = Backbone.View.extend({
	template: _.template($('#not-found-template').html()),

	initialize: function(options) {
		this.message = options.message || 'Nothing to report here';
	},

	render: function() {
		this.$el.html(this.template({message: this.message}));
		return this;
	}
});