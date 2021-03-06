// Generated by CoffeeScript 1.11.1
(function() {
  var base,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Gruff.Views).References || (base.References = {});

  Gruff.Views.References.ListItemView = (function(superClass) {
    extend(ListItemView, superClass);

    function ListItemView() {
      this.close = bind(this.close, this);
      this.removeReference = bind(this.removeReference, this);
      this.openExternalPage = bind(this.openExternalPage, this);
      this.hideDelete = bind(this.hideDelete, this);
      this.showDelete = bind(this.showDelete, this);
      this.setUpEvents = bind(this.setUpEvents, this);
      return ListItemView.__super__.constructor.apply(this, arguments);
    }

    ListItemView.prototype.initialize = function(options) {
      var ref;
      this.template = _.template($('#references-list-item-template').text());
      this.parentEl = options.parentEl;
      this.parentView = options.parentView;
      this.parentModel = options.parentModel;
      return this.parentModel || (this.parentModel = (ref = this.parentView) != null ? ref.parentModel : void 0);
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
      return this.model.destroy({
        success: (function(_this) {
          return function(reference) {
            return _this.close();
          };
        })(this),
        error: (function(_this) {
          return function(reference, jqXHR) {
            return _this.handleRemoteError(jqXHR, reference);
          };
        })(this)
      });
    };

    ListItemView.prototype.close = function() {
      this.el.remove();
      return this.unbind();
    };

    return ListItemView;

  })(Backbone.View);

}).call(this);
