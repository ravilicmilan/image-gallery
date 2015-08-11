app = app || {};

app.Views.ImageView = Backbone.View.extend({
	tagName: 'div',
	className : 'image-wrapper thumbnail pull-left',

	template: _.template($('#image-template').html()),

	events: {
		'click .enlarge-btn': 'showModal',
		'click .delete-image': 'deleteImage',
		'drop' : 'drop'
	},

	initialize: function(options) {
	},

	render: function() {
		this.$el.html(this.template({
			image: this.model.toJSON(),
			loggedIn: app.Auth.loggedIn
		}));
		return this;
	},

	showModal: function(e) {
		e.preventDefault();
		$('.modal-title').text(this.model.get('caption'));
		$('.modal-body img#modal-image').attr('src', '/media/' + this.model.get('fileName'));
	},

	deleteImage: function(e) {
		e.preventDefault();
		var self = this;
		var id = this.model.get('_id');
		if (confirm('Are you sure you want to delete this image?') === true) {
			this.model.destroy( {
				success: function(model, response, options) {
					app.showMessage('response-success', 'Image successfully deleted!', 1500);
					self.remove();
					app.router.imageCollection.splice(app.router.imageCollection.indexOf(id), 1);
				},
				error: function(model, response, options) {
					app.showMessage('response-error', 'Image could not be deleted! Error: ' + jqXhr.error, 5000);
				}
			});
		}	
	},

	drop: function(event, index) {
        this.$el.trigger('update-sort', [this.model, index]);
    }
});

app.Views.ImagesView = Backbone.View.extend({
	tagName: 'div',
	className: 'sortable',
	events: {
		'update-sort': 'updateSort'
	},

	initialize: function(options) {
		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'refresh', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.listenTo(this.collection, 'reset', this.render);
	},

	render: function() {
		var self = this;
		this.$el.empty();
		this.collection.each(function(model) {
			var imageView = new app.Views.ImageView({model: model});
			self.$el.append(imageView.render().el);
		});
		return this;
	},

	updateSort: function(event, model, position) {            
        this.collection.remove(model);

        this.collection.each(function (model, index) {
            var ordinal = index;
            if (index >= position) {
                ordinal += 1;
            }
            model.set('position', ordinal);
        });            

        model.set('position', position);
        this.collection.add(model, {at: position});

        var ids = this.collection.pluck('_id');
        
        $.ajax({
        	type: 'POST',
        	data: {ids: ids.join(';')},
        	url: '/images/position/update',
        	success: function(data) {
        		if (data.success)
        			app.showMessage('response-success', data.success, 1500);
        	}
        });

        this.render();
    }
});

app.Views.ShowImageView = Backbone.View.extend({
	template: _.template($('#show-image-template').html()),
	tagName: 'div',
	className: 'col-md-12 col-xs-12',

	mouseX: 0,
	mouseY: 0,
	topPosition: 0,
	leftPosition : 0,
	label: null,
	outlineWidth: 106,
	outlineHeight: 106,
	tooltipWidthPadding: 40,
	tooltipHeightPadding: 8,
	tagContainer: '<div class="outline"></div><div class="tools"><label class="label">Type name</label><input type="text" name="tag-name" id="tag-name" class="field" /><a href="#" id="saveTag" class="btn btn-success btn-sm">Save</a><a href="#" id="cancelTag" class="btn btn-danger btn-sm">Cancel</a></div>',

	events: {
		'click #image img': 'createDialog',
		'click #saveTag': 'addTag',
		'click #cancelTag': 'removeDialog',
		'mouseover .tag-span': 'showOutline',
		'mouseout .tag-span': 'removeOutline',
		'mouseover .tag-outline': 'showTooltip',
		'mouseout .tag-outline': 'removeTooltip',
		'click .image-left-button div': 'navigateGallery',
		'click .image-right-button div': 'navigateGallery'
	},

	initialize: function(options) {
		this.imageCollection = options.imageCollection || [];
		this.model.on('add:tags', this.render, this);
	},

	render: function() {
		var loggedIn = app.Auth.loggedIn;
		var currentIndex = this.imageCollection.indexOf(this.model.get('_id')); 
		var count = this.imageCollection.length; 
		var leftButton;  
		var rightButton; 
		var leftButtonUrl;
		var rightButtonUrl;

		if (currentIndex - 1 < 0 || currentIndex + 1 >= count) { 
			leftButton = false; 
			rightButton = false;
		} 
		if (currentIndex - 1 >= 0) { 
			leftButton = true; 
		}
		if (currentIndex + 1 < count) {
			rightButton = true;
		}
			 
		if (leftButton === true) {
			leftButtonUrl = '/images/' + this.imageCollection[currentIndex - 1];
		} else {
			leftButtonUrl = false;
		}

		if (rightButton === true) {
			rightButtonUrl = '/images/' + this.imageCollection[currentIndex + 1];
		} else {
			rightButtonUrl = false;
		}

		this.$el.html(this.template({
			image: this.model.toJSON(),
			loggedIn: loggedIn,
			leftButtonUrl: leftButtonUrl,
			rightButtonUrl: rightButtonUrl
		}));
		
		var tags = this.model.get('tags');
		this.renderSubView(tags);

		return this;
	},

	renderSubView: function(collection) {
		if (this.tagsView) {
			this.tagsView.remove();
		}
		var imageId = this.model.get('_id');
		this.tagsView = new app.Views.TagsView({
			collection: collection, 
			imageId: imageId
		});
		this.$('#tags-holder').html(this.tagsView.render().el);
	},

	createDialog: function(e) {
		var self = this;

		// get position of the mouse when the click event was triggered
		this.mouseX = e.pageX - this.$('#image').offset().left;
		this.mouseY = e.pageY - this.$('#image').offset().top;

		// remove any existing tag containers
		this.removeDialog();

		this.$('#image').append(this.tagContainer);

		this.mouseY = this.mouseY - (this.outlineHeight / 2);
		this.mouseX = this.mouseX - (this.outlineWidth / 2);

		$('.outline').css({
			top: this.mouseY, 
			left: this.mouseX
		});
		$('.tools').css({
			top: this.mouseY + this.outlineHeight, 
			left: this.mouseX - 22
		});

		$('.outline').draggable({
			containment: self.$('#image'),
			scroll: false,
			cursor: 'pointer',
			drag: function(event, ui) {
				$('.tools').css({
					top: ui.position.top + self.outlineHeight,
					left: ui.position.left - 22
				});
				$('.outline').css('border', '3px solid #982560');
			},
			stop: function(event, ui) {
				var pos = ui.position;
				self.mouseX = pos.left;
				self.mouseY = pos.top;
				$('.outline').css('border', '3px solid #fff');
			}
		});

		$('#tag-name').focus();
	},

	removeDialog: function() {
		$('.outline').remove();
		$('.tools').remove();
		return false;
	},

	addTag: function(e) {
		e.preventDefault();
		this.label = $('#tag-name').val();

		if (this.label !== '') {
			// add outline and tooltip to the image
			var divs = '<div class="tag-outline" id="view"></div>';
			divs += '<div class="tag-tooltip" id="tooltip_view">' + this.label + '</div>';
			$('#image').append(divs);

			// amend the positon of the view
			$('#view').css({
				top: this.mouseY,
				left: this.mouseX
			});

			// get new element's width and height together with padding
			var tooltip_width = $('#tooltip_view').width() + this.tooltipWidthPadding;
			var tooltip_height = $('#tooltip_view').height() + this.tooltipHeightPadding;

			this.topPosition = this.mouseY + (this.outlineHeight / 2) - parseInt((tooltip_height / 2), 10);
			this.leftPosition = this.mouseX + (this.outlineWidth / 2) - parseInt((tooltip_width / 2), 10);

			// amend the positon of the tooltip_view
			$('#tooltip_view').css({
				top: this.topPosition,
				left: this.leftPosition
			});

			this.saveCurrentTag();
		}
	},

	saveCurrentTag: function() {
		var self = this;
		var imageId = this.model.get('_id');
		var viewDiv = $('#view');
		var tooltipDiv = $('#tooltip_view');

		var tag = new app.Models.Tag({
			label : this.label,
			viewTop : this.mouseY,
			viewLeft : this.mouseX,
			tooltipTop : this.topPosition,
			tooltipLeft : this.leftPosition
		});


		tag.setTagUrl(imageId);
		tag.save({wait: true}, {
			success: function(model, response, options) {
				var tagView = new app.Views.TagView({model: model, imageId: imageId});
				this.$('#tags-holder div').append(tagView.render().el);
				viewDiv.attr('id', 'outline_' + response._id);
				tooltipDiv.attr('id', 'tooltip_' + response._id);
				app.showMessage('response-success', 'New tag added successfully!', 1500);
				self.removeDialog();
			},
			error: function(jqXhr, response, options) {
				app.showMessage('response-error', 'Error adding new tag ', 3000);
			}
		});
	},

	showOutline: function(e) {
		var tagId = $(e.currentTarget).find('a').attr('rel');
		this.$('#outline_' + tagId).css('border', '3px solid #fff');
	},

	removeOutline: function(e) {
		var tagId = $(e.currentTarget).find('a').attr('rel');
		this.$('#outline_' + tagId).css('border', 'transparent');
	},

	showTooltip: function(e) {
		var id = $(e.currentTarget).attr('id').replace('outline_', '');
		this.$('#tooltip_' + id).css({
			'background': '#333',
    		'color': '#fff'
		});
	},

	removeTooltip: function(e) {
		var id = $(e.currentTarget).attr('id').replace('outline_', '');
		this.$('#tooltip_' + id).css({
			'background': 'transparent',
    		'color': 'transparent'
		});
	},

	navigateGallery: function(e) {
		var url = $(e.currentTarget).attr('rel');
		app.router.navigate(url, {trigger: true});
	}
});

app.Views.ImageFormView = Backbone.View.extend({
	tagName: 'div',
	className: 'col-md-12 col-xs-12',
	template: _.template($('#image-form-template').html()),

	events: {
		'change #file': 'onChange',
		'click #add_image': 'uploadImage',
		'click #image': 'createDialog'
	},

	initialize: function(options) {
		
	},

	render: function() {
		this.$el.html(this.template());
		return this;
	},

	onChange: function(e) {
		var input = this.$('#file'),
	      	numFiles = input.get(0).files ? input.get(0).files.length : 1,
	      	label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

	  	this.fileSelect(e, numFiles, label);
	},

	fileSelect: function(event, numFiles, label) {
		var input = this.$('#file').parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        
        if ( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }
	},

	uploadImage: function(e) {
		e.preventDefault();
		var image = new app.Models.ImageModel({
			file: $("#file")[0].files[0],
			caption: $("#caption").val()
		});
		image.save(null, {
			success: function(model, response, options) {
				if (response.error) {
					app.showMessage('response-error', 'Image could not be uploaded! Error: ' + response.error, 3000);
				} else {
					app.showMessage('response-success', 'Image successfully uploaded!', 1500);
					app.router.imageCollection = [];
					app.router.navigate('/images/' + response._id, {trigger: true});
				}
			}
		});
	}
});