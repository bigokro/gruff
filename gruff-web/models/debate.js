/* 
 * Provides functions for all main types of debates:
 * Multi-answer "Debates",
 * Yes/No debates around an "Answer" (or action or solution),
 * True/False debates around proposed "Facts"
 */

var Identifible = require('./identifiable').Identifiable;
var Describable = require('./describable').Describable;
var Argument = require('./argument').Argument;
var ClassHelper = require('../lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

Debate = function() {
};

Debate.prototype.DebateTypes = {
    DEBATE : "Debate",
    ANSWER : "Answer",
    FACT : "Fact"
};

Debate.prototype.argument = function(argid) {
    for (argument in this.arguments) {
	if (argument.linkableId() == argid) {
	    return argument;
	}
    }
    return null;
};

Debate.prototype.augment = function(argument) {
    return classHelper.augment(argument, Argument);
};

classHelper.augmentClass(Debate, Identifiable);
classHelper.augmentClass(Debate, Describable);

exports.Debate = Debate;
