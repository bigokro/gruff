require(["/backbone/gruff.js"], function(gruff) {
  var urlStr = window.location.href;
  var id = urlStr.substring(urlStr.lastIndexOf('/') + 1);
  router = new Gruff.Routers.DebatesRouter({id: id});
});
