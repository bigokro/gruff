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

Describable.prototype.bestDescription = function() {
    if (!this.descs) {
	      return {
            // TODO: Remove when we wipe out the database
            text: this.body,
            user: this.user,
            date: this.date
        }
    }
    // Barring a voting algorithm,
    // for now, let's return the latest
    return this.descs[this.descs.length-1];
};

Describable.prototype.bestDescriptionText = function() {
    var description = this.bestDescription();
    if (description.text === undefined) {
	      return this.body;
    } else {
	      return description.text;
    }
};

exports.Describable = Describable;
