// Generated by CoffeeScript 1.11.1
(function() {
  var base,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Gruff.Views).Debates || (base.Debates = {});

  Gruff.Views.Debates.NewView = (function(superClass) {
    extend(NewView, superClass);

    function NewView() {
      this.handleKeys = bind(this.handleKeys, this);
      this.save = bind(this.save, this);
      return NewView.__super__.constructor.apply(this, arguments);
    }

    NewView.prototype.initialize = function(options) {
      this.template = _.template($('#debate-new-template').text());
      this.attributeType = options.attributeType;
      this.showView = options.showView;
      this.model = new this.collection.model();
      return this.model.bind("change:errors", (function(_this) {
        return function() {
          return _this.render();
        };
      })(this));
    };

    NewView.prototype.events = {
      "submit #new-debate": "save",
      "click .cancel_button": "close"
    };

    NewView.prototype.save = function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      if (!this.model.id) {
        this.model.url = this.collection.url;
        return this.model.save(null, {
          success: (function(_this) {
            return function(debate) {
              _this.collection.add(_this.model);
              return _this.close();
            };
          })(this),
          error: (function(_this) {
            return function(debate, jqXHR) {
              return _this.handleRemoteError(jqXHR, debate);
            };
          })(this)
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

}).call(this);
