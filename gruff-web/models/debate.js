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

classHelper.augmentClass(Debate, Identifiable);
classHelper.augmentClass(Debate, Describable);

exports.Debate = Debate;
