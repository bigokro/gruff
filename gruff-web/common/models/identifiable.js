(function(exports){

/* 
 * Provides functions for any domain model that can have an id
 * (as generated by MongoDB)
 */

Identifiable = function() {
};

// Needed to provide compatibility between Backbone and simple Node models
Identifiable.prototype.safeGet = function(attribute) {
    if (typeof(this[attribute])==="undefined") {
	return this.get(attribute);
    } else {
	return this[attribute];
    }
}

Identifiable.prototype.linkableId = function() {
    var id = this.safeGet("_id");
    //return this.safeGet("_id").toHexString();
    return id;
};


exports.Identifiable = Identifiable;

})(typeof exports === 'undefined'? this["GruffShared"] = {} : exports);