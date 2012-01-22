(function() {
  var classHelper, _base, _base2, _base3, _base4, _base5,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Gruff = {
    Models: {},
    Collections: {},
    Routers: {},
    Views: {},
    Common: {}
  };

  Gruff.Models.Debate = (function(_super) {

    __extends(Debate, _super);

    function Debate() {
      Debate.__super__.constructor.apply(this, arguments);
    }

    Debate.prototype.paramRoot = 'debate';

    Debate.prototype.urlRoot = '/rest/debates';

    Debate.prototype.defaults = {
      title: null,
      description: null
    };

    Debate.prototype.initialize = function() {
      this.answers = this.initializeDebates("answers");
      this.argumentsFor = this.initializeDebates("argumentsFor");
      this.argumentsAgainst = this.initializeDebates("argumentsAgainst");
      return this.subdebates = this.initializeDebates("subdebates");
    };

    Debate.prototype.fullJSON = function() {
      var json;
      json = this.toJSON();
      json.bestTitle = this.bestTitleText();
      json.bestDescription = this.bestDescriptionText();
      json.linkableId = this.linkableId();
      json.titleLink = this.titleLink();
      return json;
    };

    Debate.prototype.initializeDebates = function(type) {
      var debates;
      debates = new Gruff.Collections.Debates;
      debates.url = "/rest/debates/" + this.id + "/" + type;
      return debates;
    };

    return Debate;

  })(Backbone.Model);

  Gruff.Collections.Debates = (function(_super) {

    __extends(Debates, _super);

    function Debates() {
      Debates.__super__.constructor.apply(this, arguments);
    }

    Debates.prototype.model = Gruff.Models.Debate;

    Debates.prototype.url = '/rest/debates';

    Debates.prototype.fullJSON = function() {
      var json,
        _this = this;
      json = [];
      this.each(function(debate) {
        return json.push(debate.fullJSON());
      });
      return json;
    };

    return Debates;

  })(Backbone.Collection);

  classHelper = new exports.ClassHelper();

  classHelper.augmentClass(Gruff.Models.Debate, exports.Debate);

  Gruff.Routers.DebatesRouter = (function(_super) {

    __extends(DebatesRouter, _super);

    function DebatesRouter() {
      DebatesRouter.__super__.constructor.apply(this, arguments);
    }

    DebatesRouter.prototype.initialize = function(options) {
      var _this = this;
      this.debates = new Gruff.Collections.Debates();
      this.debates.reset(options.debates);
      this.model = new Gruff.Models.Debate({
        id: options.id
      });
      return this.model.fetch({
        success: function(model, response) {
          _this.view = new Gruff.Views.Debates.ShowView({
            'el': $('#main-debate'),
            'model': model
          });
          return _this.view.render();
        }
      });
    };

    DebatesRouter.prototype.routes = {
      "/new": "newDebate",
      "/index": "index",
      "/:id/edit": "edit",
      "/:id": "show",
      ".*": "index"
    };

    DebatesRouter.prototype.newDebate = function() {
      this.view = new Gruff.Views.Debates.NewView({
        collection: this.debates
      });
      return $("#debates").html(this.view.render().el);
    };

    DebatesRouter.prototype.index = function() {
      this.view = new Gruff.Views.Debates.IndexView({
        debates: this.debates
      });
      return $("#debates").html(this.view.render().el);
    };

    DebatesRouter.prototype.show = function(id) {
      var debate;
      debate = this.debates.get(id);
      this.view = new Gruff.Views.Debates.ShowView({
        model: debate
      });
      return $("#debates").html(this.view.render().el);
    };

    DebatesRouter.prototype.edit = function(id) {
      var debate;
      debate = this.debates.get(id);
      this.view = new Gruff.Views.Debates.EditView({
        model: debate
      });
      return $("#debates").html(this.view.render().el);
    };

    return DebatesRouter;

  })(Backbone.Router);

  (_base = Gruff.Views).Debates || (_base.Debates = {});

  Gruff.Views.Debates.DebateView = (function(_super) {

    __extends(DebateView, _super);

    function DebateView() {
      DebateView.__super__.constructor.apply(this, arguments);
    }

    DebateView.prototype.template = $('#debate-template');

    DebateView.prototype.events = {
      "click .destroy": "destroy"
    };

    DebateView.prototype.tagName = "tr";

    DebateView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    DebateView.prototype.render = function() {
      $(this.el).html(this.template(this.model.fullJSON()));
      return this;
    };

    return DebateView;

  })(Backbone.View);

  (_base2 = Gruff.Views).Debates || (_base2.Debates = {});

  Gruff.Views.Debates.EditView = (function(_super) {

    __extends(EditView, _super);

    function EditView() {
      EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.template = $('#debate-edit-template');

    EditView.prototype.events = {
      "submit #edit-debate": "update"
    };

    EditView.prototype.update = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(debate) {
          _this.model = debate;
          return window.location.hash = "/" + _this.model.id;
        }
      });
    };

    EditView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return EditView;

  })(Backbone.View);

  (_base3 = Gruff.Views).Debates || (_base3.Debates = {});

  Gruff.Views.Debates.IndexView = (function(_super) {

    __extends(IndexView, _super);

    function IndexView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.template = $('#debate-index-template');

    IndexView.prototype.initialize = function() {
      return this.options.debates.bind('reset', this.addAll);
    };

    IndexView.prototype.addAll = function() {
      return this.options.debates.each(this.addOne);
    };

    IndexView.prototype.addOne = function(debate) {
      var view;
      view = new Gruff.Views.Debates.DebateView({
        model: debate
      });
      return this.$("tbody").append(view.render().el);
    };

    IndexView.prototype.render = function() {
      $(this.el).html(this.template({
        debates: this.options.debates.toJSON()
      }));
      this.addAll();
      return this;
    };

    return IndexView;

  })(Backbone.View);

  (_base4 = Gruff.Views).Debates || (_base4.Debates = {});

  Gruff.Views.Debates.NewView = (function(_super) {

    __extends(NewView, _super);

    NewView.prototype.initialize = function(options) {
      return this.template = _.template($('#debate-new-template').text());
    };

    NewView.prototype.events = {
      "submit #new-debate": "save"
    };

    function NewView(options) {
      var _this = this;
      NewView.__super__.constructor.call(this, options);
      this.collection = options.collection;
      this.model = new this.collection.model();
      this.model.bind("change:errors", function() {
        return _this.render();
      });
    }

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(debate) {
          _this.model = debate;
          return _this.close();
        },
        error: function(debate, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    };

    NewView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      json.attributeType = this.attributeType;
      json.DebateTypes = exports.Debate.prototype.DebateTypes;
      $(this.el).html(this.template(json));
      $(this.el).show();
      Backbone.ModelBinding.bind(this);
      return this;
    };

    NewView.prototype.close = function() {
      this.remove();
      this.unbind();
      return Backbone.ModelBinding.unbind(this);
    };

    return NewView;

  })(Backbone.View);

  (_base5 = Gruff.Views).Debates || (_base5.Debates = {});

  Gruff.Views.Debates.ShowView = (function(_super) {

    __extends(ShowView, _super);

    function ShowView() {
      ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-show-template').text());
      return this.tags_template = _.template($('#tags-index-template').text());
    };

    ShowView.prototype.events = {
      "click #new-debate-link": "showNewDebateForm"
    };

    ShowView.prototype.render = function() {
      var _this = this;
      this.model.answers.fetch({
        success: function(answers, response1) {
          return _this.model.argumentsFor.fetch({
            success: function(argumentsFor, response2) {
              return _this.model.argumentsAgainst.fetch({
                success: function(argumentsAgainst, response3) {
                  return _this.model.subdebates.fetch({
                    success: function(subdebates, response4) {
                      var json, _ref;
                      json = _this.model.fullJSON();
                      json.answers = answers.fullJSON();
                      json.argumentsFor = argumentsFor.fullJSON();
                      json.argumentsAgainst = argumentsAgainst.fullJSON();
                      json.subdebates = subdebates.fullJSON();
                      json.loggedIn = true;
                      $(_this.el).html(_this.template(json));
                      json.objecttype = "debates";
                      json.objectid = json.linkableId;
                      json.attributetype = "";
                      json.attributeid = "";
                      json.baseurl = (_ref = json.attributetype !== "") != null ? _ref : "/" + json.objecttype + "/" + json.objectid + {
                        "/tag/": "/" + json.objecttype + "/" + json.objectid + "/" + json.attributetype + "/" + json.attributeid + "/tag/"
                      };
                      return $(_this.el).find('.tags').html(_this.tags_template(json));
                    }
                  });
                }
              });
            }
          });
        }
      });
      return this;
    };

    ShowView.prototype.showNewDebateForm = function(e) {
      var collection, debateType, formDiv, formView;
      debateType = $(e.target).attr("debate-type");
      collection = this.model[debateType];
      formDiv = $('#new-' + debateType + '-div');
      $(this).hide();
      formDiv.show();
      formView = new Gruff.Views.Debates.NewView({
        'el': formDiv,
        'collection': collection,
        'attributeType': debateType
      });
      return formView.render();
    };

    return ShowView;

  })(Backbone.View);

}).call(this);