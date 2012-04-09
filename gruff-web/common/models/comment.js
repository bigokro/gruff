(function(isClient, exports){

/* 
 * Provides common features for nestable Google Wave-like comment threads
 * 
 * These comments are represented in JSON as a composition of comments-within comments.
 * A comment is made up of the following properties:
 *  - id: a sequential id representing the unique identifier of the comment in relation to all other comments in the tree
 *  - user: the login of the user that created the comment
 *  - date: the date and time that the comment was created
 *  - tags: an array of tag objects
 *  - upvotes: a list of "votes", consisting of user names that like the comment
 *  - downvotes: a list of "votes", consisting of user names that dislike the comment
 *  - isFor: a boolean indicating whether or not the comment is in favor of its parent comment or debate
 *  - body: an array of text segments. Each segment is made up of the following attributes:
 *    - text: the text itself
 *    - comments: an array of Comments that have been added to the end of the text segment
 * 
 * Ex:
 * {
 *  id: 30, user: "biggusgruffus", date: "3 April, 2012 19:45:03", isFor: true,
 *  upvotes: ["wangston"],
 *  downvotes: ["yomama", "squishybear", "juicybird"],
 *  tags: [ { tag: "wordy" } ],
 *  body: [
 *   { text: "Four score",
 *     comments: [
 *       { id: 37, user: "wangston", date: "3 April, 2012 20:02:13", isFor: true,
 *         upvotes: [],
 *         downvotes: ["squeakypigeon"],
 *         tags: [ { tag: "troll" } ],
 *         body: [
 *           { text: "Just say \"eighty\"! What're ya, French??\""
 *             comments: [
 *               { id: 39, user: "squeakypigeon", date: "3 April, 2012 20:25:23", isFor: false,
 *                 upvotes: [], downvotes: [], tags: [],
 *                 body: [
 *                   { text: "Dude, just lay off. The man is waxing poetic.",
 *                     comments: []
 *                   }
 *                 ]
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   { text: " and seven years ago, our founding fathers set forth...",
 *     comments: []
 *   }
 *  ]
 * }
 */

    if (isClient) {
var ClassHelper = exports.ClassHelper;
    } else {
var ClassHelper = require('../lib/class_helper').ClassHelper;
    }
var classHelper = new ClassHelper();

Comment = function(user, text, isFor) {
        this.id = this.nextId();
        this.user = user;
        this.date = new Date();
        this.isFor = isFor;
        this.upvotes = [];
        this.downvotes = [];
        this.tags = [];
        this.body = [
          {
              text: text,
              comments: []
          }
        ];
};

// Needed to provide compatibility between Backbone and simple Node models
Comment.prototype.safeGet = function(attribute) {
    if (typeof(this.get)==="undefined") {
      return this[attribute];
    } else {
      return this.get(attribute);
    }
};

// Needed to provide compatibility between Backbone and simple Node models
Comment.prototype.safeSet = function(attributes) {
    if (typeof(this.set)==="undefined") {
        for (attr in attributes) {
	          this[attr] = attributes[attr];
        }
    } else {
        this.set(attributes);
    }
};

Comment.prototype.completeText = function() {
    var bodyArr = this.safeGet("body");
    var result = "";
    for (i=0; i < bodyArr.length; i++) {
        result += bodyArr[i].text;
    }
    return result;
};

Comment.prototype.numVotes = function(type) {
    var votesArr = this.safeGet(type);
    if (votesArr === null || !votesArr.length) {
        votesArr = [];
    }
    return votesArr.length;
};

Comment.prototype.numUpvotes = function() {
    return this.numVotes("upvotes");
};

Comment.prototype.numDownvotes = function() {
    return this.numVotes("downvotes");
};

Comment.prototype.score = function() {
    return this.numUpvotes() - this.numDownvotes();
};

Comment.prototype.meetsScoreThreshold = function(threshold) {
    return this.score() >= threshold;
};

Comment.prototype.nextId = function() {
    // TODO: need to segmnt by user or something
    return (new Date()).getTime();
};

Comment.prototype.addComment = function(id, txtIdx, newComment) {
    var textIndex = parseInt(txtIdx);
    console.log("addComment("+id+", "+textIndex+", <newcomment>");
    var comment = this.findComment(id);
    console.log("found comment with id "+comment.id);
    var bodyArr = comment.safeGet("body") || [];
    var i = 0;
    var chars = 0;
    var segment = null;
    for (; i < bodyArr.length && chars < textIndex; i++) {
        console.log("checking segment "+i);
        segment = bodyArr[i];
        chars += segment.text.length;
    }
    var segmentIdx = i-1;
    if (chars === textIndex) {
        console.log("adding comment to segment "+segmentIdx);
        segment.comments = segment.comments.concat(newComment);
    } else {
        console.log("splitting segment "+segmentIdx);
        var newIdx = textIndex - (chars - segment.text.length);
        var firstText = segment.text.substring(0, newIdx);
        var secondText = segment.text.substring(newIdx);
        var firstSegment = {
            text: firstText,
            comments: [ newComment ]
        };
        var secondSegment = {
            text: secondText,
            comments: segment.comments
        };
        var newBodyArr = bodyArr.slice(0, segmentIdx).concat([firstSegment, secondSegment]).concat(bodyArr.slice(segmentIdx+1));
        comment.safeSet({ body: newBodyArr });
    }
};

Comment.prototype.findComment = function(id) {
    if (this.safeGet("id")+"" === id+"") return this;
    var subComments = this.subComments();
    for (var i=0; i < subComments.length; i++) {
        var subComment = this.augmentComment(subComments[i]);
        var result = subComment.findComment(id);
        if (result !== null) return result;
    }
    return null;
};

Comment.prototype.subComments = function() {
    if (typeof(this.mongoIdx) === 'undefined') {
      this.mongoIdx = "";
    }
    var bodyArr = this.safeGet("body") || [];
    var comments = [];
    for (var i=0; i < bodyArr.length; i++) {
        for (var j=0; j < bodyArr[i].comments.length; j++) {
            var comment = bodyArr[i].comments[j];
            comment.mongoIdx = this.mongoIdx + ".body." + i + ".comments." + j;
            comments.push(comment);
        }
    }
    return comments;
};

Comment.prototype.augmentComment = function(comment) {
    classHelper.augment(comment, Comment);
    return comment;
};

exports.Comment = Comment;

})(
   (typeof window !== 'undefined'),
   (typeof exports === 'undefined' || typeof exports === 'DOMWindow') ? this["GruffShared"] = {} : exports
  );
