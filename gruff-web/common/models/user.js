(function(isClient, exports){

    if (isClient) {
var ClassHelper = exports.ClassHelper;
    } else {
var ClassHelper = require('../lib/class_helper').ClassHelper;
    }
var classHelper = new ClassHelper();

User = function() {};

// Needed to provide compatibility between Backbone and simple Node models
User.prototype.safeGet = function(attribute) {
    if (typeof(this.get)==="undefined") {
      return this[attribute];
    } else {
      return this.get(attribute);
    }
};

// Needed to provide compatibility between Backbone and simple Node models
User.prototype.safeSet = function(attributes) {
    if (typeof(this.set)==="undefined") {
        for (attr in attributes) {
	          this[attr] = attributes[attr];
        }
    } else {
        this.set(attributes);
    }
};

User.prototype.uniqueName = function() {
    var name = this.safeGet("login");
    if (!name || name === null) {
      var auth = this.safeGet("authenticator");
      var data = this.safeGet("data");
      name = data.username;
    }
    return name;
};

User.prototype.augmentUser = function(user) {
    classHelper.augment(user, User);
    return user;
};

exports.User = User;

})(
   (typeof window !== 'undefined'),
   (typeof exports === 'undefined' || typeof exports === 'DOMWindow') ? this["GruffShared"] = {} : exports
  );
