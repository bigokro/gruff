Debate = function(data) {
    if (data != null)
    this = data;
};

Debate.prototype.DebateTypes = {
    PROBLEM : "Problem",
    ACTION : "Action",
    EVIDENCE : "Evidence"
};

Debate.prototype.bestTitle = function() {
    if (typeof(this.titles)=="undefined") {
	return this.title;
    }
    // Barring a voting algorithm,
    // for now, let's return the latest
    return this.titles[this.titles.length-1];
};

Debate.prototype.bestTitleText = function() {
    var title = this.bestTitle();
    if (title.title === undefined) {
	return title;
    } else {
	return title.title;
    }
};


exports.Debate = Debate;
