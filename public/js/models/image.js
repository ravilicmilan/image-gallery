app = app || {};

app.Models.ImageModel = Backbone.AssociatedModel.extend({
	idAttribute: '_id',
	urlRoot: '/images',

	relations: [{
        type: Backbone.Many,
        key: 'tags',
        relatedModel: app.Models.Tag
    }],

	defaults: {
		caption: '',
		file: '',
		fileName: '',
		position: 0,
		tags: []
	},

	initialize: function() {
		$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
		    jqXHR.setRequestHeader('x-access-token', app.getToken());
	    });
	},

    sync: function (method, model, options) {
		var opts = {
			url: this.url(),
			success: function (data) {
				if (options.success) {
					options.success(data);
				}
			}
		};

		switch (method) {
			case "create":
				opts.type = "POST";
				opts.data = new FormData();
				opts.data.append("file", model.get('file'));
				opts.data.append("caption", model.get('caption'));
				opts.processData = false;
				opts.contentType = false;
			break;
			case "update":
				opts.type = "PATCH";
				opts.data = new FormData();
				opts.data.append("caption", model.get('caption'));
				opts.data.append("position", model.get('position'));
			break;
			case "delete":
				opts.type = "DELETE";
			break;
			default:
				opts.type = "GET";
		}
		return $.ajax(opts);
	}
});