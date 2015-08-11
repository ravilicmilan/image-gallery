app = app || {};

app.Collections.Images = Backbone.Collection.extend({
	model: app.Models.ImageModel,

	format: 'json', 

	initialize: function(models, options) {
    	this.pageNum = options.pageNum || 1;
        this.perPage = options.perPage || 12;
        this.searchTerm = options.searchTerm || '';
    },

    parse: function (response) {
        return response.images;
    },

    url: function() {
        if (this.searchTerm) {
            if (this.pageNum && this.perPage)
               return '/images/search/' + this.searchTerm + '/page/' + this.pageNum + '/perpage/' + this.perPage; 
            return '/images/search/' + this.searchTerm;
        } else {
            if (this.pageNum && this.perPage)
                return '/images/page/' + this.pageNum + '/perpage/' + this.perPage;
            return '/images';
        }
    }
});