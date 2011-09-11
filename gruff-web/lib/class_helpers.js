/*
 * Library of general-use helper functions
 * For Javascript OO
 */
ClassHelper = function() {}

/* Augment a class with another class' functions */
ClassHelper.prototype.augmentClass = function (receivingClass, givingClass) {
    if(arguments[2]) { // Only give certain methods.
	for(var i = 2, len = arguments.length; i < len; i++) {
            receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
	}
    }
    else { // Give all methods.
	for(methodName in givingClass.prototype) {
            if(!receivingClass.prototype[methodName]) {
		receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            }
	}
    }
};

/* Augment an object (e.g. JSON data) with another object's functions (e.g. a Model class) */
ClassHelper.prototype.augment = function (receivingObj, givingClass) {
    if(arguments[2]) { // Only give certain methods.
	for(var i = 2, len = arguments.length; i < len; i++) {
            receivingObj[arguments[i]] = givingClass.prototype[arguments[i]];
	}
    }
    else { // Give all methods.
	for(methodName in givingClass.prototype) {
            if(!receivingObj[methodName]) {
		receivingObj[methodName] = givingClass.prototype[methodName];
            }
	}
    }
    return receivingObj;
};

exports.ClassHelper = ClassHelper;

