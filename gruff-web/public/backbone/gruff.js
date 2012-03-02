(function() {
  var classHelper, _base, _base10, _base11, _base12, _base13, _base14, _base15, _base2, _base3, _base4, _base5, _base6, _base7, _base8, _base9,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.Gruff = {
    Models: {},
    Collections: {},
    Routers: {},
    Views: {},
    Common: {}
  };

  (_base = Gruff.Models).Debates || (_base.Debates = {});

  Gruff.Models.Debate = (function(_super) {

    __extends(Debate, _super);

    function Debate() {
      this.initializeDebates = __bind(this.initializeDebates, this);
      Debate.__super__.constructor.apply(this, arguments);
    }

    Debate.prototype.paramRoot = 'debate';

    Debate.prototype.urlRoot = '/rest/debates';

    Debate.prototype.idAttribute = "_id";

    Debate.prototype.defaults = {
      title: null,
      description: null
    };

    Debate.prototype.initialize = function(options) {
      this.normalize();
      this.answers = this.initializeDebates("answers");
      this.argumentsFor = this.initializeDebates("argumentsFor");
      this.argumentsAgainst = this.initializeDebates("argumentsAgainst");
      this.subdebates = this.initializeDebates("subdebates");
      this.parentCollection = options.parentCollection;
      this.updateGlobalHash();
      return this.bind('change', this.updateGlobalHash);
    };

    Debate.prototype.fullJSON = function() {
      var json;
      json = this.toJSON();
      json.bestTitle = this.bestTitleText();
      if (json.bestTitle == null) json.bestTitle = "(no title)";
      json.bestDescription = this.bestDescriptionText();
      json.linkableId = this.linkableId();
      json.titleLink = this.titleLink();
      json.DebateTypes = this.DebateTypes;
      return json;
    };

    Debate.prototype.normalize = function() {
      if (typeof (this.get("answerIds")) === 'undefined' || this.get("answerIds") === null) {
        this.set({
          answerIds: []
        });
      }
      if (typeof (this.get("argumentsForIds")) === 'undefined' || this.get("argumentsForIds") === null) {
        this.set({
          argumentsForIds: []
        });
      }
      if (typeof (this.get("argumentsAgainstIds")) === 'undefined' || this.get("argumentsAgainstIds") === null) {
        this.set({
          argumentsAgainstIds: []
        });
      }
      if (typeof (this.get("subdebateIds")) === 'undefined' || this.get("subdebateIds") === null) {
        return this.set({
          subdebateIds: []
        });
      }
    };

    Debate.prototype.initializeDebates = function(type) {
      var debates;
      debates = new Gruff.Collections.Debates;
      debates.url = "/rest/debates/" + this.id + "/" + type;
      debates.setParent(this);
      debates.type = type;
      debates.bind("add", this.makeAddToCollectionEvent(debates));
      debates.bind("remove", this.makeRemoveFromCollectionEvent(debates));
      return debates;
    };

    Debate.prototype.updateGlobalHash = function() {
      return Gruff.Models.Debates[this.linkableId()] = this;
    };

    Debate.prototype.fetchSubdebates = function(options) {
      var _this = this;
      return this.answers.fetch({
        success: function(answers, response1) {
          return _this.argumentsFor.fetch({
            success: function(argumentsFor, response2) {
              return _this.argumentsAgainst.fetch({
                success: function(argumentsAgainst, response3) {
                  return _this.subdebates.fetch({
                    success: function(subdebates, response4) {
                      if (options != null) {
                        if (typeof options.success === "function") {
                          options.success(subdebates, response4);
                        }
                      }
                      return _this.trigger("fetched-subdebates");
                    }
                  });
                }
              });
            }
          });
        }
      });
    };

    Debate.prototype.findDebate = function(id) {
      var root;
      return Gruff.Models.Debates[id];
      root = this.findRootDebate();
      return root.findSubdebate(id);
    };

    Debate.prototype.findRootDebate = function() {
      if (this.parent != null) {
        return this.parent.findRootDebate();
      } else {
        return this;
      }
    };

    Debate.prototype.findSubdebate = function(id) {
      var result;
      if (this.linkableId() === id) return this;
      result = null;
      _.each([this.answers, this.argumentsFor, this.argumentsAgainst, this.subdebates], function(coll) {
        if (coll !== null && result === null) {
          return coll.each(function(debate) {
            if (result === null) return result = debate.findSubdebate(id);
          });
        }
      });
      return result;
    };

    Debate.prototype.getCollectionByName = function(nameStr) {
      var result,
        _this = this;
      result = null;
      _.each(nameStr.split(" "), function(name) {
        switch (name) {
          case "answer":
          case "answers":
            return result = _this.answers;
          case "argumentFor":
          case "argumentsFor":
          case "for":
            return result = _this.argumentsFor;
          case "argumentAgainst":
          case "argumentsAgainst":
          case "against":
            return result = _this.argumentsAgainst;
          case "subdebate":
          case "subdebates":
            return result = _this.subdebates;
        }
      });
      return result;
    };

    Debate.prototype.getIdListName = function(nameStr) {
      var result,
        _this = this;
      result = null;
      _.each(nameStr.split(" "), function(name) {
        switch (name) {
          case "answer":
          case "answers":
            return result = "answerIds";
          case "argumentFor":
          case "argumentsFor":
          case "for":
            return result = "argumentsForIds";
          case "argumentAgainst":
          case "argumentsAgainst":
          case "against":
            return result = "argumentsAgainstIds";
          case "subdebate":
          case "subdebates":
            return result = "subdebateIds";
        }
      });
      return result;
    };

    Debate.prototype.makeAddToCollectionEvent = function(coll) {
      var _this = this;
      return function(debate) {
        debate.parentCollection = coll;
        debate.set({
          parentId: _this.linkableId()
        });
        return _this.updateDebateIds(coll);
      };
    };

    Debate.prototype.makeRemoveFromCollectionEvent = function(coll) {
      var _this = this;
      return function(debate) {
        debate.parentCollection = null;
        debate.set({
          parentId: null
        });
        return _this.updateDebateIds(coll);
      };
    };

    Debate.prototype.updateDebateIds = function(debates) {
      var vals;
      vals = {};
      vals[this.getIdListName(debates.type)] = debates.pluck("_id");
      return this.set(vals);
    };

    return Debate;

  })(Backbone.Model);

  Gruff.Collections.Debates = (function(_super) {

    __extends(Debates, _super);

    function Debates() {
      this.updateUrl = __bind(this.updateUrl, this);
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

    Debates.prototype.setParent = function(parent) {
      this.parent = parent;
      return this.parent.bind("change", this.updateUrl);
    };

    Debates.prototype.updateUrl = function(e) {
      return this.url = "/rest/debates/" + this.parent.id + "/" + this.type;
    };

    return Debates;

  })(Backbone.Collection);

  classHelper = new exports.ClassHelper();

  classHelper.augmentClass(Gruff.Models.Debate, exports.Debate);

  Gruff.Models.Login = (function(_super) {

    __extends(Login, _super);

    function Login() {
      Login.__super__.constructor.apply(this, arguments);
    }

    Login.prototype.paramRoot = 'login';

    Login.prototype.urlRoot = '/login';

    Login.prototype.defaults = {
      login: null,
      password: null
    };

    return Login;

  })(Backbone.Model);

  Gruff.Routers.DebatesRouter = (function(_super) {

    __extends(DebatesRouter, _super);

    function DebatesRouter() {
      DebatesRouter.__super__.constructor.apply(this, arguments);
    }

    DebatesRouter.prototype.initialize = function(options) {
      var _this = this;
      this.model = new Gruff.Models.Debate({
        "_id": options.id
      });
      return this.model.fetch({
        success: function(model, response) {
          _this.view = new Gruff.Views.Debates.ShowView({
            'el': $('#' + model.linkableId()),
            'model': model
          });
          _this.view.render();
          return _this.view.maximize();
        }
      });
    };

    DebatesRouter.prototype.routes = {
      "/new": "newDebate",
      "/index": "index",
      "/:id/edit": "edit",
      "/:id": "show",
      "/:id#": "show",
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
        collection: this.debates
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

  Gruff.Views || (Gruff.Views = {});

  Gruff.Views.ModalView = (function(_super) {

    __extends(ModalView, _super);

    function ModalView() {
      this.handleCloseOnEscape = __bind(this.handleCloseOnEscape, this);
      this.close = __bind(this.close, this);
      ModalView.__super__.constructor.apply(this, arguments);
    }

    ModalView.prototype.initialize = function(options) {
      return ModalView.__super__.initialize.call(this, options);
    };

    ModalView.prototype.render = function() {
      ModalView.__super__.render.apply(this, arguments);
      this.addDialog();
      this.addBg();
      this.enableCloseOnEscape();
      return this;
    };

    ModalView.prototype.addDialog = function() {
      $("body").append('<div class="modal-dialog card" id="modal-dialog"></div>');
      return this.el = $('#modal-dialog');
    };

    ModalView.prototype.addBg = function() {
      $("body").append('<div class="modal-bg" id="modal-bg"></div>');
      this.bg = $("#modal-bg");
      this.bg.width($(document).width());
      this.bg.height($(document).height());
      return this.bg.offset({
        top: 0,
        left: 0
      });
    };

    ModalView.prototype.close = function() {
      this.bg.remove();
      $(document).unbind('keydown', this.handleCloseOnEscape);
      return this.el.remove();
    };

    ModalView.prototype.enableCloseOnEscape = function() {
      return $(document).bind('keydown', this.handleCloseOnEscape);
    };

    ModalView.prototype.handleCloseOnEscape = function(e) {
      if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    ModalView.prototype.center = function() {
      var left, top;
      left = (($(window).width() - $(this.el).width()) / 2) + $(window).scrollLeft();
      top = (($(window).height() - $(this.el).height()) / 2) + $(window).scrollTop();
      return $(this.el).offset({
        top: top,
        left: left
      });
    };

    return ModalView;

  })(Backbone.View);

  (_base2 = Gruff.Views).Debates || (_base2.Debates = {});

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

  (_base3 = Gruff.Views).Debates || (_base3.Debates = {});

  Gruff.Views.Debates.EditDescriptionView = (function(_super) {

    __extends(EditDescriptionView, _super);

    function EditDescriptionView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.close = __bind(this.close, this);
      this.render = __bind(this.render, this);
      EditDescriptionView.__super__.constructor.apply(this, arguments);
    }

    EditDescriptionView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#debate-edit-description-template').text());
      this.descriptionEl = options.descriptionEl;
      return this.model.bind("change:errors", function() {
        return _this.render();
      });
    };

    EditDescriptionView.prototype.save = function() {
      var newDescription,
        _this = this;
      this.model.unset("errors");
      newDescription = this.editDescriptionField.val();
      this.model.setDescription(newDescription);
      return $.ajax({
        type: "POST",
        url: "/debates/descriptions/new",
        data: {
          _id: this.model.linkableId(),
          desc: newDescription
        },
        success: function(data) {
          $(_this.descriptionEl).html(newDescription);
          return _this.close();
        },
        error: function(jqXHR, type) {
          return _this.handleRemoteError(jqXHR);
        }
      });
    };

    EditDescriptionView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      this.parent = $(this.el).parent();
      if (this.descriptionEl == null) {
        this.descriptionEl = $(this.parent).find('> .body');
      }
      $(this.descriptionEl).after(this.template(json));
      $(this.descriptionEl).hide();
      this.editDescriptionField = $(this.parent).find('#' + this.model.linkableId() + "-description-field");
      this.editDescriptionField.bind("keydown", this.handleKeys);
      this.editDescriptionField.bind("blur", this.close);
      this.editDescriptionField.show();
      this.editDescriptionField.focus();
      return this;
    };

    EditDescriptionView.prototype.close = function() {
      $(this.descriptionEl).show();
      this.editDescriptionField.remove();
      return this.unbind();
    };

    EditDescriptionView.prototype.handleKeys = function(e) {
      if (e.keyCode === 13) {
        this.save();
        return false;
      } else if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    return EditDescriptionView;

  })(Backbone.View);

  (_base4 = Gruff.Views).Debates || (_base4.Debates = {});

  Gruff.Views.Debates.EditTitleView = (function(_super) {

    __extends(EditTitleView, _super);

    function EditTitleView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.close = __bind(this.close, this);
      EditTitleView.__super__.constructor.apply(this, arguments);
    }

    EditTitleView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#debate-edit-title-template').text());
      this.titleEl = options.titleEl;
      this.zoomEl = options.zoomEl;
      return this.model.bind("change:errors", function() {
        return _this.render();
      });
    };

    EditTitleView.prototype.save = function() {
      var newTitle,
        _this = this;
      this.model.unset("errors");
      newTitle = this.editTitleField.val();
      this.model.setTitle(newTitle);
      return $.ajax({
        type: "POST",
        url: "/debates/titles/new",
        data: {
          _id: this.model.linkableId(),
          title: newTitle
        },
        success: function(data) {
          $(_this.titleEl).html(newTitle);
          return _this.close();
        },
        error: function(jqXHR, type) {
          return _this.handleRemoteError(jqXHR);
        }
      });
    };

    EditTitleView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      if (!$(this.el).hasClass('.title')) {
        this.el = $(this.el).parents('.title')[0];
      }
      $(this.el).append(this.template(json));
      if (this.titleEl == null) this.titleEl = $(this.el).find('a.title-link');
      $(this.titleEl).hide();
      if (this.zoomEl == null) this.zoomEl = $(this.el).find('a.zoom-link');
      $(this.zoomEl).hide();
      this.editTitleField = $(this.el).find('#' + this.model.linkableId() + "-title-field");
      this.editTitleField.bind("keydown", this.handleKeys);
      this.editTitleField.bind("blur", this.close);
      this.editTitleField.show();
      this.editTitleField.focus();
      return this;
    };

    EditTitleView.prototype.close = function() {
      $(this.titleEl).show();
      $(this.zoomEl).show();
      this.editTitleField.remove();
      return this.unbind();
    };

    EditTitleView.prototype.handleKeys = function(e) {
      if (e.keyCode === 13) {
        this.save();
        return false;
      } else if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    return EditTitleView;

  })(Backbone.View);

  (_base5 = Gruff.Views).Debates || (_base5.Debates = {});

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

  (_base6 = Gruff.Views).Debates || (_base6.Debates = {});

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

  (_base7 = Gruff.Views).Debates || (_base7.Debates = {});

  Gruff.Views.Debates.ListItemView = (function(_super) {

    __extends(ListItemView, _super);

    function ListItemView() {
      this.resolveZoom = __bind(this.resolveZoom, this);
      this.zoom = __bind(this.zoom, this);
      this.mergeDebates = __bind(this.mergeDebates, this);
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      this.openModalView = __bind(this.openModalView, this);
      this.hideDescription = __bind(this.hideDescription, this);
      this.showDescription = __bind(this.showDescription, this);
      this.toggleDescription = __bind(this.toggleDescription, this);
      this.hideInfo = __bind(this.hideInfo, this);
      this.showInfo = __bind(this.showInfo, this);
      this.doToggleInfo = __bind(this.doToggleInfo, this);
      this.toggleInfo = __bind(this.toggleInfo, this);
      this.showEditDescriptionForm = __bind(this.showEditDescriptionForm, this);
      this.showEditTitleForm = __bind(this.showEditTitleForm, this);
      this.cancelEvents = __bind(this.cancelEvents, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      ListItemView.__super__.constructor.apply(this, arguments);
    }

    ListItemView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-list-item-template').text());
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      this.showView = options.showView;
      this.attributeType = options.attributeType;
      this.dontShowInfo = false;
      return this.model.parent = this.model.collection.parent;
    };

    ListItemView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      if (this.attributeType === "argumentsFor") {
        json.divClass = "argument argumentFor";
      }
      if (this.attributeType === "argumentsAgainst") {
        json.divClass = "argument argumentAgainst";
      }
      if (this.attributeType === "answers") json.divClass = "answers";
      if (this.attributeType === "subdebates") json.divClass = "subdebate";
      $(this.parentEl).append(this.template(json));
      this.el = $(this.parentEl).find('#' + this.model.linkableId());
      this.setUpEvents();
      this.enableDragDrop();
      return this;
    };

    ListItemView.prototype.setUpEvents = function() {
      this.$("> h4.title a.title-link").bind("click", this.toggleInfo);
      this.$("> h4.title a.title-link").bind("dblclick", this.showEditTitleForm);
      this.$("> h4.title a.zoom-link").bind("click", this.zoom);
      return this.$("> .body").bind("dblclick", this.showEditDescriptionForm);
    };

    ListItemView.prototype.cancelEvents = function() {
      this.$("> h4.title a.title-link").unbind;
      return this.$("> .body").unbind;
    };

    ListItemView.prototype.showEditTitleForm = function(e) {
      var clickedDebate, clickedDebateId, editTitleView;
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      clickedDebateId = $(e.target).parents('.debate-list-item')[0].id;
      clickedDebate = this.model.findDebate(clickedDebateId);
      editTitleView = new Gruff.Views.Debates.EditTitleView({
        'el': e.target,
        'model': clickedDebate
      });
      return editTitleView.render();
    };

    ListItemView.prototype.showEditDescriptionForm = function(e) {
      var clickedDebate, clickedDebateId, editDescriptionView;
      e.preventDefault();
      e.stopPropagation();
      clickedDebateId = $(e.target).parents('.debate-list-item')[0].id;
      clickedDebate = this.model.findDebate(clickedDebateId);
      editDescriptionView = new Gruff.Views.Debates.EditDescriptionView({
        'el': e.target,
        'model': clickedDebate
      });
      return editDescriptionView.render();
    };

    ListItemView.prototype.toggleInfo = function(e) {
      var _this = this;
      if (this.clickTimeout != null) {
        return false;
      } else {
        this.clickTimeout = setTimeout(function() {
          _this.doToggleInfo(e);
          return _this.clickTimeout = null;
        }, 500);
        return false;
      }
    };

    ListItemView.prototype.doToggleInfo = function(e) {
      var containerEl;
      if (this.model.get("type") === this.model.DebateTypes.DIALECTIC) {
        containerEl = this.$('> div.arguments');
      } else {
        containerEl = this.$('> div.answers');
      }
      if ($(containerEl).css("display") === "none") {
        this.showInfo();
      } else {
        this.hideInfo();
      }
      return false;
    };

    ListItemView.prototype.showInfo = function(e) {
      var containerEl,
        _this = this;
      if (this.dontShowInfo) {
        this.dontShowInfo = false;
        return false;
      }
      if (this.model.get("type") === this.model.DebateTypes.DIALECTIC) {
        containerEl = this.$('> div.arguments');
      } else {
        containerEl = this.$('> div.answers');
      }
      return this.model.fetchSubdebates({
        error: function() {
          return alert("Error");
        },
        success: function(subdebates, response4) {
          var againstEl, answersEl, forEl, json;
          json = _this.model.fullJSON();
          json.loggedIn = true;
          if (!$(_this.el).hasClass('ui-draggable-dragging')) {
            if (_this.model.get("type") === _this.model.DebateTypes.DIALECTIC) {
              _this.$('div.arguments').show();
              forEl = _this.$('> div.arguments > .for .debates-list').first();
              againstEl = _this.$('> div.arguments > .against .debates-list').first();
              _this.argumentsForView = new Gruff.Views.Debates.MiniListView({
                'el': forEl,
                'collection': _this.model.argumentsFor,
                'attributeType': 'argumentsFor',
                'parentView': _this,
                'showView': _this.showView
              });
              _this.argumentsForView.render();
              _this.argumentsAgainstView = new Gruff.Views.Debates.MiniListView({
                'el': againstEl,
                'collection': _this.model.argumentsAgainst,
                'attributeType': 'argumentsAgainst',
                'parentView': _this,
                'showView': _this.showView
              });
              _this.argumentsAgainstView.render();
            } else {
              answersEl = _this.$('> div.answers > .debates-list').first();
              answersEl.show();
              _this.answersView = new Gruff.Views.Debates.MiniListView({
                'el': answersEl,
                'collection': _this.model.answers,
                'attributeType': 'answers',
                'parentView': _this,
                'showView': _this.showView
              });
              _this.answersView.render();
            }
            _this.showDescription();
            return containerEl.show();
          }
        }
      });
    };

    ListItemView.prototype.hideInfo = function() {
      var answersEl, _ref, _ref2, _ref3;
      this.hideDescription();
      if (this.model.get("type") === this.model.DebateTypes.DIALECTIC) {
        this.$('> div.arguments').hide();
        if ((_ref = this.argumentsForView) != null) _ref.close();
        return (_ref2 = this.argumentsAgainstView) != null ? _ref2.close() : void 0;
      } else {
        answersEl = this.$('> div.answers > .debates-list').first();
        answersEl.hide();
        return (_ref3 = this.answersView) != null ? _ref3.close() : void 0;
      }
    };

    ListItemView.prototype.toggleDescription = function(e) {
      if (!$(this.el).hasClass('ui-draggable-dragging')) {
        this.$('> div.body').toggle();
      }
      return false;
    };

    ListItemView.prototype.showDescription = function() {
      return this.$('> div.body').show();
    };

    ListItemView.prototype.hideDescription = function() {
      return this.$('> div.body').hide();
    };

    ListItemView.prototype.openModalView = function(e, ui) {
      this.hideInfo();
      this.showView.toggleSubdebateDiv(this);
      return false;
    };

    ListItemView.prototype.closeModalView = function() {};

    ListItemView.prototype.enableDragDrop = function() {
      var _this = this;
      this.$('> h4 a.title-link').droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        hoverClass: 'over',
        greedy: true,
        over: function(e, ui) {
          _this.$('> h4').addClass('over');
          return _this.hoverTimeout = setTimeout(function() {
            return _this.doToggleInfo(e, ui);
          }, 500);
        },
        out: function(e, ui) {
          clearTimeout(_this.hoverTimeout);
          return _this.$('> h4').removeClass('over');
        },
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          return _this.mergeDebates(dragged, event.target);
        }
      });
      this.$('> h4 a.zoom-link').droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        greedy: true,
        over: function(e, ui) {
          _this.$('> h4').addClass('over');
          return _this.hoverTimeout = setTimeout(function() {
            return _this.zoom();
          }, 500);
        },
        out: function(e, ui) {
          clearTimeout(_this.hoverTimeout);
          return _this.$('> h4').removeClass('over');
        },
        drop: function(event, ui) {
          return alert("Dropping a debate onto the zoom link does nothing");
        }
      });
      return $(this.el).draggable({
        revert: true,
        refreshPositions: true,
        distance: 5,
        helper: 'clone',
        cursorAt: {
          left: 0
        },
        start: function(e, ui) {
          var cloneEl;
          _this.dontShowInfo = true;
          _this.hideInfo();
          _this.$('> h4').css('opacity', 0);
          cloneEl = ui.helper;
          cloneEl.find('div, a.zoom-link').remove();
          return cloneEl.attr('id', _this.model.id);
        },
        stop: function(e, ui) {
          _this.resolveZoom();
          return _this.$('> h4').css('opacity', 1);
        }
      });
    };

    ListItemView.prototype.close = function() {
      this.el.remove();
      return this.unbind();
    };

    ListItemView.prototype.mergeDebates = function(dragged, target) {
      return alert("Dropping one debate onto another has not yet been implemented");
    };

    ListItemView.prototype.zoom = function() {
      var newShowEl;
      this.myShowView = Gruff.Views.Debates.ShowViews[this.model.id];
      if (this.myShowView != null) {
        this.myShowView.show();
        this.myShowView.maximize();
      } else {
        newShowEl = $(this.showView.el).clone();
        newShowEl.attr('id', this.model.id);
        $(this.showView.el).after(newShowEl);
        this.myShowView = new Gruff.Views.Debates.ShowView({
          'el': newShowEl,
          'model': this.model,
          'parentView': this.showView
        });
        this.myShowView.render();
        this.myShowView.maximize();
      }
      if (this.isDragging()) {
        this.showView.offScreen();
      } else {
        this.showView.minimize();
      }
      return false;
    };

    ListItemView.prototype.resolveZoom = function() {
      this.showView.maximize();
      return this.showView.focus();
    };

    return ListItemView;

  })(Backbone.View);

  (_base8 = Gruff.Views).Debates || (_base8.Debates = {});

  Gruff.Views.Debates.ListView = (function(_super) {

    __extends(ListView, _super);

    function ListView() {
      this.remove = __bind(this.remove, this);
      this.add = __bind(this.add, this);
      ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(options) {
      this.attributeType = options.attributeType;
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
      this.parentView = options.parentView;
      return this.showView = options.showView;
    };

    ListView.prototype.render = function() {
      var _this = this;
      this.views = [];
      this.collection.each(function(debate) {
        return _this.add(debate);
      });
      return this;
    };

    ListView.prototype.close = function() {
      return _.each(this.views, function(view) {
        return view.close();
      });
    };

    ListView.prototype.add = function(debate) {
      var itemView;
      debate.parentCollection = this.collection;
      itemView = new Gruff.Views.Debates.ListItemView({
        'parentEl': this.el,
        'model': debate,
        'attributeType': this.attributeType,
        'parentView': this,
        'showView': this.showView
      });
      this.views.push(itemView);
      return itemView.render();
    };

    ListView.prototype.remove = function(debate) {
      var viewToRemove,
        _this = this;
      viewToRemove = _.select(this.views, function(view) {
        var _ref;
        return ((_ref = view.model) != null ? _ref.id : void 0) === debate.id;
      })[0];
      this.views = _.without(this.views, viewToRemove);
      return $(viewToRemove.el).remove();
    };

    return ListView;

  })(Backbone.View);

  (_base9 = Gruff.Views).Debates || (_base9.Debates = {});

  Gruff.Views.Debates.MiniListView = (function(_super) {

    __extends(MiniListView, _super);

    function MiniListView() {
      this.showNewDebateForm = __bind(this.showNewDebateForm, this);
      this.setUpDragDrop = __bind(this.setUpDragDrop, this);
      MiniListView.__super__.constructor.apply(this, arguments);
    }

    MiniListView.prototype.initialize = function(options) {
      return MiniListView.__super__.initialize.call(this, options);
    };

    MiniListView.prototype.render = function() {
      MiniListView.__super__.render.apply(this, arguments);
      this.model = this.collection.parent;
      this.linkEl = $(this.el).next();
      this.linkEl.bind("click", this.showNewDebateForm);
      this.setUpDragDrop();
      return this;
    };

    MiniListView.prototype.close = function() {
      return MiniListView.__super__.close.apply(this, arguments);
    };

    MiniListView.prototype.setUpDragDrop = function() {
      var _this;
      _this = this;
      return $(this.el).parent().droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        greedy: true,
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          $(this).removeClass('over');
          if ($(dragged).parent().parent()[0] !== this) {
            _this.moveDebate(dragged, $(this));
            return ui.helper.hide();
          }
        },
        over: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          if ($(dragged).parent().parent()[0] !== this) {
            return $(this).addClass('over');
          }
        },
        out: function(event, ui) {
          return $(this).removeClass('over');
        }
      });
    };

    MiniListView.prototype.showNewDebateForm = function(e) {
      this.linkEl.hide();
      this.newView = new Gruff.Views.Debates.SimpleNewView({
        'el': this.el,
        'parentView': this,
        'collection': this.collection,
        'attributeType': this.attributeType
      });
      return this.newView.render();
    };

    return MiniListView;

  })(Gruff.Views.Debates.ListView);

  (_base10 = Gruff.Views).Debates || (_base10.Debates = {});

  Gruff.Views.Debates.NewView = (function(_super) {

    __extends(NewView, _super);

    function NewView() {
      this.save = __bind(this.save, this);
      NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#debate-new-template').text());
      this.attributeType = options.attributeType;
      this.model = new this.collection.model();
      return this.model.bind("change:errors", function() {
        return _this.render();
      });
    };

    NewView.prototype.events = {
      "submit #new-debate": "save",
      "click .cancel_button": "close"
    };

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
          return _this.handleRemoteError(jqXHR, debate);
        }
      });
    };

    NewView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      json.attributeType = this.attributeType;
      json.DebateTypes = exports.Debate.prototype.DebateTypes;
      json.chooseType = this.attributeType === "answers" || this.attributeType === "subdebates";
      $(this.el).html(this.template(json));
      $(this.el).show();
      Backbone.ModelBinding.bind(this);
      $(this.el).find('#title').focus();
      return this;
    };

    NewView.prototype.close = function() {
      $(this.el).parent().find('.new-debate-link').show();
      $(this.el).children().remove();
      this.unbind();
      return Backbone.ModelBinding.unbind(this);
    };

    return NewView;

  })(Backbone.View);

  (_base11 = Gruff.Views).Debates || (_base11.Debates = {});

  (_base12 = Gruff.Views.Debates).ShowViews || (_base12.ShowViews = {});

  Gruff.Views.Debates.ShowView = (function(_super) {

    __extends(ShowView, _super);

    function ShowView() {
      this.maximize = __bind(this.maximize, this);
      this.minimize = __bind(this.minimize, this);
      this.showEditDescriptionForm = __bind(this.showEditDescriptionForm, this);
      this.showEditTitleForm = __bind(this.showEditTitleForm, this);
      this.toggleDescription = __bind(this.toggleDescription, this);
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      this.disableDragDrop = __bind(this.disableDragDrop, this);
      this.setUpZoomLinkDragDrop = __bind(this.setUpZoomLinkDragDrop, this);
      this.setUpDragDrop = __bind(this.setUpDragDrop, this);
      this.handleKeys = __bind(this.handleKeys, this);
      this.cancelHandleKeys = __bind(this.cancelHandleKeys, this);
      this.setUpHandleKeys = __bind(this.setUpHandleKeys, this);
      this.setUpMaximizeEvents = __bind(this.setUpMaximizeEvents, this);
      this.setUpMinimizeEvents = __bind(this.setUpMinimizeEvents, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      this.showNewDebateForm = __bind(this.showNewDebateForm, this);
      this.indentTitle = __bind(this.indentTitle, this);
      this.renderParents = __bind(this.renderParents, this);
      ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-show-template').text());
      this.tags_template = _.template($('#tags-index-template').text());
      this.childView = options.childView;
      if (this.childView != null) this.childView.parentView = this;
      this.parentView = options.parentView;
      if (this.parentView != null) this.parentView.childView = this;
      this.loaded = false;
      this.status = "unrendered";
      return Gruff.Views.Debates.ShowViews[this.model.id] = this;
    };

    ShowView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      json.loggedIn = true;
      $(this.el).html(this.template(json));
      this.zoomLink = this.$('> .canvas-title .zoom-link');
      this.renderParents();
      this.setUpEvents();
      this.zoomLink.hide();
      this.status = "rendered";
      return this;
    };

    ShowView.prototype.renderParents = function() {
      var parentId, _ref,
        _this = this;
      parentId = this.model.get("parentId");
      if ((parentId != null) && !(this.model.parent != null)) {
        this.model.parent = new Gruff.Models.Debate({
          "_id": parentId
        });
        return this.model.parent.fetch({
          success: function(model, response) {
            var parentEl;
            parentEl = $(_this.el).clone();
            parentEl.attr('id', parentId);
            $(_this.el).before(parentEl);
            _this.parentView = new Gruff.Views.Debates.ShowView({
              'el': parentEl,
              'model': _this.model.parent,
              'childView': _this
            });
            _this.parentView.render();
            _this.parentView.minimize();
            return _this.indentTitle();
          }
        });
      } else {
        if ((_ref = this.parentView) != null) _ref.childView = this;
        return this.indentTitle();
      }
    };

    ShowView.prototype.indentTitle = function() {
      var currParent, parents;
      parents = 0;
      currParent = this.model.parent;
      while (currParent != null) {
        parents++;
        currParent = currParent.parent;
      }
      return this.$('> div.title').css('margin-left', 5 * parents + '%');
    };

    ShowView.prototype.showNewDebateForm = function(e) {
      var collection, debateType, formDiv, formView;
      debateType = $(e.target).attr("debate-type");
      collection = this.model[debateType];
      $(e.target).hide();
      formDiv = $('#' + this.model.id + '-new-' + debateType + '-div');
      formDiv.show();
      formView = new Gruff.Views.Debates.NewView({
        'el': formDiv,
        'collection': collection,
        'attributeType': debateType
      });
      return formView.render();
    };

    ShowView.prototype.setUpEvents = function() {
      this.$("> .title").bind("click", this.toggleDescription);
      this.$("> .title").bind("dblclick", this.showEditTitleForm);
      this.$("> .description").bind("dblclick", this.showEditDescriptionForm);
      this.zoomLink.bind("click", this.maximize);
      return this.setUpHandleKeys();
    };

    ShowView.prototype.setUpMinimizeEvents = function() {
      this.$("> .title").bind("click", this.toggleDescription);
      this.zoomLink.show();
      return this.setUpZoomLinkDragDrop();
    };

    ShowView.prototype.setUpMaximizeEvents = function() {
      this.zoomLink.hide();
      this.$("> .title").unbind("click", this.toggleDescription);
      this.$(".bottom-form .new-debate-link").bind("click", this.showNewDebateForm);
      return this.setUpDragDrop();
    };

    ShowView.prototype.setUpHandleKeys = function() {
      return $(document).bind('keydown', this.handleKeys);
    };

    ShowView.prototype.cancelHandleKeys = function() {
      return $(document).unbind('keydown', this.handleKeys);
    };

    ShowView.prototype.handleKeys = function(e) {
      if ($("input:focus, textarea:focus").length > 0) return true;
      if (e.keyCode === 65) {
        this.$('[debate-type="argumentsAgainst"], [debate-type="answers"]').click();
        return false;
      } else if (e.keyCode === 70) {
        this.$('[debate-type="argumentsFor"]').click();
        return false;
      } else if (e.keyCode === 83) {
        this.$('[debate-type="subdebates"]').click();
        return false;
      } else {
        return true;
      }
    };

    ShowView.prototype.setUpDragDrop = function() {
      var _this;
      _this = this;
      return this.$("> .arguments > .for, > .arguments > .against, > .subdebates, > .answers").droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          $(this).removeClass('over');
          if ($(dragged).parent().parent()[0] !== this) {
            _this.moveDebate(dragged, $(this));
            ui.helper.hide();
            return _this.focus();
          }
        },
        over: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          if ($(dragged).parent().parent()[0] !== this) {
            return $(this).addClass('over');
          }
        },
        out: function(event, ui) {
          return $(this).removeClass('over');
        }
      });
    };

    ShowView.prototype.setUpZoomLinkDragDrop = function() {
      var _this = this;
      return this.$('> .canvas-title').add(this.zoomLink).droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        greedy: true,
        over: function(e, ui) {
          _this.$('> .canvas-title').addClass('over');
          return _this.hoverTimeout = setTimeout(function() {
            _this.maximize();
            ui.helper.show();
            return ui.draggable.show();
          }, 500);
        },
        out: function(e, ui) {
          _this.$('> .canvas-title').removeClass('over');
          return clearTimeout(_this.hoverTimeout);
        },
        drop: function(event, ui) {
          return alert("Dropping a debate onto the zoom link does nothing");
        }
      });
    };

    ShowView.prototype.disableDragDrop = function() {
      this.$(".argument, .answer, .subdebate").draggable("option", "disabled", true);
      this.$(".argument, .answer, .subdebate").droppable("option", "disabled", true);
      return this.$(".for, .against, .subdebates, .answers").droppable("option", "disabled", true);
    };

    ShowView.prototype.enableDragDrop = function() {
      this.$(".argument, .answer, .subdebate").draggable("option", "disabled", false);
      this.$(".argument, .answer, .subdebate").droppable("option", "disabled", false);
      return this.$(".for, .against, .subdebates, .answers").droppable("option", "disabled", false);
    };

    ShowView.prototype.toggleDescription = function(e) {
      this.$('> div.description').toggle();
      return false;
    };

    ShowView.prototype.toggleSubdebateDiv = function(listItemView) {
      var dragged, overDebate, subdebateDiv;
      if (this.modalView != null) {
        this.modalView.close();
        this.modalView = null;
        this.enableDragDrop();
        return listItemView.closeModalView();
      } else {
        subdebateDiv = listItemView.el[0];
        if (!$(subdebateDiv).hasClass('debate-list-item')) {
          subdebateDiv = $(subdebateDiv).parents('.debate-list-item')[0];
        }
        this.disableDragDrop();
        if (typeof ui !== "undefined" && ui !== null) {
          dragged = ui.helper;
          $(dragged).draggable("option", "disabled", false);
        }
        $(subdebateDiv).droppable("option", "disabled", false);
        overDebate = this.model.findDebate(subdebateDiv.id);
        this.modalView = new Gruff.Views.Debates.SubdebateView({
          'el': $(subdebateDiv).find('> .subdebate-show'),
          'model': overDebate,
          'parentView': this
        });
        return this.modalView.render();
      }
    };

    ShowView.prototype.showEditTitleForm = function(e) {
      var editTitleView;
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      editTitleView = new Gruff.Views.Debates.EditTitleView({
        'el': e.target,
        'titleEl': e.target,
        'model': this.model
      });
      return editTitleView.render();
    };

    ShowView.prototype.showEditDescriptionForm = function(e) {
      var editDescriptionView;
      e.preventDefault();
      e.stopPropagation();
      editDescriptionView = new Gruff.Views.Debates.EditDescriptionView({
        'el': e.target,
        'descriptionEl': e.target,
        'model': this.model
      });
      return editDescriptionView.render();
    };

    ShowView.prototype.minimize = function() {
      var _ref;
      if (this.isOffScreen) this.onScreen();
      if ((_ref = this.parentView) != null) _ref.minimize();
      this.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').hide();
      this.setUpMinimizeEvents();
      this.status = "minimized";
      return false;
    };

    ShowView.prototype.maximize = function() {
      var _this = this;
      this.status = "maximized";
      if (!this.isDragging()) this.focus();
      if (this.loaded) {
        this.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').show(200);
        return this.setUpMaximizeEvents();
      } else {
        this.model.fetchSubdebates({
          success: function(subdebates, response4) {
            var json, _ref;
            _this.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').show(200);
            json = _this.model.fullJSON();
            json.loggedIn = true;
            json.objecttype = "debates";
            json.objectid = json.linkableId;
            json.attributetype = "";
            json.attributeid = "";
            json.baseurl = (_ref = json.attributetype !== "") != null ? _ref : "/" + json.objecttype + "/" + json.objectid + {
              "/tag/": "/" + json.objecttype + "/" + json.objectid + "/" + json.attributetype + "/" + json.attributeid + "/tag/"
            };
            _this.$('.tags').html(_this.tags_template(json));
            if (_this.model.get("type") === _this.model.DebateTypes.DEBATE) {
              _this.answersView = new Gruff.Views.Debates.ListView({
                'el': _this.$('.answers .debates-list').first(),
                'collection': _this.model.answers,
                'attributeType': 'answers',
                'parentView': _this,
                'showView': _this
              });
              _this.answersView.render();
            }
            if (_this.model.get("type") === _this.model.DebateTypes.DIALECTIC) {
              _this.argumentsForView = new Gruff.Views.Debates.ListView({
                'el': _this.$('> .arguments > .for .debates-list').first(),
                'collection': _this.model.argumentsFor,
                'attributeType': 'argumentsFor',
                'parentView': _this,
                'showView': _this
              });
              _this.argumentsForView.render();
              _this.argumentsAgainstView = new Gruff.Views.Debates.ListView({
                'el': _this.$('> .arguments > .against .debates-list').first(),
                'collection': _this.model.argumentsAgainst,
                'attributeType': 'argumentsAgainst',
                'parentView': _this,
                'showView': _this
              });
              _this.argumentsAgainstView.render();
            }
            _this.subdebatesView = new Gruff.Views.Debates.ListView({
              'el': _this.$('> .subdebates .debates-list').first(),
              'collection': _this.model.subdebates,
              'attributeType': 'subdebates',
              'parentView': _this,
              'showView': _this
            });
            _this.subdebatesView.render();
            _this.setUpMaximizeEvents();
            return _this.loaded = true;
          }
        });
        return false;
      }
    };

    ShowView.prototype.close = function() {
      var _ref, _ref2, _ref3, _ref4, _ref5;
      if ((_ref = this.childView) != null) _ref.close();
      if ((_ref2 = this.argumentsForView) != null) _ref2.close();
      if ((_ref3 = this.argumentsAgainstView) != null) _ref3.close();
      if ((_ref4 = this.answersView) != null) _ref4.close();
      if ((_ref5 = this.subdebatesView) != null) _ref5.close();
      $(this.el).html('');
      this.status = "closed";
      return this.unbind();
    };

    ShowView.prototype.hide = function() {
      var _ref;
      if ((_ref = this.childView) != null) _ref.hide();
      $(this.el).hide();
      return this.status = "hidden";
    };

    ShowView.prototype.show = function() {
      return $(this.el).show(200);
    };

    ShowView.prototype.focus = function() {
      var _ref, _ref2;
      if (this.isOffScreen) this.onScreen();
      if ((_ref = this.childView) != null) _ref.hide();
      return (_ref2 = this.parentView) != null ? _ref2.minimize() : void 0;
    };

    ShowView.prototype.offScreen = function() {
      var childPos, height;
      if (!this.isOffScreen) {
        height = $(this.el).height() - this.$('> .canvas-title').height();
        childPos = $(this.childView.el).offset();
        $(this.childView.el).offset({
          left: childPos.left,
          top: childPos.top - height
        });
        return this.isOffScreen = true;
      }
    };

    ShowView.prototype.onScreen = function() {
      var childPos, height;
      if (this.isOffScreen) {
        height = $(this.el).height() - this.$('> .canvas-title').height();
        childPos = $(this.childView.el).offset();
        $(this.childView.el).offset({
          left: childPos.left,
          top: childPos.top + height
        });
        return this.isOffScreen = false;
      }
    };

    return ShowView;

  })(Backbone.View);

  (_base13 = Gruff.Views).Debates || (_base13.Debates = {});

  Gruff.Views.Debates.SimpleNewView = (function(_super) {

    __extends(SimpleNewView, _super);

    function SimpleNewView() {
      SimpleNewView.__super__.constructor.apply(this, arguments);
    }

    SimpleNewView.prototype.initialize = function(options) {
      SimpleNewView.__super__.initialize.call(this, options);
      this.parentView = options.parentView;
      this.model.set({
        type: this.model.DebateTypes.DIALECTIC
      });
      return this.template = _.template($('#debate-simple-new-template').text());
    };

    SimpleNewView.prototype.save = function(e) {
      return SimpleNewView.__super__.save.call(this, e);
    };

    SimpleNewView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      json.attributeType = this.attributeType;
      $(this.el).append(this.template(json));
      Backbone.ModelBinding.bind(this);
      this.formEl = $(this.el).find('> #simple-new-debate');
      this.titleEl = $(this.formEl).find('> #title');
      this.formEl.bind("submit", this.save);
      this.formEl.bind("blur", this.close);
      this.titleEl.focus();
      return this;
    };

    SimpleNewView.prototype.close = function() {
      $(this.formEl).remove();
      this.parentView.linkEl.show();
      this.unbind();
      return Backbone.ModelBinding.unbind(this);
    };

    return SimpleNewView;

  })(Gruff.Views.Debates.NewView);

  (_base14 = Gruff.Views).Debates || (_base14.Debates = {});

  Gruff.Views.Debates.SubdebateView = (function(_super) {

    __extends(SubdebateView, _super);

    function SubdebateView() {
      this.lower = __bind(this.lower, this);
      this.raise = __bind(this.raise, this);
      this.close = __bind(this.close, this);
      this.cloneLink = __bind(this.cloneLink, this);
      this.handleKeys = __bind(this.handleKeys, this);
      SubdebateView.__super__.constructor.apply(this, arguments);
    }

    SubdebateView.prototype.initialize = function(options) {
      SubdebateView.__super__.initialize.call(this, options);
      return this.parentView = options.parentView;
    };

    SubdebateView.prototype.render = function() {
      var _this = this;
      this.model.bind("fetched-subdebates", function() {
        var offset;
        $(_this.el).show();
        _this.linkDiv = $(_this.el).parents('.debate-list-item')[0];
        offset = $(_this.linkDiv).offset();
        offset.top = offset.top + $(_this.linkDiv).height();
        offset.left = $(window).width() / 10;
        $(_this.el).css('position', 'absolute');
        $(_this.el).offset(offset);
        $(_this.el).width($(window).width() * .8);
        _this.enableKeys();
        _this.addModal();
        return _this.raise();
      });
      SubdebateView.__super__.render.apply(this, arguments);
      return this;
    };

    SubdebateView.prototype.enableKeys = function() {
      return $(document).bind('keydown', this.handleKeys);
    };

    SubdebateView.prototype.handleKeys = function(e) {
      if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    SubdebateView.prototype.addModal = function() {
      $(this.el).parents('.debates-list').first().append('<div class="modal-bg"></div>');
      this.modal = $(this.el).parents('.debates-list').first().find('.modal-bg');
      this.modal.width($(document).width());
      this.modal.height($(document).height());
      return this.modal.offset({
        top: 0,
        left: 0
      });
    };

    SubdebateView.prototype.cloneLink = function() {
      var h4;
      h4 = this.el.siblings('h4');
      this.cloneEl = h4.clone(true);
      this.cloneEl.css('position', 'absolute');
      this.cloneEl.offset(h4.find('a.title-link').offset());
      this.cloneEl.css('z-index', this.el.css('z-index'));
      this.cloneEl.css('margin', 0);
      this.cloneEl.css('padding', 0);
      return this.el.parent().append(this.cloneEl);
    };

    SubdebateView.prototype.close = function() {
      var _ref;
      $(document).unbind('keydown');
      this.model.unbind("fetched-subdebates");
      if ((_ref = this.modal) != null) _ref.remove();
      this.parentView.modalView = null;
      this.parentView.enableDragDrop();
      this.lower();
      $(this.el).html("");
      $(this.el).hide();
      return this.unbind();
    };

    SubdebateView.prototype.raise = function() {
      var _this = this;
      _.each($(this.el).parents('.debate-list-item'), function(parent) {
        var zindex;
        zindex = $(parent).css('z-index');
        if (zindex === 'auto') {
          zindex = 10;
        } else {
          zindex = parseInt(zindex);
        }
        $(parent).css('z-index', zindex + 5);
        $(_this.el).css('z-index', zindex + 5);
        return $(_this.modal).css('z-index', zindex + 4);
      });
      return this.cloneLink();
    };

    SubdebateView.prototype.lower = function() {
      var _this = this;
      _.each($(this.el).parents('.debate-list-item'), function(parent) {
        var zindex;
        zindex = parseInt($(parent).css('z-index'));
        $(parent).css('z-index', zindex - 5);
        return $(_this.el).css('z-index', zindex - 5);
      });
      return this.cloneEl.remove();
    };

    return SubdebateView;

  })(Gruff.Views.Debates.ShowView);

  (_base15 = Gruff.Views).Login || (_base15.Login = {});

  Gruff.Views.Login.LoginView = (function(_super) {

    __extends(LoginView, _super);

    function LoginView() {
      this.submit = __bind(this.submit, this);
      LoginView.__super__.constructor.apply(this, arguments);
    }

    LoginView.prototype.initialize = function(options) {
      var _this = this;
      LoginView.__super__.initialize.call(this, options);
      this.template = _.template($('#login-template').text());
      this.model = new Gruff.Models.Login;
      return this.model.bind("change:errors", function() {
        return _this.render();
      });
    };

    LoginView.prototype.render = function() {
      var json;
      LoginView.__super__.render.apply(this, arguments);
      json = this.model.toJSON();
      $(this.el).append(this.template(json));
      Backbone.ModelBinding.bind(this);
      this.center();
      $('#login-form').bind('submit', this.submit);
      $('#login-cancel').bind('click', this.cancel);
      $(this.el).find('#login').focus();
      return this;
    };

    LoginView.prototype.submit = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function() {
          return _this.close();
        },
        error: function(data, jqXHR) {
          if (jqXHR.responseText.indexOf('Login failed') > 0) {
            return alert("Login failed. Please try again.");
          } else {
            return _this.close();
          }
        }
      });
    };

    return LoginView;

  })(Gruff.Views.ModalView);

  _.extend(Backbone.View.prototype, {
    moveDebate: function(dragged, target, view) {
      var debate, newCollection, oldCollection, targetDebate, targetDebateId, targetParent, _ref,
        _this = this;
      targetParent = $(target).parents('.debate-list-item, .debate')[0];
      targetDebateId = targetParent.id;
      targetDebate = this.model.findDebate(targetDebateId);
      newCollection = targetDebate.getCollectionByName(target.attr('class'));
      if (newCollection == null) {
        newCollection = targetDebate.getCollectionByName(targetParent.className);
      }
      if (dragged.id === ((_ref = newCollection.parent) != null ? _ref.id : void 0)) {
        alert("Error: the page is attempting to assign the debate to its own sublist!");
        return false;
      }
      debate = this.model.findDebate(dragged.id);
      oldCollection = debate.parentCollection;
      oldCollection.remove(debate);
      newCollection.add(debate);
      debate.parent = newCollection.parent;
      return oldCollection.parent.save(null, {
        wait: true,
        error: function(debate, jqXHR) {
          return _this.handleRemoteError(jqXHR);
        },
        success: function() {
          if (oldCollection.parent !== newCollection.parent) {
            return debate.save(null, {
              wait: true,
              error: function(debate, jqXHR) {
                return _this.handleRemoteError(jqXHR);
              },
              success: function() {
                return newCollection.parent.save(null, {
                  wait: true,
                  error: function(debate, jqXHR) {
                    return _this.handleRemoteError(jqXHR);
                  }
                });
              }
            });
          }
        }
      });
    },
    isDragging: function() {
      return $('.ui-draggable-dragging').length > 0;
    },
    handleRemoteError: function(jqXHR, data) {
      var message, _ref;
      message = $.parseJSON(jqXHR.responseText);
      if (((_ref = message[0]) != null ? _ref.message : void 0) != null) {
        message = message[0].message;
      }
      if (jqXHR.status === 401) {
        alert(message);
        return this.showLoginForm();
      } else {
        alert(message);
        return this.model.set({
          errors: $.parseJSON(jqXHR.responseText)
        });
      }
    },
    showLoginForm: function() {
      var form;
      form = new Gruff.Views.Login.LoginView;
      return form.render();
    }
  });

}).call(this);
