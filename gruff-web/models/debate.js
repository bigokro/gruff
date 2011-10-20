/* 
 * Provides functions for all main types of debates:
 * Multi-answer "Debates", and
 * Yes/No or True/False debates around a "Dialectic"
 */

var Identifible = require('./identifiable').Identifiable;
var Describable = require('./describable').Describable;
var ClassHelper = require('../lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

Debate = function() {
};

Debate.prototype.DebateTypes = {
    DEBATE : "Debate",
    DIALECTIC : "Dialectic"
};


Debate.prototype.contributionsCount = function() {
  var describableCount = this.describableContributionsCount();
  var referenceCount = this.countItems("references");
  var answerCount = this.countItems("answers");
  var forCount = this.countItems("argumentsFor");
  var againstCount = this.countItems("argumentsAgainst");
  var subdebateCount = this.countItems("subdebates");
  return describableCount + referenceCount + answerCount + forCount + againstCount + subdebateCount;
};


Debate.prototype.votesCount = function() {
  var describableVotes = this.describableVotesCount();
  return describableVotes;
};


Debate.prototype.countItems = function(attribute) {
  return this[attribute] ? this[attribute].length : 0;
}

Debate.prototype.titleLink = function() {
  var href = "/debates/"+this.linkableId();
  var titleStr = this.contributionsCount()+" contributions, "+this.votesCount()+" votes";
  return '<a href="'+href+'" title="'+titleStr+'">'+this.bestTitleText()+'</a>';

}

classHelper.augmentClass(Debate, Identifiable);
classHelper.augmentClass(Debate, Describable);


exports.Debate = Debate;
