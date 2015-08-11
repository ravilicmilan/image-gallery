app = app || {};

app.Views.Pagination = Backbone.View.extend({
	el: '#pagination-nav',
	template: _.template($('#pagination-template').html()),

	perPageValues: [6, 12, 24, 36, 48, 60],

	events: {
		'click .page': 'showPage',
		'change #per-page': 'reloadPage'
	},

	initialize: function (options) {
		var range = 5;
		this.perPage = options.perPage;
		var numOfPages = Math.ceil(options.totalRecords / this.perPage); 
		var currentLinkNumber = options.currentLinkNumber; 

	    var rangeMin = (range % 2 == 0) ? (range / 2) - 1 : (range - 1) / 2;  
	    var rangeMax = (range % 2 == 0) ? rangeMin + 1 : rangeMin;  
	    var pageMin = currentLinkNumber - rangeMin;  
	    var pageMax = currentLinkNumber + rangeMax; 

	    pageMin = (pageMin < 1) ? 1 : pageMin; 
	    pageMax = (pageMax < (pageMin + range - 1)) ? pageMin + range - 1 : pageMax; 

	    if (pageMax > numOfPages) { 
	        pageMin = (pageMin > 1) ? numOfPages - range + 1 : 1; 
	        pageMax = numOfPages; 
	    }

    	pageMin = (pageMin < 1) ? 1 : pageMin; 

    	this.numOfPages = numOfPages;
    	this.currentLinkNumber = currentLinkNumber;
    	this.pageMin = pageMin;
    	this.pageMax = pageMax;
    	this.pageUrl = options.pageUrl || '/images';
	},

	render: function () {
		var html = this.template({
			numOfPages : this.numOfPages,
			perPage: this.perPage,
			perPageValues: this.perPageValues,
	    	currentLinkNumber : this.currentLinkNumber,
	    	pageMin : this.pageMin,
	    	pageMax : this.pageMax,
	    	pageUrl : this.pageUrl
		});
		this.$el.html(html);
		console.log(this.perPage);
		return this;
	},

	showPage: function(e) {
		e.preventDefault();
		var page = $(e.currentTarget).attr('rel');
		var perPage = this.$('#per-page').val(); 
		app.router.navigate('images/page/' + page + '/perpage/' + perPage, {trigger: true});
		this.perPage = perPage;
	},

	reloadPage: function(e) {
		var perPage = this.$('#per-page').val();
		app.router.navigate('images/page/1/perpage/' + perPage, {trigger: true});
	}
});