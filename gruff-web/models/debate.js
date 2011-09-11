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


exports.Debate = Debate;
