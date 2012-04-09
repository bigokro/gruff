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
var ClassHelper = require('../common/lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

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
      if (commentId === null) {
        console.log("no comment id - adding to list of debate comments");
  	    describable_collection.update(
	  	    {_id: objId },
		      {"$push": {comments: comment}},
		      function(error, describable){
		        if( error ) callback(error);
		        else callback(null, describable);
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