(function(isClient, exports){

/* 
 * Provides functions for references,
 * which are links to external sources,
 * together with a title and a description
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

Reference = function() {
};

classHelper.augmentClass(Reference, Identifiable);
classHelper.augmentClass(Reference, Describable);

exports.Reference = Reference;

})(
   (typeof window !== 'undefined'),
   (typeof exports === 'undefined' || typeof exports === 'DOMWindow') ? this["GruffShared"] = {} : exports
  );
