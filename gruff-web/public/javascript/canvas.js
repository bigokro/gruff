var exports = this["GruffShared"] = {};
// TODO: Fix node/require deps to remove this hack
require(["../lib/class_helper"], function(class_helper) {
require(["../models/comment", "../models/identifiable"], function(comment, identifiable) {
require(["../models/describable"], function(describable) {
require(["../models/debate", "../models/reference"], function(debate, reference) {
require(["../backbone/gruff"], function(gruff) {
  router = new Gruff.Routers.DebatesRouter();
  Backbone.history.start({pushState: true});
});
});
});
});
});
