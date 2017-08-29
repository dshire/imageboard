Handlebars.templates = Handlebars.templates || {};

var templates = document.querySelectorAll('template');

Array.prototype.slice.call(templates).forEach(function(tmpl) {
    Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
});

Handlebars.partials = Handlebars.templates;

///////    ROUTER   ////////

var Router = Backbone.Router.extend({
    routes: {
        //'': 'home',
        'images': 'images',
        'image/:id': 'image',
        'upload': 'upload',
        '': 'images',

    },
    home: function() {},
    images: function() {
        // var imagesView = new ImagesView({
        new ImagesView({
            el: '#main',
            model: new ImagesModel
        });
    },
    image: function(id) {},
    upload: function() {
        new UploadView({
            el: '#main',
            model: new UploadModel
        });
    }
});



////   MODEL    ///////
var ImagesModel = Backbone.Model.extend({
    initialize: function() {
        this.fetch();
    },
    url: function() {
        return '/images';
    }


});


///  VIEW   ////
var ImagesView = Backbone.View.extend({
    initialize: function() {
        // console.log(this.model)
        var view = this;
        this.model.on('change', function() {
            view.render();
        });
    },
    render: function() {
        var data = this.model.toJSON();
        // console.log(data)
        var html = Handlebars.templates.images(data);
        // console.log(html);
        this.$el.html(html);
    }
});


var UploadView = Backbone.View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(Handlebars.templates.upload({}))
    },
    events: {
        'click button': function(e) {
            this.model.set({
                title: this.$el.find('input[name="title"]').val(),
                user: this.$el.find('input[name="user"]').val(),
                descr: this.$el.find('input[name="descr"]').val(),
                file: this.$el.find('input[type="file"]').prop('files')[0]
            }).save();
        }
    }
});



//////////// UPLOADING /////////////

var UploadModel = Backbone.Model.extend({
    url: '/upload',
    save: function() {
        var formData = new FormData;

        formData.append('file', this.get('file'));
        formData.append('title', this.get('title'));
        formData.append('user', this.get('user'));
        formData.append('descr', this.get('descr'));

        var model = this;
        $.ajax({
            url: this.url,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                console.log('uploadSuccess');
                model.trigger('uploadSuccess');
            }
        });
    }

});




var router = new Router;
Backbone.history.start();
