/* Protos */

Object.defineProperty(Object.prototype, "bind", {
  value: function(method) {
    var fn = this[method],
        args = [].slice.call(arguments, 1)
    if (fn) return fn.bind.apply(fn, [this].concat(args));
    throw new Error("Obj no tiene método: " + method);
  },
  enumerable: false
})

/* Base classes */

var BaseView = R.extend(Backbone.View, {
  init: function() {
    Backbone.View.apply(this, arguments)
  },
  render: function() {
    var model = (this.model || this.collection),
        data = _.extend(model? model.toJSON() : {}, this.helpers || {}),
        html = this.template(data)
    this.$el.html(html)
    return this
  }
})

var BaseModel = R.extend(Backbone.Model, {
  init: function() {
    Backbone.Model.apply(this, arguments)
  },
  idAttribute: "_id"
})

var BaseCollection = R.extend(Backbone.Collection, {
  init: function() {
    Backbone.Collection.apply(this, arguments)
  }
})

var SmartRouter = R.extend(Backbone.Router, {
  init: function(options) {
    options || (options = {})
    Backbone.Router.apply(this, arguments)
    this._activePage = null
    this.container = $(options.container || "body")
  },
  changePage: function(newPage) {
    var oldActive = this._activePage
    this._activePage = newPage.render()
    this.container.html(this._activePage.el)
    this._activePage.didShow && this._activePage.didShow()
    if (oldActive) {
      oldActive.undelegateEvents()
      oldActive.didHide && oldActive.didHide()
      oldActive.remove()
    }
  }
})

var Cacheable = {
  mixed: function(klass) {
    var klassInit = klass.prototype.init || function() {},
        superFetch = klass.prototype.fetch;

    /* Need to decorate the method by hand */
    klass.prototype.init = function() {
      if (!klass._instance) {
        klass._instance = (klassInit.apply(this, arguments) || this);
        var data = JSON.parse(localStorage.getItem("me"))
        if (data) klass._instance.set(data);
      }
      return klass._instance;
    };

    /* Need to decorate the method by hand */
    klass.prototype.fetch = function(options) {
      if (this._cache && (!options || !options.force)) return this._cache;
      return superFetch.call(this, options)
      .done(R.bind(this, function(data) {
        this._cache = $.Deferred().resolve(data).promise();
      }))
      .fail(R.bind(this, function(xhr) {
        /* TODO: maybe check if the failure is caused by a bad connection
        *        and return the cached data without fail */
        this._cache = undefined;
      }));
    }
  }
};


$(function() {

  /* Models */

  var User = R.extend(BaseModel, {
    fetch: function(options) {
      var data;
      if (data = JSON.parse(localStorage.getItem("me"))) {
        this.set(data)
        this._cache = $.Deferred().resolve(data).promise()
        this.fetch = this._super
        return this._cache
      } else {
        return this.super(options).then(function(data) {
          localStorage.setItem("me", JSON.stringify(data))
          return data
        })
      }
    }
  })
  _.extend(User, {
    isLogged: function() {
      return User.getToken() ? true : false;
    },
    saveToken: function(token) {
      User._token = token
      localStorage.setItem("token", token)
    },
    logout: function() {
      User._token = undefined
      User._cache = undefined
      localStorage.removeItem("token")
      localStorage.removeItem("me")
    },
    getToken: function() {
      return User._token || (User._token = localStorage.getItem("token"))
    },
    update: function(data) {
      User._cache = data;
      localStorage.setItem("me", JSON.stringify(data));
      User.saveToken(data.token)
      return data
    },
    login: function(data) {
      return $.ajax({
        method: "POST",
        url: "/session",
        data: data
      })
      .then(User.update)
    },
    register: function(data) {
      return $.ajax({
        method: "POST",
        url: "/users",
        data: data
      })
      .then(User.update)
    }
  })
  User.mixin(Cacheable);

  var Post = R.extend(BaseModel, {
    urlRoot: "/posts",
    defaults: {
      title: "",
      description: "",
      link: "",
      date: Date.now(),
      user: {},
      votes: 0,
      ncomments: 0
    }
    /* DEBUG */
  })

  var Comment = R.extend(BaseModel, {
    init: function(options) {
      this._super(options)
    },
    urlRoot: "/comments",
    defaults: {
      text: "",
      votes: 0,
      date: Date.now(),
      user: {}
    }
  })

  /* Collections */

  var PostCollection = R.extend(BaseCollection, {
    init: function(section) {
      this.section = section || "hottest"
      this._super()
    },
    model: Post,
    url: function() {
      return "/posts?s=" + this.section
    }
  })

  var CommentCollection = R.extend(BaseCollection, {
    init: function(options) {
      this._super(options)
      this.postId = options.postId
    },
    url: function() {
      return "/comments?post_id=" + this.postId;
    },
    model: Comment,
    /* DEBUG
    fetch: function(options) {
      var CommentFactory = Solipsist.Factory({
        text: "Soy un comentario",
        votes: 123,
        date: new Date,
        user: {
          name: "Pepito",
          id: 12
        },
      })
      this.reset(CommentFactory.array_of(10))
      this.trigger("sync")
    }
    */
  })

  /* Ajax with token */

  Backbone.ajax = function(options) {
    var post = typeof(options.data) === "string"
    post && (options.data = JSON.parse(options.data));
    options.data = _.extend({}, options.data, {token: User.getToken()})
    post && (options.data = JSON.stringify(options.data));
    return Backbone.$.ajax(options).fail(function(xhr) {
      if (+xhr.status === 401) appRouter.navigate("#logout", {trigger: true});
    })
  }


  /* Views */

  var Votable = {
    mixed: function(klass) {
      var events = {
            "click .js-votes-plus": "plusVote",
            "click .js-votes-minus": "minusVote",
          },
          proto = klass.prototype
      proto.events = _.extend({}, events, proto.events)
    },
    plusVote: function(e) {
      e.preventDefault()
      e.stopPropagation()
      Backbone.ajax({
        url: this.model.urlRoot + "/" + this.model.get("_id") + "/vote/up",
        method: "POST"
      }).then(R.bind(this, function() {
        this.model.set({votes: this.model.get("votes")+1})
      }))
    },
    minusVote: function(e) {
      e.preventDefault()
      e.stopPropagation()
      Backbone.ajax({
        url: this.model.urlRoot + "/" + this.model.get("_id") + "/vote/down",
        method: "POST"
      }).then(R.bind(this, function() {
        this.model.set({votes: this.model.get("votes")-1})
      }))
    }
  }

  var PostView = R.extend(BaseView, {
    init: function(options) {
      this._super(options)
      this.model.on("change", R.bind(this, this.render))
    },
    template: _.template($("#template-post-item").html()),
  })
  PostView.mixin(Votable)

  var PostListPageView = R.extend(BaseView, {
    init: function() {
      this._super()
      this.collection = this.hottest = new PostCollection("hottest")
      this.latest = new PostCollection("latest")
      this.showSection("hottest")
      new NewPostView({el: this.el, parent: this})
    },
    template: _.template($("#template-page-listado").html()),
    showSection: function(section) {
      this.section = section
      this.collection.off("sync")
      this.collection = (section === "popular") ? this.hottest : this.latest
      this.emptyContainer()
      this.collection.on("sync", R.bind(this, this.render))
      this.collection.fetch({reset: true})
      this.$("li.active").removeClass("active")
      this.$("#" + section).parent().addClass("active")
    },
    emptyContainer: function() {
      this.$(".js-list-content").html("<img src='/img/loading.gif'/>")
    },
    helpers: {
      username: function() {
        var u = new User()
        return u.get("name")
      }
    },
    render: function() {
      this._super()
      var listContainer = this.$(".js-list-content")
      this.collection.each(R.bind(this, function(post) {
        var postView = new PostView({model: post}).render()
        listContainer.append(postView.el)
      }))
      this.$("li.active").removeClass("active")
      this.$("#" + this.section).parent().addClass("active")
      return this
    }
  })

  var NewPostView = R.extend(BaseView, {
    init: function(options) {
      this._super(options)
      this.parent = options.parent
    },
    events: {
      "click .js-new-post": "newPost",
      "click .js-create-post": "createPost"
    },
    newPost: function(e) {
      e.preventDefault()
      this.$(".modal").toggle()
    },
    createPost: function(e) {
      e.preventDefault()
      var post = new Post({
        link: this.$(".js-url").val(),
        title: this.$(".js-title").val(),
        description: this.$(".js-descripcion").val(),
        votes: 0,
        ncomments: 0
      })
      if (this.parent && this.parent.collection) {
        var col = this.parent.collection
        console.log(col)
        post.once("sync", col.fetch.bind(col, {reset: true}))
      }
      post.save()
      this.$(".modal").find("input[type=text],textarea").val("")
      this.$(".modal").hide()
    }
  })

  var CommentView = R.extend(BaseView, {
    init: function(options) {
      this._super(options)
      this.model.on("change", R.bind(this, this.render))
    },
    template: _.template($("#template-comment-item").html()),
    tagName: "li"
  })
  CommentView.mixin(Votable)

  var PostDetailsPageView = R.extend(BaseView, {
    init: function(postId) {
      this._super()
      this.model = new Post({_id: postId})
      this.commentCollection = new CommentCollection({postId: postId})
      this.commentCollection.on("sync", R.bind(this, this.renderComments))
      this.model.on("change", R.bind(this, this.render))
      this.model.fetch()
      new NewPostView({el: this.el, parent: this})
    },
    events: {
      "click .js-post-comment": "newComment"
    },
    template: _.template($("#template-page-detalle").html()),
    helpers: {
      username: function() {
        var u = new User()
        return u.get("name")
      }
    },
    render: function() {
      this._super()
      this.commentCollection.fetch({reset: true})
      return this
    },
    renderComments: function() {
      var commentContainer = this.$("ul.commentlist").html("")
      this.commentCollection.each(R.bind(this, function(comment) {
        var commentView = new CommentView({model: comment}).render()
        commentContainer.append(commentView.el)
      }))
      return this
    },
    newComment: function(e) {
      e.preventDefault()
      var comment = new Comment({
        text: this.$(".js-comment").val(),
        votes: 0,
        date: new Date,
        post_id: this.model.get("_id"),
        user: {
          name: "Pepito",
          id: 12
        }
      })
      this.$(".js-comment").val("")
      comment.save().then(R.bind(this, function() {
        this.commentCollection.add(comment)
        this.renderComments();
      }))
    },
  })
  PostDetailsPageView.mixin(Votable)


  var LoginPageView = R.extend(BaseView, {
    init: function(options) {
      this._super(options);
    },
    events: { "submit form": "doLogin" },
    template: _.template($("#template-login-page").html()),
    doLogin: function(e) {
      e.preventDefault();
      var data = this.$("form").serialize();
      User.login(data)
      .then(function() {
        this.$("input[type=text], input[type=password]").val("")
        window.appRouter.navigate("#hottest", {trigger: true})
        console.log("Logged OK!")
      }.bind(this))
      .fail(function(xhr) {
        console.log(xhr.responseJSON)
        alert("Credenciales no válidos")
      })
    }
  })

  var RegisterPageView = R.extend(BaseView, {
    init: function(options) {
      this._super(options);
    },
    events: { "submit form": "doRegister" },
    template: _.template($("#template-register-page").html()),
    doRegister: function(e) {
      e.preventDefault();
      var data = this.$("form").serialize();
      User.register(data)
      .then(R.bind(this, function() {
        this.$("input[type=text],input[type=password]").val("")
        window.appRouter.navigate("#hottest", {trigger: true})
      }))
      .fail(function(xhr) {
        console.log(xhr.responseJSON)
        alert("Error al registrarse")
      })
    }
  })


  /* Router */

  var AppRouter = R.extend(SmartRouter, {
    init: function() {
      this._super()
    },
    changePage: function(view, public) {
      view = (public || User.isLogged())? view : new LoginPageView()
      this._super(view)
    },
    routes: {
      "": "index",
      "login": "login",
      "logout": "logout",
      "register": "register",
      "latest": "latest",
      "hottest": "hottest",
      "post/:id": "detalles"
    },
    index: function() {
      if (User.isLogged()) {
        this.hottest()
      } else {
        this.login()
      }
    },
    login: function() {
      this.changePage(new LoginPageView(), true);
    },
    logout: function() {
      User.logout();
      this.login();
    },
    register: function() {
      this.changePage(new RegisterPageView(), true);
    },
    latest: function() {
      if (!(this._activePage instanceof PostListPageView)) {
        this.changePage(new PostListPageView())
      }
      this._activePage.showSection("recent")
    },
    hottest: function() {
      if (!(this._activePage instanceof PostListPageView)) {
        this.changePage(new PostListPageView())
      }
      this._activePage.showSection("popular")
    },
    detalles: function(id) {
      this.changePage(new PostDetailsPageView(id))
    }
  })

  /* Init */

  window.appRouter = new AppRouter()
  Backbone.history.start()

})

/* URLs

* GET /posts?order=latest|hottest
* POST /posts
* GET /post/12
* GET /post/12/comments
* POST /post/12/comments
* GET /session
* POST /session
* POST /users

*/
