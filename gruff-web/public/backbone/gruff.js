(function() {
  var classHelper, _base, _base2, _base3, _base4, _base5, _base6, _base7,
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

  Gruff.Views.Debates.ListItemView = (function(_super) {

    __extends(ListItemView, _super);

    function ListItemView() {
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
      e.stopPropagation();
      this.$('div.body').toggle();
      return false;
    };

    return ListItemView;

  })(Backbone.View);

  (_base5 = Gruff.Views).Debates || (_base5.Debates = {});

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

  (_base6 = Gruff.Views).Debates || (_base6.Debates = {});

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
          _this.close();
          return alert(JSON.stringify(debate.fullJSON()));
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

  (_base7 = Gruff.Views).Debates || (_base7.Debates = {});

  Gruff.Views.Debates.ShowView = (function(_super) {

    __extends(ShowView, _super);

    function ShowView() {
      this.moveDebate = __bind(this.moveDebate, this);
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-show-template').text());
      return this.tags_template = _.template($('#tags-index-template').text());
    };

    ShowView.prototype.events = {
      "click .new-debate-link": "showNewDebateForm"
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
        drop: function(event, ui) {
          var dragged;
          dragged = ui.draggable[0];
          return _this.moveDebate(dragged, event.target);
        }
      });
    };

    ShowView.prototype.moveDebate = function(dragged, dropped) {
      var debate, droppedDebate, droppedDebateId, droppedParent, newCollection, oldCollection;
      droppedParent = $(dropped).parents('.debate')[0];
      droppedDebateId = droppedParent.id;
      droppedDebate = this.model.findDebate(droppedDebateId);
      newCollection = droppedDebate.getCollectionByName(dropped.className);
      debate = this.model.findDebate(dragged.id);
      oldCollection = debate.parentCollection;
      oldCollection.remove(debate);
      newCollection.add(debate);
      debate.save();
      oldCollection.parent.save();
      if (oldCollection.parent !== newCollection.parent) {
        return newCollection.parent.save();
      }
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
