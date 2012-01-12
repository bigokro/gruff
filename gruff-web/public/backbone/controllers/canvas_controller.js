(function() {
  var CanvasController,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  CanvasController = (function(_super) {

    __extends(CanvasController, _super);

    function CanvasController() {
      CanvasController.__super__.constructor.apply(this, arguments);
    }

    CanvasController.prototype.initialize = function() {
      var main_debate_view, model;
      model = new Debate({
        id: '4f03d5631544e424f7000001'
      });
      model.fetch();
      return main_debate_view = new Gruff.Views.Debates.ShowView({
        'el': $('#main-debate'),
        'model': model
      });
    };

    return CanvasController;

  })(Backbone.Controller);

}).call(this);
