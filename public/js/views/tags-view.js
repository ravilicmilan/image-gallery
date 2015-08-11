app = app || {};

app.Views.TagView = Backbone.View.extend({
	tagName: 'span',
	className: 'tag-span',
	
	template: _.template($('#tag-template').html()),

	events: {
		'click .remove-tag': 'removeTag'
	},

	initialize: function(options) {
		this.imageId = options.imageId;
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		this.$el.html(this.template({
			tag: this.model.toJSON(),
			imageId: this.imageId
		}));
		return this;
	},

	removeTag: function(e) {
		e.preventDefault();
		var _id = this.model.get('_id');
		this.model.setTagUrl(this.imageId, _id);

		if (confirm('Are you sure you want to delete this tag?') === true) {
			this.model.destroy();
			this.remove();
			$('#outline_' + _id).remove();
			$('#tooltip_' + _id).remove();
		}
	}
});

app.Views.TagsView = Backbone.View.extend({
	tagName: 'div',
	className : "well col-xs-12 col-sm-12 col-md-12 col-lg-12",

	initialize: function(options) {
		this.imageId = options.imageId;
		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.listenTo(this.collection, 'reset', this.render);
	},

	render: function() {
		var self = this;
		this.$el.empty();
		
		this.collection.each(function(model) {
			var tagView = new app.Views.TagView({model: model, imageId: self.imageId});
			self.$el.append(tagView.render().el);
		});
		return this;
	}
});