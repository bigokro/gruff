(function() {
  var classHelper, _base, _base10, _base2, _base3, _base4, _base5, _base6, _base7, _base8, _base9,
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
      return this.parentCollection = options.parentCollection;
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
      debates.parent = this;
      debates.type = type;
      debates.bind("add", this.makeAddToCollectionEvent(debates));
      debates.bind("remove", this.makeRemoveFromCollectionEvent(debates));
      return debates;
    };

    Debate.prototype.findDebate = function(id) {
      var result;
      if (this.linkableId() === id) return this;
      result = null;
      _.each([this.answers, this.argumentsFor, this.argumentsAgainst, this.subdebates], function(coll) {
        if (coll !== null && result === null) {
          return coll.each(function(debate) {
            if (result === null) return result = debate.findDebate(id);
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
      this.model = new Gruff.Models.Debate({
        "_id": options.id
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

  Gruff.Views.Debates.EditDescriptionView = (function(_super) {

    __extends(EditDescriptionView, _super);

    function EditDescriptionView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.close = __bind(this.close, this);
      EditDescriptionView.__super__.constructor.apply(this, arguments);
    }

    EditDescriptionView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#debate-edit-description-template').text());
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
          _this.descriptionEl.html(newDescription);
          return _this.close();
        },
        error: function(debate, jqXHR) {
          _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
          return alert(jqXHR.responseText);
        }
      });
    };

    EditDescriptionView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      if (!$(this.el).hasClass('.debate-list-item')) {
        this.el = $(this.el).parents('.debate-list-item')[0];
      }
      $(this.el).append(this.template(json));
      this.descriptionEl = $(this.el).find('.body');
      this.descriptionEl.hide();
      this.editDescriptionField = $(this.el).find('#' + this.model.linkableId() + "-description-field");
      this.editDescriptionField.bind("keypress", this.handleKeys);
      this.editDescriptionField.bind("blur", this.close);
      this.editDescriptionField.show();
      this.editDescriptionField.focus();
      return this;
    };

    EditDescriptionView.prototype.close = function() {
      this.descriptionEl.show();
      this.editDescriptionField.remove();
      return this.unbind();
    };

    EditDescriptionView.prototype.handleKeys = function(e) {
      if (e.keyCode === 13) {
        this.save();
        return false;
      } else {
        return true;
      }
    };

    return EditDescriptionView;

  })(Backbone.View);

  (_base3 = Gruff.Views).Debates || (_base3.Debates = {});

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
          _this.titleLink.html(newTitle);
          return _this.close();
        },
        error: function(debate, jqXHR) {
          _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
          return alert(jqXHR.responseText);
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
      this.titleLink = $(this.el).find('a');
      this.titleLink.hide();
      this.editTitleField = $(this.el).find('#' + this.model.linkableId() + "-title-field");
      this.editTitleField.bind("keypress", this.handleKeys);
      this.editTitleField.bind("blur", this.close);
      this.editTitleField.show();
      this.editTitleField.focus();
      return this;
    };

    EditTitleView.prototype.close = function() {
      this.titleLink.show();
      this.editTitleField.remove();
      return this.unbind();
    };

    EditTitleView.prototype.handleKeys = function(e) {
      if (e.keyCode === 13) {
        this.save();
        return false;
      } else {
        return true;
      }
    };

    return EditTitleView;

  })(Backbone.View);

  (_base4 = Gruff.Views).Debates || (_base4.Debates = {});

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

  (_base5 = Gruff.Views).Debates || (_base5.Debates = {});

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

  (_base6 = Gruff.Views).Debates || (_base6.Debates = {});

  Gruff.Views.Debates.ListItemView = (function(_super) {

    __extends(ListItemView, _super);

    function ListItemView() {
      this.showSubdebates = __bind(this.showSubdebates, this);
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      this.toggleDescription = __bind(this.toggleDescription, this);
      ListItemView.__super__.constructor.apply(this, arguments);
    }

    ListItemView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-list-item-template').text());
      this.parentEl = options.parentEl;
      return this.attributeType = options.attributeType;
    };

    ListItemView.prototype.events = {
      "click .title a": "toggleDescription"
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
      this.el = $('#' + this.model.linkableId());
      this.$("h4.title a").bind("click", this.toggleDescription);
      return this;
    };

    ListItemView.prototype.toggleDescription = function(e) {
      var parent;
      e.stopPropagation();
      parent = $(e.target).parents('.debate-list-item')[0];
      if (!$(parent).hasClass('ui-draggable-dragging')) {
        this.$('div.body').toggle();
      }
      return false;
    };

    ListItemView.prototype.enableDragDrop = function() {
      var _this = this;
      return $(this.el).droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        hoverClass: 'over',
        greedy: true,
        over: function(e) {
          return _this.showSubdebates();
        },
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          return _this.moveDebate(dragged, event.target);
        }
      });
    };

    ListItemView.prototype.showSubdebates = function() {
      var subdebatesView;
      subdebatesView = new Gruff.Views.Debates.SubdebatesView({
        'el': this.el,
        'model': this.model
      });
      return subdebatesView.render();
    };

    return ListItemView;

  })(Backbone.View);

  (_base7 = Gruff.Views).Debates || (_base7.Debates = {});

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
      return this.collection.bind('remove', this.remove);
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
      return this.views.each(function(view) {
        view.remove();
        return view.unbind();
      });
    };

    ListView.prototype.add = function(debate) {
      var itemView;
      debate.parentCollection = this.collection;
      itemView = new Gruff.Views.Debates.ListItemView({
        'parentEl': this.el,
        'model': debate,
        'attributeType': this.attributeType
      });
      this.views.push(itemView);
      return itemView.render();
    };

    ListView.prototype.remove = function(debate) {
      var viewToRemove,
        _this = this;
      viewToRemove = _.select(this.views, function(view) {
        return view.model === debate;
      })[0];
      this.views = _.without(this.views, viewToRemove);
      return $(viewToRemove.el).remove();
    };

    return ListView;

  })(Backbone.View);

  (_base8 = Gruff.Views).Debates || (_base8.Debates = {});

  Gruff.Views.Debates.NewView = (function(_super) {

    __extends(NewView, _super);

    function NewView() {
      NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#debate-new-template').text());
      this.attributeType = options.attributeType;
      this.collection = options.collection;
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
          _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
          return alert(jqXHR.responseText);
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

  (_base9 = Gruff.Views).Debates || (_base9.Debates = {});

  Gruff.Views.Debates.ShowView = (function(_super) {

    __extends(ShowView, _super);

    function ShowView() {
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-show-template').text());
      return this.tags_template = _.template($('#tags-index-template').text());
    };

    ShowView.prototype.events = {
      "click .new-debate-link": "showNewDebateForm",
      "dblclick .debate-list-item .title": "showEditTitleForm",
      "dblclick .debate-list-item .body": "showEditDescriptionForm"
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
                      json.loggedIn = true;
                      $(_this.el).html(_this.template(json));
                      json.objecttype = "debates";
                      json.objectid = json.linkableId;
                      json.attributetype = "";
                      json.attributeid = "";
                      json.baseurl = (_ref = json.attributetype !== "") != null ? _ref : "/" + json.objecttype + "/" + json.objectid + {
                        "/tag/": "/" + json.objecttype + "/" + json.objectid + "/" + json.attributetype + "/" + json.attributeid + "/tag/"
                      };
                      $(_this.el).find('.tags').html(_this.tags_template(json));
                      if (_this.model.get("type") === _this.model.DebateTypes.DEBATE) {
                        _this.answersView = new Gruff.Views.Debates.ListView({
                          'el': $(_this.el).find('.answers .debates-list'),
                          'collection': answers,
                          'attributeType': 'answers'
                        });
                        _this.answersView.render();
                      }
                      if (_this.model.get("type") === _this.model.DebateTypes.DIALECTIC) {
                        _this.argumentsForView = new Gruff.Views.Debates.ListView({
                          'el': $(_this.el).find('.arguments .for .debates-list'),
                          'collection': argumentsFor,
                          'attributeType': 'argumentsFor'
                        });
                        _this.argumentsForView.render();
                        _this.argumentsAgainstView = new Gruff.Views.Debates.ListView({
                          'el': $(_this.el).find('.arguments .against .debates-list'),
                          'collection': argumentsAgainst,
                          'attributeType': 'argumentsAgainst'
                        });
                        _this.argumentsAgainstView.render();
                      }
                      _this.subdebatesView = new Gruff.Views.Debates.ListView({
                        'el': $(_this.el).find('.subdebates .debates-list'),
                        'collection': subdebates,
                        'attributeType': 'subdebates'
                      });
                      _this.subdebatesView.render();
                      return _this.enableDragDrop();
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
      $(e.target).hide();
      formDiv = $('#new-' + debateType + '-div');
      formDiv.show();
      formView = new Gruff.Views.Debates.NewView({
        'el': formDiv,
        'collection': collection,
        'attributeType': debateType
      });
      return formView.render();
    };

    ShowView.prototype.enableDragDrop = function() {
      var _this = this;
      $(".argument").draggable({
        revert: true
      });
      $(".answer").draggable({
        revert: true
      });
      $(".subdebate").draggable({
        revert: true
      });
      $(".argument").width(function(index, width) {
        var el;
        el = $("#" + this.id);
        return el.find("h4 > a").width();
      });
      $(".for, .against, .subdebates, .answers").droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          $(event.target).removeClass('over');
          if ($(event.target).has(dragged).length === 0) {
            return _this.moveDebate(dragged, event.target);
          }
        },
        over: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          if ($(event.target).has(dragged).length === 0) {
            return $(event.target).addClass('over');
          }
        },
        out: function(event, ui) {
          return $(event.target).removeClass('over');
        }
      });
      return $(".argument, .subdebate, .answer").droppable({
        accept: '.subdebate, .argument, .debate, .answer',
        hoverClass: 'over',
        greedy: true,
        over: function(e, ui) {
          return _this.timeout = setTimeout(function() {
            return _this.showSubdebatesDiv(e);
          }, 2000);
        },
        out: function(e, ui) {
          return clearTimeout(_this.timeout);
        }
      });
    };

    ShowView.prototype.showEditTitleForm = function(e) {
      var clickedDebate, clickedDebateId, editTitleView;
      clickedDebateId = $(e.target).parents('.debate-list-item')[0].id;
      clickedDebate = this.model.findDebate(clickedDebateId);
      editTitleView = new Gruff.Views.Debates.EditTitleView({
        'el': e.target,
        'model': clickedDebate
      });
      return editTitleView.render();
    };

    ShowView.prototype.showEditDescriptionForm = function(e) {
      var clickedDebate, clickedDebateId, editDescriptionView;
      clickedDebateId = $(e.target).parents('.debate-list-item')[0].id;
      clickedDebate = this.model.findDebate(clickedDebateId);
      editDescriptionView = new Gruff.Views.Debates.EditDescriptionView({
        'el': e.target,
        'model': clickedDebate
      });
      return editDescriptionView.render();
    };

    ShowView.prototype.showSubdebatesDiv = function(e) {
      var overDebate, subdebatesView;
      overDebate = this.model.findDebate(e.target.id);
      subdebatesView = new Gruff.Views.Debates.SubdebatesView({
        'el': e.target,
        'model': overDebate
      });
      return subdebatesView.render();
    };

    return ShowView;

  })(Backbone.View);

  (_base10 = Gruff.Views).Debates || (_base10.Debates = {});

  Gruff.Views.Debates.SubdebatesView = (function(_super) {

    __extends(SubdebatesView, _super);

    function SubdebatesView() {
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      SubdebatesView.__super__.constructor.apply(this, arguments);
    }

    SubdebatesView.prototype.initialize = function(options) {
      return this.template = _.template($('#debate-subdebates-template').text());
    };

    SubdebatesView.prototype.render = function() {
      var json, newZIndex, offset;
      json = this.model.fullJSON();
      $(this.el).append(this.template(json));
      this.subdebatesDiv = $(this.el).find('.debate-list-item-subdebates');
      offset = $(this.el).offset();
      offset.top = offset.top + 20;
      offset.left = $(window).width() / 10;
      $(this.subdebatesDiv).offset(offset);
      $(this.subdebatesDiv).width($(window).width() * .8);
      newZIndex = 5;
      if ($(this.el).css('z-index') !== 'auto') {
        newZIndex = parseInt($(this.el).css('z-index')) + 5;
      }
      $(this.subdebatesDiv).css('z-index', newZIndex);
      this.enableDragDrop();
      $('.modal-bg').show();
      $('.modal-bg').css('z-index', newZIndex - 1);
      $('.modal-bg').width($(document).width());
      $('.modal-bg').height($(document).height());
      $('.modal-bg').offset({
        top: 0,
        left: 0
      });
      return this;
    };

    SubdebatesView.prototype.enableDragDrop = function() {
      var _this = this;
      return $(this.el).find(".for, .against, .subdebates, .answers").droppable({
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          $(event.target).removeClass('over');
          if ($(event.target).has(dragged).length === 0) {
            return _this.moveDebate(dragged, event.target);
          }
        },
        over: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          if ($(event.target).has(dragged).length === 0) {
            return $(event.target).addClass('over');
          }
        },
        out: function(event, ui) {
          return $(event.target).removeClass('over');
        }
      });
    };

    return SubdebatesView;

  })(Backbone.View);

  _.extend(Backbone.View.prototype, {
    moveDebate: function(dragged, dropped, view) {
      var debate, droppedDebate, droppedDebateId, droppedParent, newCollection, oldCollection,
        _this = this;
      droppedParent = $(dropped).parents('.debate')[0];
      droppedDebateId = droppedParent.id;
      droppedDebate = this.model.findDebate(droppedDebateId);
      newCollection = droppedDebate.getCollectionByName(dropped.className);
      debate = this.model.findDebate(dragged.id);
      oldCollection = debate.parentCollection;
      oldCollection.remove(debate);
      newCollection.add(debate);
      oldCollection.parent.save({
        error: function(debate, jqXHR) {
          _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
          return alert(jqXHR.responseText);
        }
      });
      if (oldCollection.parent !== newCollection.parent) {
        debate.save({
          error: function(debate, jqXHR) {
            _this.model.set({
              errors: $.parseJSON(jqXHR.responseText)
            });
            return alert(jqXHR.responseText);
          }
        });
        return newCollection.parent.save({
          error: function(debate, jqXHR) {
            _this.model.set({
              errors: $.parseJSON(jqXHR.responseText)
            });
            return alert(jqXHR.responseText);
          }
        });
      }
    }
  });

}).call(this);
