var exports = this["GruffShared"] = {};
require(["../models/identifiable", "../models/describable", "../lib/class_helper"], function(identifiable, describable, class_helper) {
  // TODO: Fix node/require deps to remove this hack
  require(["../models/debate"], function(debate) {
    require(["../backbone/gruff"], function(gruff) {
      router = new Gruff.Routers.DebatesRouter();
      Backbone.history.start({pushState: true});
    });
  });
});
