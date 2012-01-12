require(["../backbone/gruff", "../models/identifiable", "../models/describable", "../lib/class_helper"], function(gruff, identifiable, describable, class_helper) {
  // TODO: Fix node/require deps to remove this hack
  require(["../models/debate"], function(debate) {
    var urlStr = window.location.href;
    var id = urlStr.substring(urlStr.lastIndexOf('/') + 1);
    router = new Gruff.Routers.DebatesRouter({id: id});
  });
});
