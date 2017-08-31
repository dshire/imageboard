Handlebars.templates = Handlebars.templates || {};

var templates = document.querySelectorAll('template');

Array.prototype.slice.call(templates).forEach(function(tmpl) {
    Handlebars.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML.replace(/{{&gt;/g, '{{>'));
});

Handlebars.partials = Handlebars.templates;



///////    ROUTER   ////////

var Router = Backbone.Router.extend({
    routes: {
        'image/:id': 'image',
        'upload': 'upload',
        '': 'images',
    },
    initialize: function() {
        // console.log(location.hash);
        if (location.hash == '#upload' || location.hash.startsWith('#image/')) {
            this.images();
        }
    },
    images: function() {
        $('#modal').empty();
        $('#main').off();  //removes all event handlers
        new ImagesView({
            el: '#main',
            model: new ImagesModel
        });
    },
    image: function(id) {
        $('#modal').off();
        new ImageView({
            el: '#modal',
            model: new ImageModel({
                id: id
            })
        });
    },
    upload: function() {
        $('#modal').off();
        new UploadView({
            el: '#modal',
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
    },
    events: {
        'click .container': function(e){
            location.hash = '#image/' + $(e.currentTarget).find('img').attr('src').replace('http://reallydavid.s3.amazonaws.com/', '');
        }
    }
});


///////////////// SINGLE IMAGE ////////////////////////

var ImageModel = Backbone.Model.extend({
    postComment: function(){


        var model = this;

        // console.log(this.attributes)
        var comments = this.get('comments');
        comments.splice(0, 0, {
            comment: this.get('comment'),
            author: this.get('author')
        });
        // console.log(comments);

        $.ajax({
            method: 'POST',
            url: '/comment/add/' + this.get('image'),
            data: {
                comment: this.get('comment'),
                author: this.get('author')
            },
            success: function() {
                console.log('commentSuccess');
                model.trigger('commentSuccess');
            }
        });
    },
    initialize: function() {
        this.fetch();
        // console.log(this.id);
    },
    url: function() {
        return ('/image/' + this.id);
    }

});

var ImageView = Backbone.View.extend({
    initialize: function(){

        var view = this;
        this.model.on('change', function() {
            view.render();
        });
        this.model.on('commentSuccess', function() {
            view.render();
        });
    },
    render: function() {
        // console.log(this.model.toJSON())
        try {
            this.$el.html(Handlebars.templates.image(this.model.toJSON()));
        }   catch(e){
            console.log(e);
        }
        // new PostACommentView({
        //     el: '#post-a-comment',
        //     model: new PostACommentModel
        // });
        // this.trigger
    },
    events: {
        'click': function(){
            $('#modal').empty();
            location.hash='';
        },
        'click #x': function(){
            $('#modal').empty();
            location.hash='';
        },
        'click #image-field': function(e){
            e.stopPropagation();
        },
        'click button': function() {
            if( $('input[name="comment"]').val().length > 0 && $('input[name="author"]').val().length > 0){

                this.model.set({
                    comment: this.$el.find('input[name="comment"]').val(),
                    author:  this.$el.find('input[name="author"]').val()

                }).postComment();
            }
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


var UploadView = Backbone.View.extend({
    initialize: function() {
        this.render();
        this.model.on('uploadSuccess', function() {
            console.log('uploadsuccess event check')
            location.hash='';
        });
    },
    render: function() {
        this.$el.html(Handlebars.templates.upload({}))
    },
    events: {
        'click': function(){
            $('#modal').empty();
            location.hash='';
        },
        'click #x': function(){
            $('#modal').empty();
            location.hash='';
        },
        'click #upload-field': function(e){
            e.stopPropagation();
        },
        'click button': function() {
            if( $('input[name="title"]').val().length > 0 && $('input[name="user"]').val().length > 0){

                this.model.set({
                    title: this.$el.find('input[name="title"]').val(),
                    user: this.$el.find('input[name="user"]').val(),
                    descr: this.$el.find('input[name="descr"]').val(),
                    file: this.$el.find('input[type="file"]').prop('files')[0]
                }).save();

            }
        }
    }
});


var router = new Router;
Backbone.history.start();
