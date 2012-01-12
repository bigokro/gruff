(function(exports){

/* 
 * Provides functions for all domain model classes that can be "described"
 * (that is, they have a title and a description that can be chosen by popular vote)
 */

Describable = function() {
};

Describable.prototype.bestTitle = function() {
    if (typeof(this.titles)=="undefined") {
	return this.title;
    }
    var result = this.titles[this.titles.length-1];
    var votes = result != null && result.votes ? result.votes.length : 0;
    for (i=0; i < this.titles.length; i++) {
        var title = this.titles[i];
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
    if (title.title === undefined) {
	return title;
    } else {
	return title.title;
    }
};

Describable.prototype.bestDescription = function() {
    if (!this.descs) {
	      return {
            // TODO: Remove when we wipe out the database
            text: this.body,
            user: this.user,
            date: this.date
        }
    }
    var result = this.descs[this.descs.length-1];
    var votes = result != null && result.votes ? result.votes.length : 0;
    for (i=0; i < this.descs.length; i++) {
        var desc = this.descs[i];
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
    if (description.text === undefined) {
	      return this.body;
    } else {
	      return description.text;
    }
};

Describable.prototype.describableContributionsCount = function() {
  var titleCount = this.titles ? this.titles.length : 0;
  var descCount = this.descs ? this.descs.length : 0;
  var commentCount = this.comments ? this.comments.length : 0;
  return titleCount + descCount + commentCount;
};

Describable.prototype.describableVotesCount = function() {
  var titleVotes = 0;
  if (this.titles && this.titles != null) {
    for (i=0; i < this.titles.length; i++) {
      if (this.titles[i] != null
          && this.titles[i].votes 
          && this.titles[i] != null) titleVotes += this.titles[i].votes.length;
    }
  }
  var descVotes = 0;
  if (this.descs && this.descs != null) {
    for (i=0; i < this.descs.length; i++) {
      if (this.descs[i] != null 
          && this.descs[i].votes 
          && this.descs[i].votes != null) descVotes += this.descs[i].votes.length;
    }
  }
  return titleVotes + descVotes;
};

exports.Describable = Describable;

})(typeof exports === 'undefined'? this["GruffShared"] = {} : exports);
