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
    // Barring a voting algorithm,
    // for now, let's return the latest
    return this.titles[this.titles.length-1];
};

Describable.prototype.bestTitleText = function() {
    var title = this.bestTitle();
    if (title.title === undefined) {
	return title;
    } else {
	return title.title;
    }
};

exports.Describable = Describable;
