app = app || {};

app.Models.Tag = Backbone.AssociatedModel.extend({
	idAttribute: '_id',
	urlRoot: '/images/',

	setTagUrl: function(imageId, tagId) {
		if (tagId) {
			this.url = this.urlRoot + imageId + "/tags/" + tagId;
		} else {
			this.url = this.urlRoot + imageId + "/tags";
		}
	}
});