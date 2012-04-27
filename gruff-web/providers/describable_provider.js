/*
 * See models/describable.js for an explanation of what a describable is
 * Currently, the two types are "debate" and "reference"
 *
 * This provider introduces a new DRY concept: descriptor
 * Since just about every action here is nearly identical for both
 * titles and descriptions, we try to use one method to handle both types.
 */

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Describable = require('../common/models/describable').Describable;
var Comment = require('../common/models/comment').Comment;
var Comment = require('../common/models/user').User;
var ClassHelper = require('../common/lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();
var _u = require("../public/javascript/underscore");

DescribableProvider = function(host, port) {
  this.db= new Db(process.env.DBNAME, new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

DescribableProvider.prototype.getCollection= function(name, callback) {
  this.db.collection(name, function(error, describable_collection) {
	  if( error ) callback(error);
	  else callback(null, describable_collection);
  });
};

DescribableProvider.prototype.addComment = function(type, describableId, commentId, txtIdx, comment, callback) {
  this.getCollection(type, function(error, describable_collection) {
	  if( error ) callback( error );
	  else {
      var objId = describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId);
      if (!commentId || commentId === null) {
        console.log("no comment id - adding to list of debate comments");
  	    describable_collection.update(
	  	    {_id: objId },
		      {"$push": {comments: comment}},
		      function(error, describable){
		        if( error ) callback(error);
		        else callback(null, comment);
		      });
      } else {
        console.log("comment id provided - loading debate");
        describable_collection.findOne({_id: objId}, function(error, result) {
          if( error ) callback(error);
	        else {
            classHelper.augment(result, Describable);
            var parentComment = result.findComment(commentId);
            if (parentComment === null) {
              console.log("couldn't find a matching subcomment");
              callback(null, null);
            } else {
                console.log("subcomment found: " + parentComment.mongoIdx);
                parentComment.addComment(commentId, txtIdx, comment);
                console.log("finished add comment");
                console.log(JSON.stringify(parentComment));
                var updateCmd = {};
                updateCmd["$set"] = {};
                updateCmd["$set"][parentComment.mongoIdx] = parentComment;
                describable_collection.update(
                {_id: objId},
                    updateCmd,
                    function(error, updateResult) {
                        if( error ) callback(error);
	                      else {
                            callback(null, parentComment);
                        }                    
                    }
                );
            }
          }
        });
      }
	  }
  });
};

DescribableProvider.prototype.voteComment = function(describableType, describableId, commentId, user, vote, callback) {
  var provider = this;
  this.getCollection(describableType, function(error, describable_collection) {
	  if( error ) callback( error );
	  else {
      var objId = describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId);
      var userObjId = user["_id"];
      provider.getCollection("users", function(error, user_collection) {
	      if( error ) callback( error );
	      else {
          var action = {"$addToSet": { voted_references : objId } };
          if (describableType == "debates") {
            action = {"$addToSet": { voted_debates : objId } };
          }
          user_collection.update( {_id:userObjId}, action, function(error, result) {
	          if( error ) callback( error );
	          else {
              describable_collection.findOne({_id: objId}, function(error, result) {
                if( error ) callback(error);
      	        else {
                  classHelper.augment(result, Describable);
                  var comment = result.findComment(commentId);
                  if (comment === null) {
                    callback(null, null);
                  } else {
                    classHelper.augment(user, User);
                    var uniqueName = user.uniqueName();
                    var addCollection = vote === "up" ? "upvotes" : "downvotes";
                    var removeCollection = vote === "up" ? "downvotes" : "upvotes";
                    var removeCmd = {};
                    removeCmd["$pull"] = {};
                    removeCmd["$pull"][comment.mongoIdx + "." + removeCollection] = uniqueName;
                    var addCmd = {};
                    addCmd["$addToSet"] = {};
                    addCmd["$addToSet"][comment.mongoIdx + "." + addCollection] = uniqueName;
                    describable_collection.update(
                      {_id: objId},
                      removeCmd,
                      function(error, removeResult) {
                        if( error ) callback(error);
	                      else {
                          describable_collection.update(
                            {_id: objId},
                            addCmd,
                            function(error, addResult) {
                              if( error ) callback(error);
	                            else {
                                comment[addCollection].push(uniqueName);
                                comment[addCollection] = _u.uniq(comment[addCollection]);
                                    for (var i = 0; i < comment[addCollection].length; i++) {
                                        console.log(addCollection + ": " + comment[addCollection][i] + " " + (comment[addCollection][i].constructor+"").substring(0,20));
                                    }
                                comment[removeCollection] = _u.without(comment[removeCollection], uniqueName);
                                    for (var i = 0; i < comment[removeCollection].length; i++) {
                                        console.log(removeCollection + ": " + comment[removeCollection][i] + " " + (comment[removeCollection][i].constructor+"").substring(0,20));
                                    }
                                  console.log("done");
                                callback(null, comment);
                              }                    
                            });
                        }                    
                      });
                  }
                }
              });
            }
		      });
    	  }
      });
 	  }
  });
};

DescribableProvider.prototype.addDescriptor = function(describableType, descriptorType, describableId, login, descriptor, callback) {
  var provider = this;
  this.getCollection(describableType, function(error, describable_collection) {
	  if( error ) callback( error );
	  else {
      var id = describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId);
      provider.getCollection("users", function(error, user_collection) {
	      if( error ) callback( error );
	      else {
          var action = {"$addToSet": { contributed_references : id } };
          if (describableType == "debates") {
            var action = {"$addToSet": { contributed_debates : id } };
          }
          user_collection.update( {login:login}, action, function(error, user) {
	          if( error ) callback( error );
	          else {
              var action = descriptorType == "titles" ? {"$push": {titles: descriptor}} : {"$push": {descs: descriptor}};
	            describable_collection.update(
		            {_id: id},
		            action,
		            function(error){
		              if( error ) callback(error);
		              else {
                    describable_collection.findOne({_id: id}, function(error, result) {
		                  if( error ) callback(error);
		                  else {
                        var arrayField = descriptorType == "titles" ? "titles" : "descs";
                        var textField = descriptorType == "titles" ? "title" : "text";
                        var descriptorText = descriptor[textField];
                        var descriptorArr = result[arrayField];
                        var descriptorId = descriptorArr.length-1;
                        for (; descriptorId >= 0; descriptorId--) {
                          if (descriptorText == descriptorArr[descriptorId][textField]) break;
                        }
                        provider.voteForDescriptor(describableType, describableId, descriptorType, descriptorId, login, function(error, voted) {
		                      if( error ) callback(error);
		                      else callback(null, voted);
		                    });
	                    }
		                });
	                }
                });
	          }
          });
	      }
      });
    }
  });
};

DescribableProvider.prototype.voteForDescriptor = function(describableType, describableId, descriptorType, descriptorId, login, callback) {
  var provider = this;
  this.getCollection(describableType, function(error, describable_collection) {
	  if( error ) callback( error );
	  else {
      var id = describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId);
      provider.getCollection("users", function(error, user_collection) {
	      if( error ) callback( error );
	      else {
          var action = {"$addToSet": { voted_references : id } };
          if (describableType == "debates") {
            var action = {"$addToSet": { voted_debates : id } };
          }
          user_collection.update( {login:login}, action, function(error, user) {
	          if( error ) callback( error );
	          else {
              var finder = descriptorType == "titles" ? {"titles.votes": login} : {"descs.votes": login};
              var action = descriptorType == "titles" ? {"$pull": {"titles.$.votes": login}} : {"$pull": {"descs.$.votes": login}};
	            describable_collection.update(
		            finder,
		            action,
		            function(error, describable){
		              if( error ) callback(error);
		              else {
                    var action = {};
                    if (descriptorType == "titles") {
                      action["titles."+descriptorId+".votes"] = login;
                    } else {
                      action["descs."+descriptorId+".votes"] = login;
                    }
                    action = {"$addToSet": action };
	                  describable_collection.update(
		                  {_id: id},
		                  action,
		                  function(error, describable){
		                    if( error ) callback(error);
		                    else callback(null, describable)
		                  });
                  }
		            });
            }
		      });
        }
		  });
	  }
  });
};

exports.DescribableProvider = DescribableProvider;