(function(isClient, exports){

/* 
 * Provides functions for all domain model classes that can be "described"
 * (that is, they have a title and a description that can be chosen by popular vote)
 */

    if (isClient) {
var Comment = exports.Comment;
var ClassHelper = exports.ClassHelper;
    } else {
var Comment = require('./comment').Comment;
var ClassHelper = require('../lib/class_helper').ClassHelper;
    }
var classHelper = new ClassHelper();

Describable = function() {
};

// Needed to provide compatibility between Backbone and simple Node models
Describable.prototype.safeGet = function(attribute) {
    if (typeof(this.get)==="undefined") {
      return this[attribute];
    } else {
      return this.get(attribute);
    }
};

// Needed to provide compatibility between Backbone and simple Node models
Describable.prototype.safeSet = function(attributes) {
    if (typeof(this.set)==="undefined") {
        for (attr in attributes) {
	    this[attr] = attributes[attr];
        }
    } else {
        return this.set(attributes);
    }
};

Describable.prototype.bestTitle = function() {
    var titles = this.safeGet("titles");
    if (typeof(titles)==="undefined") {
	    return this.safeGet("title");
    }
    var result = titles[titles.length-1];
    var votes = result != null && result.votes ? result.votes.length : 0;
    for (i=0; i < titles.length; i++) {
        var title = titles[i];
        if (title.votes) {
            if (title.votes.length > votes) {
                result = title;
                votes = title.votes.length;
            }
        }
    }
    return result
};

Describable.prototype.bestTitleText = function() {
    var title = this.bestTitle();
    if (title == null
	|| typeof(title) === 'undefined' 
	|| typeof(title.title) === 'undefined') {
	return title;
    } else {
	return title.title;
    }
};

Describable.prototype.getDescriptions = function() {
    if (typeof(this.get) === 'undefined' && !this.descs) {
    	    return [{
		    // TODO: Remove when we wipe out the database
		    text: this.body,
		    user: this.user,
		    date: this.date,
		    votes: []
		    }];
    } else {
	return this.safeGet("descs");
    }
};

Describable.prototype.bestDescription = function() {
    var descs = this.getDescriptions();
    if (descs == null || descs.length == 0) return null;
    var result = descs[descs.length-1];
    var votes = result != null && result.votes ? result.votes.length : 0;
    for (i=0; i < descs.length; i++) {
        var desc = descs[i];
        if (desc && desc != null && desc.votes) {
            if (desc.votes.length > votes) {
                result = desc;
                votes = desc.votes.length;
            }
        }
    }
    return result
};

Describable.prototype.bestDescriptionText = function() {
    var description = this.bestDescription();
    if (description == null) return null;
    return description.text;
};

Describable.prototype.describableContributionsCount = function() {
    var titles = this.safeGet("titles");
    var descs = this.getDescriptions();
    var comments = this.safeGet("comments");
  var titleCount = titles ? titles.length : 0;
  var descCount = descs ? descs.length : 0;
  var commentCount = comments ? comments.length : 0;
  return titleCount + descCount + commentCount;
};

Describable.prototype.describableVotesCount = function() {
    var titles = this.safeGet("titles");
    var descs = this.getDescriptions();
  var titleVotes = 0;
  if (titles && titles != null) {
    for (i=0; i < titles.length; i++) {
      if (titles[i] != null
          && titles[i].votes 
          && titles[i] != null) titleVotes += titles[i].votes.length;
    }
  }
  var descVotes = 0;
  if (descs && descs != null) {
    for (i=0; i < descs.length; i++) {
      if (descs[i] != null 
          && descs[i].votes 
          && descs[i].votes != null) descVotes += descs[i].votes.length;
    }
  }
  return titleVotes + descVotes;
};

Describable.prototype.setTitle = function(newTitle) {
    var titles = this.safeGet("titles");
    if (titles == null || typeof(titles) === "undefined") titles = [];
    titles.push({
      title: newTitle,
      user: "TODO: get user login",
      date: new Date()
    });
    this.safeSet({
      title: newTitle,
      titles: titles
    });
};

Describable.prototype.setDescription = function(newDesc) {
    var descs = this.safeGet("descs");
    if (descs == null || typeof(descs) === "undefined") descs = [];
    descs.push({
      text: newDesc,
      user: "TODO: get user login",
      date: new Date()
    });
    this.safeSet({
      desc: newDesc,
      descs: descs
    });
};

Describable.prototype.findComment = function(id) {
    var comment = null;
    var comments = this.safeGet("comments") || [];
    for (var i=0; i<comments.length && comment === null; i++) {
        var c = comments[i];
        classHelper.augment(c, Comment);
        c.mongoIdx = "comments." + i;
        comment = c.findComment(id);
    }
    return comment;
};

Describable.prototype.augmentDescribable = function(describable) {
    classHelper.augment(describable, Describable);
    return describable;
};


exports.Describable = Describable;

})(
   (typeof window !== 'undefined'),
   (typeof exports === 'undefined' || typeof exports === 'DOMWindow') ? this["GruffShared"] = {} : exports
  );
