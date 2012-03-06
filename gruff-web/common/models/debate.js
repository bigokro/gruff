(function(isClient, exports){

/* 
 * Provides functions for all main types of debates:
 * Multi-answer "Debates", and
 * Yes/No or True/False debates around a "Dialectic"
 */

    if (isClient) {
var Identifible = exports.Identifiable;
var Describable = exports.Describable;
var ClassHelper = exports.ClassHelper;
    } else {
var Identifible = require('./identifiable').Identifiable;
var Describable = require('./describable').Describable;
var ClassHelper = require('../lib/class_helper').ClassHelper;
    }
var classHelper = new ClassHelper();

Debate = function() {
};

// Needed to provide compatibility between Backbone and simple Node models
Debate.prototype.safeGet = function(attribute) {
    if (typeof(this.get)==="undefined") {
      return this[attribute];
    } else {
      return this.get(attribute);
    }
};

Debate.prototype.DebateTypes = {
    DEBATE : "Debate",
    DIALECTIC : "Dialectic"
};


Debate.prototype.contributionsCount = function() {
  var describableCount = this.describableContributionsCount();
  var referenceCount = this.countItems("referenceIds");
  var answerCount = this.countItems("answerIds");
  var forCount = this.countItems("argumentsForIds");
  var againstCount = this.countItems("argumentsAgainstIds");
  var subdebateCount = this.countItems("subdebateIds");
  return describableCount + referenceCount + answerCount + forCount + againstCount + subdebateCount;
};


Debate.prototype.votesCount = function() {
  var describableVotes = this.describableVotesCount();
  return describableVotes;
};


Debate.prototype.countItems = function(attribute) {
  return this[attribute] && this[attribute] != null ? this[attribute].length : 0;
};

Debate.prototype.titleLink = function() {
  var href = "/debates/"+this.linkableId();
  var titleStr = this.contributionsCount()+" contributions, "+this.votesCount()+" votes";
  return '<a href="'+href+'" title="'+titleStr+'">'+this.bestTitleText()+'</a>';
};

Debate.prototype.hasChildren = function() {
  var fields = [
    "argumentsForIds"
    , "argumentsAgainstIds"
    , "answerIds"
    , "subdebateIds"
    , "referenceIds"
  ];
  var count = 0;
  for (i=0; i < fields.length; i++) {
    var field = this.safeGet(fields[i]);
    if (typeof(field) !== 'undefined' 
        && field !== null
        && typeof(field.length) !== 'undefined'
        && field.length !== null) {
        count += field.length;
    }
  }
  return count > 0;
};

Debate.prototype.stripChildren = function() {
  this.argumentsFor = null;
  this.argumentsAgainst = null;
  this.answers = null;
  this.subdebates = null;
  this.parent = null;
  this.references = null;
  return this;
};

classHelper.augmentClass(Debate, Identifiable);
classHelper.augmentClass(Debate, Describable);


exports.Debate = Debate;

})(
   (typeof window !== 'undefined'),
   (typeof exports === 'undefined' || typeof exports === 'DOMWindow') ? this["GruffShared"] = {} : exports
  );
