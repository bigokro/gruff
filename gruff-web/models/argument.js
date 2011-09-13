/* 
 * Provides functions for arguments
 */

var Identifible = require('./identifiable').Identifiable;
var Describable = require('./describable').Describable;
var ClassHelper = require('../lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

Argument = function() {
};

Argument.prototype.evidence = function(evidenceid) {
    for (e in this.evidence) {
	if (e.linkableId() == argid) {
	    return e;
	}
    }
    return null;
};

classHelper.augmentClass(Argument, Identifiable);
classHelper.augmentClass(Argument, Describable);

exports.Argument = Argument;
