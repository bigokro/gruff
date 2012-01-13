require(["../models/identifiable", "../models/describable", "../lib/class_helper"], function(identifiable, describable, class_helper) {
  // TODO: Fix node/require deps to remove this hack
  require(["../models/debate"], function(debate) {
    require(["../backbone/gruff"], function(gruff) {
      var urlStr = window.location.href;
      var id = urlStr.substring(urlStr.lastIndexOf('/') + 1);
      router = new Gruff.Routers.DebatesRouter({id: id});
    });
  });
});
