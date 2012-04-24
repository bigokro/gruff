(function() {
  var classHelper, _base, _base10, _base11, _base12, _base13, _base14, _base15, _base16, _base17, _base18, _base19, _base2, _base20, _base21, _base22, _base23, _base24, _base25, _base26, _base27, _base28, _base29, _base3, _base4, _base5, _base6, _base7, _base8, _base9,
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

  (_base = Gruff.Models).Comments || (_base.Comments = {});

  Gruff.Models.Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment() {
      this.cancelVote = __bind(this.cancelVote, this);
      this.voteDown = __bind(this.voteDown, this);
      this.voteUp = __bind(this.voteUp, this);
      Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.prototype.paramRoot = '';

    Comment.prototype.defaults = {
      user: null,
      date: null,
      comment: null
    };

    Comment.prototype.initialize = function(options) {
      var _ref;
      this.debate = options.debate || ((_ref = this.collection) != null ? _ref.parent : void 0);
      this.updateUrl();
      return this.bind("change", this.updateUrl);
    };

    Comment.prototype.updateUrl = function(e) {
      var _ref;
      return this.url = "/rest/debates/" + ((_ref = this.debate) != null ? _ref.id : void 0) + "/comments";
    };

    Comment.prototype.save = function() {
      this.updateUrl();
      return Comment.__super__.save.apply(this, arguments);
    };

    Comment.prototype.voteUp = function(options) {
      return $.ajax({
        type: "POST",
        url: "/rest/debates/" + this.debate.id + "/comments/" + this.id + "/vote/up",
        success: options.success,
        error: options.error
      });
    };

    Comment.prototype.voteDown = function(options) {
      return $.ajax({
        type: "POST",
        url: "/rest/debates/" + this.debate.id + "/comments/" + this.id + "/vote/down",
        success: options.success,
        error: options.error
      });
    };

    Comment.prototype.cancelVote = function(options) {
      return $.ajax({
        type: "DELETE",
        url: "/rest/debates/" + this.debate.id + "/comments/" + this.id + "/vote",
        success: options.success,
        error: options.error
      });
    };

    Comment.prototype.fullJSON = function() {
      var json;
      json = this.toJSON();
      json.curruser = Gruff.User.fullJSON();
      json.score = this.score();
      return json;
    };

    return Comment;

  })(Backbone.Model);

  Gruff.Collections.Comments = (function(_super) {

    __extends(Comments, _super);

    function Comments() {
      Comments.__super__.constructor.apply(this, arguments);
    }

    Comments.prototype.model = Gruff.Models.Comment;

    Comments.prototype.initialize = function(options) {
      var _ref;
      this.parent = options.parent;
      return this.url = "/rest/debates/" + ((_ref = this.parent) != null ? _ref.id : void 0) + "/comments";
    };

    return Comments;

  })(Backbone.Collection);

  classHelper = new exports.ClassHelper();

  classHelper.augmentClass(Gruff.Models.Comment, exports.Comment);

  (_base2 = Gruff.Models).Debates || (_base2.Debates = {});

  Gruff.Models.Debate = (function(_super) {

    __extends(Debate, _super);

    function Debate() {
      this.updateUrl = __bind(this.updateUrl, this);
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
      json.attributeType = this.get("attributeType");
      json.DebateTypes = this.DebateTypes;
      json.curruser = Gruff.User.fullJSON();
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

    Debate.prototype.updateUrl = function(e) {
      return this.url = "/rest/debates/" + this.id;
    };

    return Debate;

  })(Backbone.Model);

  Gruff.Collections.Debates = (function(_super) {

    __extends(Debates, _super);

    function Debates() {
      this.add = __bind(this.add, this);
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

    Debates.prototype.add = function(debate) {
      if (debate.length == null) {
        debate.set({
          attributeType: this.type
        });
        debate.updateUrl();
      }
      return Debates.__super__.add.call(this, debate);
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

  (_base3 = Gruff.Models).References || (_base3.References = {});

  Gruff.Models.Reference = (function(_super) {

    __extends(Reference, _super);

    function Reference() {
      Reference.__super__.constructor.apply(this, arguments);
    }

    Reference.prototype.paramRoot = 'reference';

    Reference.prototype.urlRoot = '/rest/references';

    Reference.prototype.idAttribute = "_id";

    Reference.prototype.defaults = {
      title: null,
      description: null
    };

    Reference.prototype.initialize = function(options) {
      this.collection = options.collection;
      this.updateGlobalHash();
      return this.bind('change', this.updateGlobalHash);
    };

    Reference.prototype.fullJSON = function() {
      var json;
      json = this.toJSON();
      json.bestTitle = this.bestTitleText();
      if (json.bestTitle == null) json.bestTitle = "(no title)";
      json.bestDescription = this.bestDescriptionText();
      json.linkableId = this.linkableId();
      json.curruser = Gruff.User.fullJSON();
      return json;
    };

    Reference.prototype.updateGlobalHash = function() {
      return Gruff.Models.References[this.linkableId()] = this;
    };

    Reference.prototype.findReference = function(id) {
      return Gruff.Models.References[id];
    };

    return Reference;

  })(Backbone.Model);

  Gruff.Collections.References = (function(_super) {

    __extends(References, _super);

    function References() {
      this.updateUrl = __bind(this.updateUrl, this);
      References.__super__.constructor.apply(this, arguments);
    }

    References.prototype.model = Gruff.Models.Reference;

    References.prototype.url = '/rest/references';

    References.prototype.fullJSON = function() {
      var json,
        _this = this;
      json = [];
      this.each(function(reference) {
        return json.push(reference.fullJSON());
      });
      return json;
    };

    References.prototype.setParent = function(parent) {
      this.parent = parent;
      this.updateUrl();
      return this.parent.bind("change", this.updateUrl);
    };

    References.prototype.updateUrl = function(e) {
      return this.url = "/rest/debates/" + this.parent.id + "/references";
    };

    return References;

  })(Backbone.Collection);

  classHelper = new exports.ClassHelper();

  classHelper.augmentClass(Gruff.Models.Reference, exports.Reference);

  (_base4 = Gruff.Models).Tags || (_base4.Tags = {});

  Gruff.Models.Tag = (function(_super) {

    __extends(Tag, _super);

    function Tag() {
      Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.prototype.paramRoot = '';

    Tag.prototype.idAttribute = "name";

    Tag.prototype.defaults = {
      name: null
    };

    Tag.prototype.initialize = function(options) {
      this.updateUrl();
      return this.bind("change", this.updateUrl);
    };

    Tag.prototype.updateUrl = function(e) {
      var _ref, _ref2;
      return this.url = "/rest/debates/" + ((_ref = this.collection) != null ? (_ref2 = _ref.parent) != null ? _ref2.id : void 0 : void 0) + "/tag/" + this.get("name");
    };

    Tag.prototype.save = function() {
      this.updateUrl();
      return Tag.__super__.save.apply(this, arguments);
    };

    Tag.prototype.fullJSON = function() {
      var json;
      json = this.toJSON();
      json.curruser = Gruff.User.fullJSON();
      return json;
    };

    return Tag;

  })(Backbone.Model);

  Gruff.Collections.Tags = (function(_super) {

    __extends(Tags, _super);

    function Tags() {
      Tags.__super__.constructor.apply(this, arguments);
    }

    Tags.prototype.model = Gruff.Models.Tag;

    Tags.prototype.initialize = function(options) {
      var _ref;
      this.parent = options.parent;
      return this.url = "/rest/debates/" + ((_ref = this.parent) != null ? _ref.id : void 0) + "/tags";
    };

    Tags.prototype.resetFromArray = function(arr) {
      var tagArr;
      tagArr = [];
      _.each(arr, function(tag) {
        return tagArr.push({
          name: tag
        });
      });
      return this.reset(tagArr);
    };

    return Tags;

  })(Backbone.Collection);

  (_base5 = Gruff.Models).Users || (_base5.Users = {});

  Gruff.Models.User = (function(_super) {

    __extends(User, _super);

    function User() {
      this.isLogged = __bind(this.isLogged, this);
      this.isCurator = __bind(this.isCurator, this);
      this.fullJSON = __bind(this.fullJSON, this);
      User.__super__.constructor.apply(this, arguments);
    }

    User.prototype.paramRoot = '';

    User.prototype.idAttribute = '_id';

    User.prototype.url = '/rest/user';

    User.prototype.initialize = function(options) {};

    User.prototype.fullJSON = function() {
      var json;
      json = this.toJSON();
      json.logged = this.isLogged();
      json.curator = this.isCurator();
      return json;
    };

    User.prototype.isCurator = function() {
      var login;
      login = this.get("login");
      return login === 'thigh' || login === 'biggusgruffus';
    };

    User.prototype.isLogged = function() {
      return this.id != null;
    };

    return User;

  })(Backbone.Model);

  Gruff.User = new Gruff.Models.User();

  Gruff.User.fetch();

  Gruff.Routers.DebatesRouter = (function(_super) {

    __extends(DebatesRouter, _super);

    function DebatesRouter() {
      DebatesRouter.__super__.constructor.apply(this, arguments);
    }

    DebatesRouter.prototype.routes = {
      "canvas/new": "newDebate",
      "canvas/index": "index",
      "canvas/:id/edit": "edit",
      "canvas/:id": "show",
      "canvas/.*": "index"
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
      var _this = this;
      this.model = new Gruff.Models.Debate({
        "_id": id
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

  (_base6 = Gruff.Views).Comments || (_base6.Comments = {});

  Gruff.Views.Comments.IndexView = (function(_super) {

    __extends(IndexView, _super);

    function IndexView() {
      this.remove = __bind(this.remove, this);
      this.add = __bind(this.add, this);
      this.close = __bind(this.close, this);
      this.hideForm = __bind(this.hideForm, this);
      this.showForm = __bind(this.showForm, this);
      IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.initialize = function(options) {
      this.template = _.template($('#comments-index-template').text());
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
      this.parentView = options.parentView;
      this.parentModel = this.collection.parent;
      return this.debate = options.debate;
    };

    IndexView.prototype.render = function() {
      var json,
        _this = this;
      json = {};
      json.id = this.parentModel.id;
      json.curruser = Gruff.User.fullJSON();
      $(this.el).html(this.template(json));
      this.showFormEl = this.$(".new-comment-link");
      this.listEl = this.$('.comments-list');
      this.formEl = $('#' + this.parentModel.id + '-new-comment-div');
      this.views = [];
      this.collection.each(function(comment) {
        return _this.add(comment);
      });
      this.initializeForm();
      this.setUpEvents();
      this.hideForm();
      return this;
    };

    IndexView.prototype.initializeForm = function() {
      this.model = new this.collection.model();
      this.model.collection = this.collection;
      return this.model.parent = this.parentModel;
    };

    IndexView.prototype.setUpEvents = function() {
      return this.showFormEl.bind('click', this.showForm);
    };

    IndexView.prototype.showForm = function() {
      this.showFormEl.hide();
      this.formEl.show();
      this.formView = new Gruff.Views.Comments.NewView({
        'el': this.formEl,
        'collection': this.collection,
        'debate': this.debate
      });
      this.formView.render();
      return false;
    };

    IndexView.prototype.hideForm = function() {
      var _ref;
      if ((_ref = this.formView) != null) _ref.close();
      this.showFormEl.show();
      return false;
    };

    IndexView.prototype.close = function() {
      _.each(this.views, function(view) {
        return view.close();
      });
      $(this.el).html('');
      return this.unbind();
    };

    IndexView.prototype.add = function(comment) {
      var commentView;
      comment.collection = this.collection;
      commentView = new Gruff.Views.Comments.ListItemView({
        'parentEl': this.listEl,
        'debate': this.debate,
        'model': comment,
        'parentView': this
      });
      this.views.push(commentView);
      return commentView.render();
    };

    IndexView.prototype.remove = function(comment) {
      var viewToRemove,
        _this = this;
      viewToRemove = _.select(this.views, function(view) {
        var _ref;
        return ((_ref = view.model) != null ? _ref.name : void 0) === comment.name;
      })[0];
      this.views = _.without(this.views, viewToRemove);
      return viewToRemove.close();
    };

    return IndexView;

  })(Backbone.View);

  (_base7 = Gruff.Views).Comments || (_base7.Comments = {});

  Gruff.Views.Comments.ListItemView = (function(_super) {

    __extends(ListItemView, _super);

    function ListItemView() {
      this.updateScore = __bind(this.updateScore, this);
      this.voteDown = __bind(this.voteDown, this);
      this.voteUp = __bind(this.voteUp, this);
      this.close = __bind(this.close, this);
      this.removeComment = __bind(this.removeComment, this);
      this.textIndex = __bind(this.textIndex, this);
      this.reindex = __bind(this.reindex, this);
      this.mergeSegments = __bind(this.mergeSegments, this);
      this.addNewSegment = __bind(this.addNewSegment, this);
      this.hideDelete = __bind(this.hideDelete, this);
      this.showDelete = __bind(this.showDelete, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      ListItemView.__super__.constructor.apply(this, arguments);
    }

    ListItemView.prototype.initialize = function(options) {
      var _ref;
      this.template = _.template($('#comments-list-item-template').text());
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      this.parentModel = options.parentModel;
      this.parentModel || (this.parentModel = (_ref = this.parentView) != null ? _ref.parentModel : void 0);
      return this.debate = options.debate;
    };

    ListItemView.prototype.render = function() {
      var json,
        _this = this;
      if (!this.model.id) {
        this.model.set({
          id: this.model.nextId()
        });
      }
      json = this.model.fullJSON();
      $(this.parentEl).append(this.template(json));
      this.el = $(this.parentEl).find('#' + this.model.id + '-comment');
      this.bodyEl = this.$('> .comment');
      this.deleteEl = this.$("> a.delete-comment");
      this.body = this.model.get("body");
      this.segmentViews = [];
      _.each(this.body, function(segment, index) {
        return _this.addNewSegment(segment, index);
      });
      this.setUpEvents();
      return this;
    };

    ListItemView.prototype.setUpEvents = function() {
      this.deleteEl.bind("click", this.removeComment);
      this.$('.vote-up a').bind('click', this.voteUp);
      this.$('.vote-down a').bind('click', this.voteDown);
      return this.$('.cancel-vote a').bind('click', this.cancelVote);
    };

    ListItemView.prototype.showDelete = function() {
      return this.deleteEl.show();
    };

    ListItemView.prototype.hideDelete = function() {
      return this.deleteEl.hide();
    };

    ListItemView.prototype.addNewSegment = function(segment, index) {
      var segmentView;
      segmentView = new Gruff.Views.Comments.SegmentView({
        'parentEl': this.bodyEl,
        'model': this.model,
        'segment': segment,
        'parentView': this,
        'index': index,
        'debate': this.debate
      });
      segmentView.render();
      if (index === this.segmentViews.length) {
        this.segmentViews.push(segmentView);
      } else {
        this.segmentViews = _.first(this.segmentViews, index - 1).concat(segmentView).concat(_.rest(this.segmentViews, index));
      }
      return segmentView;
    };

    ListItemView.prototype.mergeSegments = function(index) {
      var first, second;
      first = this.segmentViews[index];
      second = this.segmentViews[index + 1];
      second.segment.text = first.segment.text + second.segment.text;
      second.segment.comments = first.segment.comments.concat(second.segment.comments);
      second.updateText();
      first.close();
      this.segmentViews = _.without(this.segmentViews, first);
      return this.reindex();
    };

    ListItemView.prototype.reindex = function() {
      var _this = this;
      return _.each(this.segmentViews, function(sv, index) {
        return sv.index = index;
      });
    };

    ListItemView.prototype.textIndex = function(index) {
      var idx, _i, _results,
        _this = this;
      idx = 0;
      _.each((function() {
        _results = [];
        for (var _i = 0; 0 <= index ? _i <= index : _i >= index; 0 <= index ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this), function(i) {
        return idx += _this.segmentViews[i].segment.text.length;
      });
      return idx;
    };

    ListItemView.prototype.removeComment = function() {
      var _this = this;
      return this.model.destroy({
        success: function(comment) {
          return _this.close();
        },
        error: function(comment, jqXHR) {
          return _this.handleRemoteError(jqXHR, comment);
        }
      });
    };

    ListItemView.prototype.close = function() {
      var _this = this;
      _.each(this.segmentViews, function(segmentView) {
        return segmentView.close();
      });
      this.el.remove();
      return this.unbind();
    };

    ListItemView.prototype.voteUp = function() {
      var _this = this;
      return this.model.voteUp({
        success: function(comment) {
          _this.model.set(comment);
          return _this.updateScore();
        },
        error: function(jqXHR, data) {
          return _this.handleRemoteError(jqXHR, data);
        }
      });
    };

    ListItemView.prototype.voteDown = function() {
      var _this = this;
      return this.model.voteDown({
        success: function(comment) {
          _this.model.set(comment);
          return _this.updateScore();
        },
        error: function(jqXHR, data) {
          return _this.handleRemoteError(jqXHR, data);
        }
      });
    };

    ListItemView.prototype.updateScore = function() {
      return this.$('> .info > .score').html(this.model.score());
    };

    return ListItemView;

  })(Backbone.View);

  (_base8 = Gruff.Views).Comments || (_base8.Comments = {});

  Gruff.Views.Comments.NewSubcommentView = (function(_super) {

    __extends(NewSubcommentView, _super);

    function NewSubcommentView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.close = __bind(this.close, this);
      this.cancel = __bind(this.cancel, this);
      this.save = __bind(this.save, this);
      this.cancelEvents = __bind(this.cancelEvents, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      this.render = __bind(this.render, this);
      NewSubcommentView.__super__.constructor.apply(this, arguments);
    }

    NewSubcommentView.prototype.initialize = function(options) {
      this.template = _.template($('#comment-new-subcomment-template').text());
      this.segment = options.segment;
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      return this.debate = options.debate;
    };

    NewSubcommentView.prototype.render = function() {
      var json;
      json = {};
      $(this.parentEl).append(this.template(json));
      this.el = $(this.parentEl).find('#new-subcomment-form');
      this.formEl = this.$('#subcomment');
      this.setUpEvents();
      this.formEl.focus();
      return this;
    };

    NewSubcommentView.prototype.setUpEvents = function() {
      $(document).bind("keydown", this.handleKeys);
      this.$("input[type='submit']:visible").bind('click', this.save);
      return this.$('.cancel_button:visible').bind('click', this.cancel);
    };

    NewSubcommentView.prototype.cancelEvents = function() {
      return $(document).unbind("keydown", this.handleKeys);
    };

    NewSubcommentView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      return $.ajax({
        type: "POST",
        url: "/rest/debates/" + this.debate.id + "/comments/" + this.model.id + "/" + this.parentView.textIndex(),
        data: {
          comment: this.formEl.val()
        },
        success: function(data) {
          var comment, commentView;
          _this.close();
          data.debate = _this.debate;
          comment = new Gruff.Models.Comment(data);
          commentView = new Gruff.Views.Comments.ListItemView({
            'parentEl': _this.parentView.el,
            'debate': _this.debate,
            'model': comment,
            'parentView': _this.parentView
          });
          return commentView.render();
        },
        error: function(jqXHR, data) {
          return _this.handleRemoteError(jqXHR, data);
        }
      });
    };

    NewSubcommentView.prototype.cancel = function() {
      this.close();
      return this.parentView.mergeBack();
    };

    NewSubcommentView.prototype.close = function() {
      $(this.el).remove();
      this.cancelEvents();
      return this.unbind();
    };

    NewSubcommentView.prototype.handleKeys = function(e) {
      if (e.keyCode === 27) {
        this.cancel();
        return false;
      } else {
        return true;
      }
    };

    return NewSubcommentView;

  })(Backbone.View);

  (_base9 = Gruff.Views).Comments || (_base9.Comments = {});

  Gruff.Views.Comments.NewView = (function(_super) {

    __extends(NewView, _super);

    function NewView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.save = __bind(this.save, this);
      NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#comment-new-template').text());
      this.model = new this.collection.model();
      this.model.collection = this.collection;
      this.model.debate = this.collection.parent;
      this.parentModel = this.collection.parent;
      return this.model.bind("change:errors", function() {
        return _this.render();
      });
    };

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.model.save(null, {
        success: function(comment) {
          _this.collection.add(_this.model);
          return _this.close();
        },
        error: function(comment, jqXHR) {
          return _this.handleRemoteError(jqXHR, comment);
        }
      });
    };

    NewView.prototype.render = function() {
      var json;
      json = this.model.toJSON();
      json.id = this.parentModel.id;
      $(this.el).html(this.template(json));
      $(this.el).show();
      Backbone.ModelBinding.bind(this);
      this.setUpEvents();
      $(this.el).parent().find('.new-comment-link').hide();
      this.$('#comment').focus();
      return this;
    };

    NewView.prototype.setUpEvents = function() {
      $(document).bind("keydown", this.handleKeys);
      this.$("input[type='submit']:visible").bind('click', this.save);
      return this.$('.cancel_button:visible').bind('click', this.close);
    };

    NewView.prototype.cancelEvents = function() {
      return $(document).unbind("keydown", this.handleKeys);
    };

    NewView.prototype.close = function() {
      $(this.el).parent().find('.new-comment-link').show();
      $(this.el).children().remove();
      this.cancelEvents();
      this.unbind();
      return Backbone.ModelBinding.unbind(this);
    };

    NewView.prototype.handleKeys = function(e) {
      if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    return NewView;

  })(Backbone.View);

  (_base10 = Gruff.Views).Comments || (_base10.Comments = {});

  Gruff.Views.Comments.SegmentView = (function(_super) {

    __extends(SegmentView, _super);

    function SegmentView() {
      this.close = __bind(this.close, this);
      this.textIndex = __bind(this.textIndex, this);
      this.mergeBack = __bind(this.mergeBack, this);
      this.closeTooltip = __bind(this.closeTooltip, this);
      this.moveTooltip = __bind(this.moveTooltip, this);
      this.showTooltip = __bind(this.showTooltip, this);
      this.getClickIdx = __bind(this.getClickIdx, this);
      this.renderForm = __bind(this.renderForm, this);
      this.updateText = __bind(this.updateText, this);
      this.showNewCommentForm = __bind(this.showNewCommentForm, this);
      this.setUpMouseOverEvents = __bind(this.setUpMouseOverEvents, this);
      this.setUpTooltipEvents = __bind(this.setUpTooltipEvents, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      SegmentView.__super__.constructor.apply(this, arguments);
    }

    SegmentView.prototype.initialize = function(options) {
      this.template = _.template($('#comments-segment-template').text());
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      this.debate = options.debate;
      this.segment = options.segment;
      return this.index = options.index;
    };

    SegmentView.prototype.render = function() {
      var json,
        _this = this;
      json = {};
      json.text = this.segment.text;
      json.curruser = Gruff.User.fullJSON();
      if ($(this.parentEl).children().length === 0 || this.index === 0) {
        $(this.parentEl).prepend(this.template(json));
      } else {
        $($(this.parentEl).children()[this.index - 1]).after(this.template(json));
      }
      this.el = $($(this.parentEl).children()[this.index]);
      this.commentViews = [];
      _.each(this.segment.comments, function(comment) {
        var c, commentView;
        c = new Gruff.Models.Comment(comment);
        c.debate = _this.debate;
        commentView = new Gruff.Views.Comments.ListItemView({
          'parentEl': _this.el,
          'debate': _this.debate,
          'model': c,
          'parentView': _this
        });
        commentView.render();
        return _this.commentViews.push(commentView);
      });
      this.setUpEvents();
      return this;
    };

    SegmentView.prototype.setUpEvents = function() {
      this.$('> .text').click(this.showNewCommentForm);
      return this.setUpTooltipEvents;
    };

    SegmentView.prototype.setUpTooltipEvents = function() {
      this.$('> .text').mouseover(this.showTooltip);
      this.$('> .text').unbind("mousemove", this.moveTooltip);
      return this.$('> .text').unbind("mouseout", this.closeTooltip);
    };

    SegmentView.prototype.setUpMouseOverEvents = function() {
      this.$('> .text').unbind("mouseover", this.showTooltip);
      this.$('> .text').mousemove(this.moveTooltip);
      return this.$('> .text').mouseout(this.closeTooltip);
    };

    SegmentView.prototype.showNewCommentForm = function(e) {
      var idx, newSegment;
      idx = this.getClickIdx(e);
      newSegment = {
        text: this.segment.text.substring(0, idx),
        comments: []
      };
      this.previousView = this.parentView.addNewSegment(newSegment, this.index);
      this.parentView.reindex();
      this.segment.text = this.segment.text.substring(idx);
      this.updateText();
      this.previousView.renderForm();
      return false;
    };

    SegmentView.prototype.updateText = function() {
      return this.$('> .text').html(this.segment.text);
    };

    SegmentView.prototype.renderForm = function() {
      this.newView = new Gruff.Views.Comments.NewSubcommentView({
        'parentEl': this.$('> .comments'),
        'debate': this.debate,
        'model': this.model,
        'segment': this.segment,
        'parentView': this
      });
      return this.newView.render();
    };

    SegmentView.prototype.getClickIdx = function(e) {
      var clicked, idx;
      clicked = null;
      if (window.getSelection) {
        clicked = window.getSelection();
      } else if (document.getSelection) {
        clicked = document.getSelection();
      } else if (document.selection) {
        clicked = document.selection.createRange();
      }
      idx = clicked.focusOffset;
      return idx;
    };

    SegmentView.prototype.showTooltip = function(e) {
      $(body).append('<div class="tooltip" id="add-comment-tooltip">Click to respond right here</div>');
      this.tooltip = $('#add-comment-tooltip');
      return this.setUpMouseOverEvents();
    };

    SegmentView.prototype.moveTooltip = function(e) {};

    SegmentView.prototype.closeTooltip = function(e) {
      this.tooltip.remove();
      return this.setUpTooltipEvents();
    };

    SegmentView.prototype.mergeBack = function() {
      return this.parentView.mergeSegments(this.index);
    };

    SegmentView.prototype.textIndex = function() {
      return this.parentView.textIndex(this.index);
    };

    SegmentView.prototype.close = function() {
      var _this = this;
      _.each(this.commentViews, function(commentView) {
        return commentView.close();
      });
      this.el.remove();
      return this.unbind();
    };

    return SegmentView;

  })(Backbone.View);

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

  (_base11 = Gruff.Views).Debates || (_base11.Debates = {});

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

  (_base12 = Gruff.Views).Debates || (_base12.Debates = {});

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

  (_base13 = Gruff.Views).Debates || (_base13.Debates = {});

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

  (_base14 = Gruff.Views).Debates || (_base14.Debates = {});

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

  (_base15 = Gruff.Views).Debates || (_base15.Debates = {});

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

  (_base16 = Gruff.Views).Debates || (_base16.Debates = {});

  Gruff.Views.Debates.ListItemView = (function(_super) {

    __extends(ListItemView, _super);

    function ListItemView() {
      this["delete"] = __bind(this["delete"], this);
      this.resolveZoom = __bind(this.resolveZoom, this);
      this.zoom = __bind(this.zoom, this);
      this.mergeDebates = __bind(this.mergeDebates, this);
      this.handleModelChanges = __bind(this.handleModelChanges, this);
      this.setUpDragDrop = __bind(this.setUpDragDrop, this);
      this.openModalView = __bind(this.openModalView, this);
      this.hideDescription = __bind(this.hideDescription, this);
      this.showDescription = __bind(this.showDescription, this);
      this.toggleDescription = __bind(this.toggleDescription, this);
      this.hideInfo = __bind(this.hideInfo, this);
      this.renderSublists = __bind(this.renderSublists, this);
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
      this.model.parent = this.model.collection.parent;
      return this.loaded = false;
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
      if (this.attributeType === "answers") json.divClass = "answer";
      if (this.attributeType === "subdebates") json.divClass = "subdebate";
      $(this.parentEl).append(this.template(json));
      this.el = $(this.parentEl).find('#' + this.model.linkableId());
      this.setUpEvents();
      this.setUpDragDrop();
      return this;
    };

    ListItemView.prototype.setUpEvents = function() {
      this.$("> h4.title a.title-link").bind("click", this.toggleInfo);
      this.$("> h4.title a.title-link").bind("dblclick", this.showEditTitleForm);
      this.$("> h4.title a.zoom-link").bind("click", this.zoom);
      this.$("> h4.title a.delete-link").bind("click", this["delete"]);
      this.$("> .body").bind("dblclick", this.showEditDescriptionForm);
      return this.model.bind("change", this.handleModelChanges);
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
        }, 300);
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
      var _this = this;
      if (this.dontShowInfo) {
        this.dontShowInfo = false;
        return false;
      }
      if (this.loaded) {
        return this.renderSublists();
      } else {
        return this.model.fetchSubdebates({
          error: function(debate, jqXHR) {
            return _this.handleRemoteError(jqXHR, debate);
          },
          success: function(subdebates, response4) {
            return _this.renderSublists();
          }
        });
      }
    };

    ListItemView.prototype.renderSublists = function() {
      var againstEl, answersEl, containerEl, forEl, json;
      if (this.model.get("type") === this.model.DebateTypes.DIALECTIC) {
        containerEl = this.$('> div.arguments');
      } else {
        containerEl = this.$('> div.answers');
      }
      json = this.model.fullJSON();
      if (!$(this.el).hasClass('ui-draggable-dragging')) {
        if (this.model.get("type") === this.model.DebateTypes.DIALECTIC) {
          this.$('div.arguments').show();
          forEl = this.$('> div.arguments > .for .debates-list').first();
          againstEl = this.$('> div.arguments > .against .debates-list').first();
          this.argumentsForView = new Gruff.Views.Debates.MiniListView({
            'el': forEl,
            'collection': this.model.argumentsFor,
            'attributeType': 'argumentsFor',
            'parentView': this,
            'showView': this.showView
          });
          this.argumentsForView.render();
          this.argumentsAgainstView = new Gruff.Views.Debates.MiniListView({
            'el': againstEl,
            'collection': this.model.argumentsAgainst,
            'attributeType': 'argumentsAgainst',
            'parentView': this,
            'showView': this.showView
          });
          this.argumentsAgainstView.render();
        } else {
          answersEl = this.$('> div.answers > .debates-list').first();
          answersEl.show();
          this.answersView = new Gruff.Views.Debates.MiniListView({
            'el': answersEl,
            'collection': this.model.answers,
            'attributeType': 'answers',
            'parentView': this,
            'showView': this.showView
          });
          this.answersView.render();
        }
        this.showDescription();
        containerEl.show(200);
        return this.loaded = true;
      }
    };

    ListItemView.prototype.hideInfo = function() {
      var answersEl, _ref, _ref2, _ref3;
      this.hideDescription();
      if (this.model.get("type") === this.model.DebateTypes.DIALECTIC) {
        this.$('> div.arguments').hide();
        if ((_ref = this.argumentsForView) != null) _ref.close();
        return (_ref2 = this.argumentsAgainstView) != null ? _ref2.close() : void 0;
      } else {
        answersEl = this.$('> div.answers').first();
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

    ListItemView.prototype.setUpDragDrop = function() {
      var _this = this;
      if (Gruff.User.isCurator()) {
        this.$('> h4 a.title-link').droppable({
          accept: '.subdebate, .argument, .debate, .answer',
          hoverClass: 'over',
          greedy: true,
          tolerance: 'pointer',
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
          tolerance: 'pointer',
          over: function(e, ui) {
            _this.$('> h4').addClass('over');
            return _this.hoverTimeout = setTimeout(function() {
              _this.$('> h4').removeClass('over');
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
          appendTo: "body",
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
            cloneEl.find('div, a.delete-link').remove();
            return cloneEl.attr('id', _this.model.id);
          },
          stop: function(e, ui) {
            _this.resolveZoom();
            return _this.$('> h4').css('opacity', 1);
          }
        });
      }
    };

    ListItemView.prototype.disableDragDrop = function() {
      if (Gruff.User.isCurator()) {
        this.$('> h4 a.title-link').droppable("disable");
        this.$('> h4 a.zoom-link').droppable("disable");
        return $(this.el).draggable("disable");
      }
    };

    ListItemView.prototype.enableDragDrop = function() {
      if (Gruff.User.isCurator()) {
        this.$('> h4 a.title-link').droppable("enable");
        this.$('> h4 a.zoom-link').droppable("enable");
        return $(this.el).draggable("enable");
      }
    };

    ListItemView.prototype.handleModelChanges = function(model, options) {
      this.$('> h4.title > a.title-link').html(this.model.bestTitleText());
      return this.$('> .description').html(this.model.bestDescriptionText());
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
      return this.showView.maximize();
    };

    ListItemView.prototype["delete"] = function() {
      var _this = this;
      this.model.destroy({
        error: function(debate, jqXHR) {
          return _this.handleRemoteError(jqXHR, debate);
        },
        success: function() {
          return _this.close();
        }
      });
      return false;
    };

    return ListItemView;

  })(Backbone.View);

  (_base17 = Gruff.Views).Debates || (_base17.Debates = {});

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

    ListView.prototype.add = function(debate, collection) {
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

    ListView.prototype.disableDragDrop = function() {
      return _.each(this.views, function(view) {
        return view.disableDragDrop();
      });
    };

    ListView.prototype.enableDragDrop = function() {
      return _.each(this.views, function(view) {
        return view.enableDragDrop();
      });
    };

    return ListView;

  })(Backbone.View);

  (_base18 = Gruff.Views).Debates || (_base18.Debates = {});

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

  (_base19 = Gruff.Views).Debates || (_base19.Debates = {});

  Gruff.Views.Debates.NewView = (function(_super) {

    __extends(NewView, _super);

    function NewView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.save = __bind(this.save, this);
      NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#debate-new-template').text());
      this.attributeType = options.attributeType;
      this.showView = options.showView;
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
      if (!this.model.id) {
        this.model.url = this.collection.url;
        return this.model.save(null, {
          success: function(debate) {
            _this.collection.add(_this.model);
            return _this.close();
          },
          error: function(debate, jqXHR) {
            return _this.handleRemoteError(jqXHR, debate);
          }
        });
      }
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
      this.setUpEvents();
      $(this.el).parent().find('.new-debate-link').hide();
      $(this.el).find('#title').focus();
      return this;
    };

    NewView.prototype.setUpEvents = function() {
      return $(document).bind("keydown", this.handleKeys);
    };

    NewView.prototype.cancelEvents = function() {
      $(document).unbind("keydown", this.handleKeys);
      return $('#new-debate').unbind("submit", this.save);
    };

    NewView.prototype.close = function() {
      this.cancelEvents();
      this.unbind();
      Backbone.ModelBinding.unbind(this);
      $(this.el).parent().find('.new-debate-link').show();
      $(this.el).children().remove();
      return this.showView.closeNewDebateForm(this);
    };

    NewView.prototype.handleKeys = function(e) {
      if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    return NewView;

  })(Backbone.View);

  (_base20 = Gruff.Views).Debates || (_base20.Debates = {});

  (_base21 = Gruff.Views.Debates).ShowViews || (_base21.ShowViews = {});

  Gruff.Views.Debates.ShowView = (function(_super) {

    __extends(ShowView, _super);

    function ShowView() {
      this.selectClicked = __bind(this.selectClicked, this);
      this.selectEl = __bind(this.selectEl, this);
      this.selectRight = __bind(this.selectRight, this);
      this.selectLeft = __bind(this.selectLeft, this);
      this.changeSelection = __bind(this.changeSelection, this);
      this.selectNext = __bind(this.selectNext, this);
      this.selectPrevious = __bind(this.selectPrevious, this);
      this.setSelected = __bind(this.setSelected, this);
      this.getTypeHeading = __bind(this.getTypeHeading, this);
      this.setChildView = __bind(this.setChildView, this);
      this.maximize = __bind(this.maximize, this);
      this.minimize = __bind(this.minimize, this);
      this.showComments = __bind(this.showComments, this);
      this.showDebate = __bind(this.showDebate, this);
      this.showEditDescriptionForm = __bind(this.showEditDescriptionForm, this);
      this.showEditTitleForm = __bind(this.showEditTitleForm, this);
      this.toggleDescription = __bind(this.toggleDescription, this);
      this.enableDragDrop = __bind(this.enableDragDrop, this);
      this.disableDragDrop = __bind(this.disableDragDrop, this);
      this.setUpZoomLinkDragDrop = __bind(this.setUpZoomLinkDragDrop, this);
      this.setUpDragDrop = __bind(this.setUpDragDrop, this);
      this.handleModelChanges = __bind(this.handleModelChanges, this);
      this.handleKeys = __bind(this.handleKeys, this);
      this.cancelHandleKeys = __bind(this.cancelHandleKeys, this);
      this.setUpHandleKeys = __bind(this.setUpHandleKeys, this);
      this.setUpMaximizeEvents = __bind(this.setUpMaximizeEvents, this);
      this.setUpMinimizeEvents = __bind(this.setUpMinimizeEvents, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      this.setUpEls = __bind(this.setUpEls, this);
      this.showNewCommentForm = __bind(this.showNewCommentForm, this);
      this.showNewReferenceForm = __bind(this.showNewReferenceForm, this);
      this.closeNewDebateForm = __bind(this.closeNewDebateForm, this);
      this.showNewDebateForm = __bind(this.showNewDebateForm, this);
      this.indentTitle = __bind(this.indentTitle, this);
      this.createParentView = __bind(this.createParentView, this);
      this.renderParents = __bind(this.renderParents, this);
      this.renderComments = __bind(this.renderComments, this);
      this.renderReferences = __bind(this.renderReferences, this);
      this.renderTags = __bind(this.renderTags, this);
      ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-show-template').text());
      this.childView = options.childView;
      if (this.childView != null) this.childView.parentView = this;
      this.parentView = options.parentView;
      if (this.parentView != null) this.parentView.setChildView(this);
      this.loaded = false;
      this.status = "unrendered";
      this.subdebateListsSelector = "> .arguments > .for, > .arguments > .against, > .subdebates, > .answers";
      this.subdebatesSelector = '> .debates-list > .debate-list-item';
      this.newDebateFormViews || (this.newDebateFormViews = []);
      Gruff.Views.Debates.ShowViews[this.model.id] = this;
      return this.commentsFirst = true;
    };

    ShowView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      json.typeHeading = this.getTypeHeading();
      $(this.el).html(this.template(json));
      this.renderTags();
      this.renderReferences();
      this.renderComments();
      this.renderParents();
      this.setUpEls();
      this.setUpEvents();
      this.zoomLink.hide();
      this.status = "rendered";
      return this;
    };

    ShowView.prototype.renderTags = function() {
      this.model.tags = new Gruff.Collections.Tags({
        parent: this.model
      });
      this.model.tags.resetFromArray(this.model.get("tags"));
      this.tagsView = new Gruff.Views.Tags.IndexView({
        el: this.$('> .tags'),
        collection: this.model.tags,
        parentView: this
      });
      return this.tagsView.render();
    };

    ShowView.prototype.renderReferences = function() {
      var _this = this;
      this.model.references = new Gruff.Collections.References;
      this.model.references.setParent(this.model);
      return this.model.references.fetch({
        success: function(references, response) {
          _this.referencesView = new Gruff.Views.References.IndexView({
            el: _this.$('> .references'),
            collection: _this.model.references,
            parentView: _this
          });
          return _this.referencesView.render();
        }
      });
    };

    ShowView.prototype.renderComments = function() {
      this.model.comments = new Gruff.Collections.Comments({
        parent: this.model
      });
      this.model.comments.reset(this.model.get("comments"));
      this.commentsView = new Gruff.Views.Comments.IndexView({
        el: this.$('> .comments'),
        collection: this.model.comments,
        parentView: this,
        debate: this.model
      });
      return this.commentsView.render();
    };

    ShowView.prototype.renderParents = function() {
      var parentId, _ref, _ref2,
        _this = this;
      parentId = this.model.get("parentId");
      if ((parentId != null) && !(this.model.parent != null)) {
        this.model.parent = new Gruff.Models.Debate({
          "_id": parentId
        });
        return this.model.parent.fetch({
          success: function(model, response) {
            return _this.createParentView(null);
          }
        });
      } else if (((_ref = this.parentView) != null ? _ref.model : void 0) !== this.model.parent) {
        return this.createParentView(this.parentView);
      } else {
        if ((_ref2 = this.parentView) != null) _ref2.setChildView(this);
        return this.indentTitle();
      }
    };

    ShowView.prototype.createParentView = function(parentView) {
      var parentEl, parentId;
      parentId = this.model.get("parentId");
      parentEl = $(this.el).clone();
      parentEl.attr('id', parentId);
      $(this.el).before(parentEl);
      this.parentView = new Gruff.Views.Debates.ShowView({
        'el': parentEl,
        'model': this.model.parent,
        'childView': this,
        'parentView': parentView
      });
      this.parentView.render();
      this.parentView.minimize();
      return this.indentTitle();
    };

    ShowView.prototype.mySubdebateLists = function() {
      return this.$(this.subdebateListsSelector);
    };

    ShowView.prototype.mySubdebates = function() {
      return this.mySubdebateLists().find(this.subdebatesSelector);
    };

    ShowView.prototype.indentTitle = function() {
      var currParent, parents, _ref;
      parents = 0;
      currParent = this.model.parent;
      while (currParent != null) {
        parents++;
        currParent = currParent.parent;
      }
      this.$('> div.title').css('margin-left', 5 * parents + '%');
      return (_ref = this.childView) != null ? _ref.indentTitle() : void 0;
    };

    ShowView.prototype.showNewDebateForm = function(e) {
      var collection, debateType, formDiv, formView;
      debateType = e;
      if (e.target != null) debateType = $(e.target).attr("debate-type");
      collection = this.model[debateType];
      $(e.target).hide();
      formDiv = $('#' + this.model.id + '-new-' + debateType + '-div');
      formDiv.show();
      formView = new Gruff.Views.Debates.NewView({
        'el': formDiv,
        'collection': collection,
        'attributeType': debateType,
        'showView': this
      });
      formView.render();
      return this.newDebateFormViews.push(formView);
    };

    ShowView.prototype.closeNewDebateForm = function(view) {
      return this.newDebateFormViews = _.without(this.newDebateFormViews, view);
    };

    ShowView.prototype.showNewReferenceForm = function(e) {
      return $('.new-reference-link:visible').click();
    };

    ShowView.prototype.showNewCommentForm = function(e) {
      return $('.new-comment-link:visible').click();
    };

    ShowView.prototype.setUpEls = function() {
      this.zoomLink = this.$('> .canvas-title .zoom-link');
      this.debateTab = this.$('> .tabs #tab-debate');
      this.commentsTab = this.$('> .tabs #tab-comments');
      return this.maximizedEls = this.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments, > .references, > .tabs');
    };

    ShowView.prototype.setUpEvents = function() {
      this.$("> .title").bind("click", this.toggleDescription);
      this.$("> .title").bind("dblclick", this.showEditTitleForm);
      this.$("> .description").bind("dblclick", this.showEditDescriptionForm);
      this.zoomLink.bind("click", this.maximize);
      return this.model.bind("change", this.handleModelChanges);
    };

    ShowView.prototype.setUpMinimizeEvents = function() {
      this.$("> .title").bind("click", this.toggleDescription);
      this.zoomLink.show();
      this.setUpZoomLinkDragDrop();
      return this.cancelHandleKeys();
    };

    ShowView.prototype.setUpMaximizeEvents = function() {
      this.zoomLink.hide();
      this.$("> .title").unbind("click", this.toggleDescription);
      this.$(".new-debate-link").bind("click", this.showNewDebateForm);
      this.$(".selectable").bind("click", this.selectClicked);
      this.debateTab.bind("click", this.showDebate);
      this.commentsTab.bind("click", this.showComments);
      this.setUpDragDrop();
      return this.setUpHandleKeys();
    };

    ShowView.prototype.setUpHandleKeys = function() {
      return $(document).bind('keydown', this.handleKeys);
    };

    ShowView.prototype.cancelHandleKeys = function() {
      return $(document).unbind('keydown', this.handleKeys);
    };

    ShowView.prototype.handleKeys = function(e) {
      if ($("input:focus, textarea:focus").length > 0) return true;
      if (e.ctrlKey || e.metaKey) return true;
      if (e.keyCode === 65) {
        if (this.argumentsForView != null) {
          this.showNewDebateForm("argumentsAgainst");
        } else {
          this.showNewDebateForm("answers");
        }
        return false;
      } else if (e.keyCode === 67) {
        this.showNewCommentForm();
        return false;
      } else if (e.keyCode === 68) {
        if (this.$('> .comments:visible').length > 0) {
          $('.selected > .title > .delete-link').click();
        } else {
          this.showComments();
        }
        return false;
      } else if (e.keyCode === 70) {
        this.showNewDebateForm("argumentsFor");
        return false;
      } else if (e.keyCode === 79) {
        if (this.$('> .comments:visible').length > 0) {
          this.showDebate();
          return false;
        }
      } else if (e.keyCode === 82) {
        this.showNewReferenceForm();
        return false;
      } else if (e.keyCode === 83) {
        this.showNewDebateForm("subdebates");
        return false;
      } else if (e.keyCode === 84) {
        this.tagsView.showForm();
        return false;
      } else if (e.keyCode === 90) {
        $('.selected > .title > .zoom-link, .selected > .zoom-link').click();
        return false;
      } else if (e.keyCode === 13) {
        this.handleEnter();
        return false;
      } else if (e.keyCode === 32) {
        this.handleEnter();
        return false;
      } else if (e.keyCode === 37) {
        this.selectLeft();
        return false;
      } else if (e.keyCode === 38) {
        this.selectPrevious();
        return false;
      } else if (e.keyCode === 39) {
        this.selectRight();
        return false;
      } else if (e.keyCode === 40) {
        this.selectNext();
        return false;
      } else {
        console.log(e.keyCode);
        return true;
      }
    };

    ShowView.prototype.handleEnter = function() {
      var actionEl, linkEl;
      actionEl = $('.selected .selected-enter-action').first();
      linkEl = $('.selected > .title > .title-link');
      if (linkEl.length > 0) {
        return linkEl.click();
      } else if (actionEl.length > 0) {
        return actionEl.click();
      } else {
        return $('.selected').dblclick();
      }
    };

    ShowView.prototype.handleModelChanges = function(model, options) {
      this.$('> .canvas-title > h1 > .attribute-type').html(this.getTypeHeading());
      this.$('> .canvas-title > h1 > .title-text').html(this.model.bestTitleText());
      return this.$('> .description').html(this.model.bestDescriptionText());
    };

    ShowView.prototype.setUpDragDrop = function() {
      var _this;
      if (Gruff.User.isCurator()) {
        _this = this;
        return this.mySubdebateLists().droppable({
          accept: '.subdebate, .argument, .debate, .answer',
          tolerance: 'pointer',
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
      }
    };

    ShowView.prototype.setUpZoomLinkDragDrop = function() {
      var _this = this;
      if (Gruff.User.isCurator()) {
        return this.$('> .canvas-title').add(this.zoomLink).droppable({
          accept: '.subdebate, .argument, .debate, .answer',
          greedy: true,
          tolerance: 'pointer',
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
      }
    };

    ShowView.prototype.disableDragDrop = function() {
      var _ref, _ref2, _ref3, _ref4;
      this.mySubdebateLists().droppable("destroy");
      if ((_ref = this.argumentsForView) != null) _ref.disableDragDrop();
      if ((_ref2 = this.argumentsAgainstView) != null) _ref2.disableDragDrop();
      if ((_ref3 = this.answersView) != null) _ref3.disableDragDrop();
      return (_ref4 = this.subdebatesView) != null ? _ref4.disableDragDrop() : void 0;
    };

    ShowView.prototype.enableDragDrop = function() {
      var _ref, _ref2, _ref3, _ref4;
      this.mySubdebateLists().droppable("enable");
      if ((_ref = this.argumentsForView) != null) _ref.enableDragDrop();
      if ((_ref2 = this.argumentsAgainstView) != null) _ref2.enableDragDrop();
      if ((_ref3 = this.answersView) != null) _ref3.enableDragDrop();
      return (_ref4 = this.subdebatesView) != null ? _ref4.enableDragDrop() : void 0;
    };

    ShowView.prototype.toggleDescription = function(e) {
      this.$('> div.description').toggle();
      return false;
    };

    ShowView.prototype.showEditTitleForm = function(e) {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
      this.editTitleView = new Gruff.Views.Debates.EditTitleView({
        'el': e.target,
        'titleEl': e.target,
        'model': this.model
      });
      return this.editTitleView.render();
    };

    ShowView.prototype.showEditDescriptionForm = function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.editDescriptionView = new Gruff.Views.Debates.EditDescriptionView({
        'el': e.target,
        'descriptionEl': e.target,
        'model': this.model
      });
      return this.editDescriptionView.render();
    };

    ShowView.prototype.showDebate = function() {
      this.commentsTab.removeClass('active');
      this.debateTab.addClass('active');
      this.commentsTab.addClass('selectable');
      this.debateTab.removeClass('selectable');
      this.$('> .comments').hide();
      this.$('> .arguments, > .answers, > .subdebates, > .references').show();
      return false;
    };

    ShowView.prototype.showComments = function() {
      this.commentsTab.addClass('active');
      this.debateTab.removeClass('active');
      this.commentsTab.removeClass('selectable');
      this.debateTab.addClass('selectable');
      this.$('> .comments').show();
      this.$('> .arguments, > .answers, > .subdebates, > .references').hide();
      return false;
    };

    ShowView.prototype.minimize = function() {
      var _ref, _ref2, _ref3, _ref4;
      if (this.isOffScreen) {
        this.onScreen();
      } else if (this.status === 'hidden') {
        this.show();
      }
      if ((_ref = this.parentView) != null) _ref.setChildView(this);
      if ((_ref2 = this.parentView) != null) _ref2.minimize();
      this.maximizedEls.hide();
      this.setUpMinimizeEvents();
      this.tagsView.hideForm();
      if ((_ref3 = this.editTitleView) != null) _ref3.close();
      if ((_ref4 = this.editDescriptionView) != null) _ref4.close();
      _.each(this.newDebateFormViews, function(formView) {
        return formView.close();
      });
      this.newDebateFormViews = [];
      this.status = "minimized";
      return false;
    };

    ShowView.prototype.maximize = function() {
      var _this = this;
      this.status = "maximized";
      this.focus();
      router.navigate('canvas/' + this.model.id);
      if (this.loaded) {
        this.maximizedEls.show(200);
        if (this.commentsFirst) {
          this.showComments();
        } else {
          this.showDebate();
        }
        return this.setUpMaximizeEvents();
      } else {
        this.model.fetchSubdebates({
          success: function(subdebates, response) {
            var json, _ref;
            _this.maximizedEls.show(200);
            json = _this.model.fullJSON();
            json.objecttype = "debates";
            json.objectid = json.linkableId;
            json.attributetype = "";
            json.attributeid = "";
            json.typeHeading = _this.getTypeHeading();
            json.baseurl = (_ref = json.attributetype !== "") != null ? _ref : "/" + json.objecttype + "/" + json.objectid + {
              "/tag/": "/" + json.objecttype + "/" + json.objectid + "/" + json.attributetype + "/" + json.attributeid + "/tag/"
            };
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
            if (_this.commentsFirst) {
              _this.showComments();
            } else {
              _this.showDebate();
            }
            _this.setUpMaximizeEvents();
            return _this.loaded = true;
          }
        });
        return false;
      }
    };

    ShowView.prototype.setChildView = function(view) {
      var _ref;
      if (this.childView && this.childView !== view) {
        if ((_ref = this.childView) != null) _ref.hide();
      }
      return this.childView = view;
    };

    ShowView.prototype.close = function() {
      var _ref, _ref2, _ref3, _ref4, _ref5;
      if ((_ref = this.childView) != null) _ref.close();
      if ((_ref2 = this.argumensForView) != null) _ref2.close();
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
      this.status = "hidden";
      return this.cancelHandleKeys();
    };

    ShowView.prototype.show = function() {
      return $(this.el).show(200);
    };

    ShowView.prototype.focus = function() {
      var _ref, _ref2, _ref3;
      if (this.isOffScreen) this.onScreen();
      this.show();
      if ((_ref = this.childView) != null) _ref.hide();
      if ((_ref2 = this.parentView) != null) _ref2.setChildView(this);
      if ((_ref3 = this.parentView) != null) _ref3.minimize();
      return this.setSelected();
    };

    ShowView.prototype.offScreen = function() {
      var childPos, height;
      if (!this.isOffScreen) {
        this.disableDragDrop();
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
        this.enableDragDrop();
        height = $(this.el).height() - this.$('> .canvas-title').height();
        childPos = $(this.childView.el).offset();
        $(this.childView.el).offset({
          left: childPos.left,
          top: childPos.top + height
        });
        return this.isOffScreen = false;
      }
    };

    ShowView.prototype.getTypeHeading = function() {
      var result;
      result = "";
      switch (this.model.get("attributeType")) {
        case "argumentsFor":
          result = "For:";
          break;
        case "argumentsAgainst":
          result = "Against:";
          break;
        case "answers":
          result = "Answer:";
          break;
        case "subdebates":
          result = "Sub-debate:";
      }
      return result;
    };

    ShowView.prototype.setSelected = function() {
      return this.selectEl(this.$('> .canvas-title > h1'));
    };

    ShowView.prototype.selectPrevious = function() {
      return this.changeSelection(-1);
    };

    ShowView.prototype.selectNext = function() {
      return this.changeSelection(1);
    };

    ShowView.prototype.changeSelection = function(relativeIdx) {
      var i, next, nextIdx, selectable, selectables, selected, _len;
      selected = $('.selected');
      if (selected.length > 0) {
        selectables = $('.selectable:visible');
        nextIdx = 0;
        for (i = 0, _len = selectables.length; i < _len; i++) {
          selectable = selectables[i];
          if ($(selectable).hasClass('selected')) {
            nextIdx = i + relativeIdx;
            break;
          }
        }
        nextIdx = (nextIdx + selectables.length) % selectables.length;
        next = selectables[nextIdx];
      } else {
        return this.setSelected();
      }
      return this.selectEl(next);
    };

    ShowView.prototype.selectLeft = function() {
      var left, right;
      right = $('.against.selected:visible');
      if (!(right.length > 0)) right = $('.selected').parents('.against');
      left = right.siblings('.for');
      if (left.length > 0) return this.selectEl(left);
    };

    ShowView.prototype.selectRight = function() {
      var left, right;
      left = $('.for.selected:visible');
      if (!(left.length > 0)) left = $('.selected').parents('.for');
      right = left.siblings('.against');
      if (right.length > 0) return this.selectEl(right);
    };

    ShowView.prototype.selectEl = function(el) {
      var newTop;
      $('.selected').removeClass('selected');
      $(el).addClass('selected');
      newTop = $(el).position().top - ($(window).height() / 2);
      return $(window).scrollTop(newTop);
    };

    ShowView.prototype.selectClicked = function(e) {
      this.selectEl(e.currentTarget);
      return true;
    };

    return ShowView;

  })(Backbone.View);

  (_base22 = Gruff.Views).Debates || (_base22.Debates = {});

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
      this.setUpEvents();
      this.titleEl.focus();
      return this;
    };

    SimpleNewView.prototype.close = function() {
      $(this.formEl).remove();
      this.parentView.linkEl.show();
      this.cancelEvents();
      this.unbind();
      return Backbone.ModelBinding.unbind(this);
    };

    SimpleNewView.prototype.setUpEvents = function() {
      return $(this.titleEl).bind("keydown", this.handleKeys);
    };

    SimpleNewView.prototype.cancelEvents = function() {
      return $(this.titleEl).unbind("keydown", this.handleKeys);
    };

    return SimpleNewView;

  })(Gruff.Views.Debates.NewView);

  (_base23 = Gruff.Views).Debates || (_base23.Debates = {});

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

  (_base24 = Gruff.Views).Login || (_base24.Login = {});

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
          Gruff.User.fetch();
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

  (_base25 = Gruff.Views).References || (_base25.References = {});

  Gruff.Views.References.IndexView = (function(_super) {

    __extends(IndexView, _super);

    function IndexView() {
      this.remove = __bind(this.remove, this);
      this.add = __bind(this.add, this);
      this.close = __bind(this.close, this);
      this.hideForm = __bind(this.hideForm, this);
      this.showForm = __bind(this.showForm, this);
      IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.initialize = function(options) {
      this.template = _.template($('#references-index-template').text());
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
      this.parentView = options.parentView;
      return this.parentModel = this.collection.parent;
    };

    IndexView.prototype.render = function() {
      var json,
        _this = this;
      json = {};
      json.id = this.parentModel.id;
      json.curruser = Gruff.User.fullJSON();
      $(this.el).html(this.template(json));
      this.showFormEl = this.$(".new-reference-link");
      this.formEl = $('#' + this.parentModel.id + '-new-reference-div');
      this.views = [];
      this.collection.each(function(reference) {
        return _this.add(reference);
      });
      this.initializeForm();
      this.setUpEvents();
      this.hideForm();
      return this;
    };

    IndexView.prototype.initializeForm = function() {
      this.model = new this.collection.model();
      this.model.collection = this.collection;
      return this.model.parent = this.parentModel;
    };

    IndexView.prototype.setUpEvents = function() {
      return this.showFormEl.bind('click', this.showForm);
    };

    IndexView.prototype.showForm = function() {
      this.showFormEl.hide();
      this.formEl.show();
      this.formView = new Gruff.Views.References.NewView({
        'el': this.formEl,
        'collection': this.collection
      });
      this.formView.render();
      return false;
    };

    IndexView.prototype.hideForm = function() {
      var _ref;
      if ((_ref = this.formView) != null) _ref.close();
      this.showFormEl.show();
      return false;
    };

    IndexView.prototype.close = function() {
      _.each(this.views, function(view) {
        return view.close();
      });
      $(this.el).html('');
      return this.unbind();
    };

    IndexView.prototype.add = function(reference) {
      var referenceView;
      reference.collection = this.collection;
      referenceView = new Gruff.Views.References.ListItemView({
        'parentEl': this.el,
        'model': reference,
        'parentView': this
      });
      this.views.push(referenceView);
      return referenceView.render();
    };

    IndexView.prototype.remove = function(reference) {
      var viewToRemove,
        _this = this;
      viewToRemove = _.select(this.views, function(view) {
        var _ref;
        return ((_ref = view.model) != null ? _ref.name : void 0) === reference.name;
      })[0];
      this.views = _.without(this.views, viewToRemove);
      return viewToRemove.close();
    };

    return IndexView;

  })(Backbone.View);

  (_base26 = Gruff.Views).References || (_base26.References = {});

  Gruff.Views.References.ListItemView = (function(_super) {

    __extends(ListItemView, _super);

    function ListItemView() {
      this.close = __bind(this.close, this);
      this.removeReference = __bind(this.removeReference, this);
      this.openExternalPage = __bind(this.openExternalPage, this);
      this.hideDelete = __bind(this.hideDelete, this);
      this.showDelete = __bind(this.showDelete, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      ListItemView.__super__.constructor.apply(this, arguments);
    }

    ListItemView.prototype.initialize = function(options) {
      var _ref;
      this.template = _.template($('#references-list-item-template').text());
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      this.parentModel = options.parentModel;
      return this.parentModel || (this.parentModel = (_ref = this.parentView) != null ? _ref.parentModel : void 0);
    };

    ListItemView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      $(this.parentEl).find('h3').after(this.template(json));
      this.el = $(this.parentEl).find('#' + this.model.id);
      this.externalEl = this.$("> h4.title a.external-link");
      this.deleteEl = this.$("> a.delete-reference");
      this.selectableEl = this.el;
      this.setUpEvents();
      return this;
    };

    ListItemView.prototype.setUpEvents = function() {
      this.externalEl.bind("click", this.openExternalPage);
      return this.deleteEl.bind("click", this.removeReference);
    };

    ListItemView.prototype.showDelete = function() {
      return this.deleteEl.show();
    };

    ListItemView.prototype.hideDelete = function() {
      return this.deleteEl.hide();
    };

    ListItemView.prototype.openExternalPage = function() {
      var url;
      url = this.externalEl.attr('href');
      return window.open(url, "_blank");
    };

    ListItemView.prototype.removeReference = function() {
      var _this = this;
      return this.model.destroy({
        success: function(reference) {
          return _this.close();
        },
        error: function(reference, jqXHR) {
          return _this.handleRemoteError(jqXHR, reference);
        }
      });
    };

    ListItemView.prototype.close = function() {
      this.el.remove();
      return this.unbind();
    };

    return ListItemView;

  })(Backbone.View);

  (_base27 = Gruff.Views).References || (_base27.References = {});

  Gruff.Views.References.NewView = (function(_super) {

    __extends(NewView, _super);

    function NewView() {
      this.handleKeys = __bind(this.handleKeys, this);
      this.save = __bind(this.save, this);
      NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.initialize = function(options) {
      var _this = this;
      this.template = _.template($('#reference-new-template').text());
      this.attributeType = options.attributeType;
      this.model = new this.collection.model();
      this.model.collection = this.collection;
      this.parentModel = this.collection.parent;
      return this.model.bind("change:errors", function() {
        return _this.render();
      });
    };

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.model.save(null, {
        success: function(reference) {
          _this.collection.add(reference);
          return _this.close();
        },
        error: function(reference, jqXHR) {
          return _this.handleRemoteError(jqXHR, reference);
        }
      });
    };

    NewView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      $(this.el).html(this.template(json));
      $(this.el).show();
      Backbone.ModelBinding.bind(this);
      this.setUpEvents();
      $(this.el).parent().find('.new-reference-link').hide();
      $(this.el).find('input').first().focus();
      return this;
    };

    NewView.prototype.setUpEvents = function() {
      $(document).bind("keydown", this.handleKeys);
      this.$("input[type='submit']:visible").bind('click', this.save);
      return this.$('.cancel_button:visible').bind('click', this.close);
    };

    NewView.prototype.cancelEvents = function() {
      return $(document).unbind("keydown", this.handleKeys);
    };

    NewView.prototype.close = function() {
      $(this.el).parent().find('.new-reference-link').show();
      $(this.el).children().remove();
      this.cancelEvents();
      this.unbind();
      return Backbone.ModelBinding.unbind(this);
    };

    NewView.prototype.handleKeys = function(e) {
      if (e.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    };

    return NewView;

  })(Backbone.View);

  (_base28 = Gruff.Views).Tags || (_base28.Tags = {});

  Gruff.Views.Tags.IndexView = (function(_super) {

    __extends(IndexView, _super);

    function IndexView() {
      this.remove = __bind(this.remove, this);
      this.add = __bind(this.add, this);
      this.save = __bind(this.save, this);
      this.close = __bind(this.close, this);
      this.hideForm = __bind(this.hideForm, this);
      this.showForm = __bind(this.showForm, this);
      this.handleKeys = __bind(this.handleKeys, this);
      IndexView.__super__.constructor.apply(this, arguments);
    }

    IndexView.prototype.initialize = function(options) {
      this.template = _.template($('#tags-index-template').text());
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
      this.parentView = options.parentView;
      return this.parentModel = this.collection.parent;
    };

    IndexView.prototype.render = function() {
      var json,
        _this = this;
      json = {};
      json.id = this.parentModel.id;
      json.curruser = Gruff.User.fullJSON();
      $(this.el).html(this.template(json));
      this.showFormEl = this.$(".show-add-tag-form a");
      this.formEl = this.$(".add-tag-form");
      this.inputEl = this.formEl.find('input');
      this.hideFormEl = this.formEl.find('a');
      this.views = [];
      this.collection.each(function(tag) {
        return _this.add(tag);
      });
      this.initializeForm();
      this.setUpEvents();
      this.hideForm();
      return this;
    };

    IndexView.prototype.initializeForm = function() {
      this.inputEl.val('');
      this.model = new this.collection.model();
      return this.model.parent = this.parentModel;
    };

    IndexView.prototype.setUpEvents = function() {
      Backbone.ModelBinding.bind(this);
      this.showFormEl.bind('click', this.showForm);
      this.hideFormEl.bind('click', this.hideForm);
      this.inputEl.bind('keydown', this.handleKeys);
      return this.inputEl.autocomplete({
        source: "/rest/tags",
        autoFocus: true
      });
    };

    IndexView.prototype.handleKeys = function(e) {
      if (e.keyCode === 13) {
        this.save();
        false;
      } else if (e.keyCode === 27) {
        this.hideForm();
        false;
      }
      return true;
    };

    IndexView.prototype.showForm = function() {
      this.formEl.show();
      this.showFormEl.hide();
      this.inputEl.focus();
      return false;
    };

    IndexView.prototype.hideForm = function() {
      this.showFormEl.show();
      this.inputEl.blur();
      this.formEl.hide();
      return false;
    };

    IndexView.prototype.close = function() {
      _.each(this.views, function(view) {
        return view.close();
      });
      $(this.el).html('');
      Backbone.ModelBinding.unbind(this);
      return this.unbind();
    };

    IndexView.prototype.save = function() {
      var _this = this;
      this.model.set({
        name: this.inputEl.val()
      });
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(tag) {
          _this.initializeForm();
          return _this.hideForm();
        },
        error: function(tag, jqXHR) {
          return _this.handleRemoteError(jqXHR, tag);
        }
      });
    };

    IndexView.prototype.add = function(tag) {
      var tagView;
      tag.parentCollection = this.collection;
      tagView = new Gruff.Views.Tags.ShowView({
        'parentEl': this.el,
        'model': tag,
        'parentView': this
      });
      this.views.push(tagView);
      return tagView.render();
    };

    IndexView.prototype.remove = function(tag) {
      var viewToRemove,
        _this = this;
      viewToRemove = _.select(this.views, function(view) {
        var _ref;
        return ((_ref = view.model) != null ? _ref.name : void 0) === tag.name;
      })[0];
      this.views = _.without(this.views, viewToRemove);
      return viewToRemove.close();
    };

    return IndexView;

  })(Backbone.View);

  (_base29 = Gruff.Views).Tags || (_base29.Tags = {});

  Gruff.Views.Tags.ShowView = (function(_super) {

    __extends(ShowView, _super);

    function ShowView() {
      this.close = __bind(this.close, this);
      this.removeTag = __bind(this.removeTag, this);
      this.hideDelete = __bind(this.hideDelete, this);
      this.showDelete = __bind(this.showDelete, this);
      this.setUpEvents = __bind(this.setUpEvents, this);
      ShowView.__super__.constructor.apply(this, arguments);
    }

    ShowView.prototype.initialize = function(options) {
      var _ref;
      this.template = _.template($('#tags-show-template').text());
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      this.parentModel = options.parentModel;
      return this.parentModel || (this.parentModel = (_ref = this.parentView) != null ? _ref.parentModel : void 0);
    };

    ShowView.prototype.render = function() {
      var json;
      json = this.model.fullJSON();
      $(this.parentEl).find('.label').after(this.template(json));
      this.el = $(this.parentEl).find('#' + this.model.get("name").replace(" ", "\\ ") + '-tag');
      this.deleteEl = this.$("> a.delete-tag");
      this.setUpEvents();
      return this;
    };

    ShowView.prototype.setUpEvents = function() {
      $(this.el).bind("mouseover", this.showDelete);
      $(this.el).bind("mouseout", this.hideDelete);
      return this.deleteEl.bind("click", this.removeTag);
    };

    ShowView.prototype.showDelete = function() {
      return this.$('a.delete-tag').addClass('hover');
    };

    ShowView.prototype.hideDelete = function() {
      return this.$('a.delete-tag').removeClass('hover');
    };

    ShowView.prototype.removeTag = function() {
      var _this = this;
      return this.model.destroy({
        success: function(tag) {
          return _this.close();
        },
        error: function(tag, jqXHR) {
          return _this.handleRemoteError(jqXHR, tag);
        }
      });
    };

    ShowView.prototype.close = function() {
      this.el.remove();
      return this.unbind();
    };

    return ShowView;

  })(Backbone.View);

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
          return debate.save(null, {
            wait: true,
            error: function(debate, jqXHR) {
              return _this.handleRemoteError(jqXHR);
            },
            success: function() {
              if (oldCollection.parent !== newCollection.parent) {
                return newCollection.parent.save(null, {
                  wait: true,
                  error: function(debate, jqXHR) {
                    return _this.handleRemoteError(jqXHR);
                  }
                });
              }
            }
          });
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
