// Generated by CoffeeScript 1.11.1
(function() {
  var base,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  (base = Gruff.Views).Comments || (base.Comments = {});

  Gruff.Views.Comments.SegmentView = (function(superClass) {
    extend(SegmentView, superClass);

    function SegmentView() {
      this.close = bind(this.close, this);
      this.textIndex = bind(this.textIndex, this);
      this.mergeBack = bind(this.mergeBack, this);
      this.closeTooltip = bind(this.closeTooltip, this);
      this.moveTooltip = bind(this.moveTooltip, this);
      this.showTooltip = bind(this.showTooltip, this);
      this.getClickIdx = bind(this.getClickIdx, this);
      this.renderForm = bind(this.renderForm, this);
      this.updateText = bind(this.updateText, this);
      this.showNewCommentForm = bind(this.showNewCommentForm, this);
      this.setUpMouseOverEvents = bind(this.setUpMouseOverEvents, this);
      this.setUpTooltipEvents = bind(this.setUpTooltipEvents, this);
      this.setUpEvents = bind(this.setUpEvents, this);
      return SegmentView.__super__.constructor.apply(this, arguments);
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
      var json;
      json = {};
      json.text = this.formatText(this.segment.text);
      json.curruser = Gruff.User.fullJSON();
      if ($(this.parentEl).children().length === 0 || this.index === 0) {
        $(this.parentEl).prepend(this.template(json));
      } else {
        $($(this.parentEl).children()[this.index - 1]).after(this.template(json));
      }
      this.el = $($(this.parentEl).children()[this.index]);
      this.commentViews = [];
      _.each(this.segment.comments, (function(_this) {
        return function(comment) {
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
        };
      })(this));
      this.setUpEvents();
      return this;
    };

    SegmentView.prototype.setUpEvents = function() {
      this.$('> .text').click(this.showNewCommentForm);
      return this.setUpTooltipEvents();
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
      return this.$('> .text').html(this.formatText(this.segment.text));
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
      $('body').append('<div class="tooltip" id="add-comment-tooltip">Click to respond right here</div>');
      this.tooltip = $('#add-comment-tooltip');
      return this.setUpMouseOverEvents();
    };

    SegmentView.prototype.moveTooltip = function(e) {
      this.tooltip.css('left', e.pageX + 8);
      return this.tooltip.css('top', e.pageY - 17);
    };

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
      _.each(this.commentViews, (function(_this) {
        return function(commentView) {
          return commentView.close();
        };
      })(this));
      this.el.remove();
      return this.unbind();
    };

    return SegmentView;

  })(Backbone.View);

}).call(this);