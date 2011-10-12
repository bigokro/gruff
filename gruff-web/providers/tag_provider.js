/*
 * Persistence methods for tags
 */

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

TagProvider = function(host, port) {
  this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

TagProvider.prototype.getCollection= function(name, callback) {
  this.db.collection(name, function(error, tag_collection) {
	  if( error ) callback(error);
	  else callback(null, tag_collection);
  });
};

TagProvider.prototype.getTagCollection= function(callback) {
  this.db.collection("tags", function(error, tag_collection) {
	  if( error ) callback(error);
	  else callback(null, tag_collection);
  });
};

TagProvider.prototype.addTag = function(objectType, objectId, attributeType, attributeId, login, tag, callback) {
  var provider = this;
  this.getCollection(objectType, function(error, object_collection) {
	  if( error ) callback( error );
	  else {
      var oid = object_collection.db.bson_serializer.ObjectID.createFromHexString(objectId);
      provider.getCollection("users", function(error, user_collection) {
	      if( error ) callback( error );
	      else {
          provider.getTagCollection(function(error, tag_collection) {
	          if( error ) callback( error );
	          else {
              var action = {"$addToSet": { contributed_references : oid } };
              if (objectType == "debates") {
                action = {"$addToSet": { contributed_debates : oid } };
              }
              user_collection.update( {login:login}, action, function(error, user) {
	              if( error ) callback( error );
	              else {
                  var action = {};
                  tag = tag.toLowerCase();
                  switch (attributeType) {
                  case "titles":
                    action["titles."+attributeId+".tags"] = tag;
                    break;
                  case "descriptions":
                    action["descs."+attributeId+".tags"] = tag;
                    break;
                  default:
                    action = { tags : tag };
                  }
                  action = {"$addToSet": action };
	                object_collection.update(
		                {_id: oid},
		                action,
		                function(error){
		                  if( error ) callback(error);
		                  else {
                        var tokens = tag.split(":");
                        var tagType = tokens.length > 1 ? tokens[0] : null;
                        var tagValue = tokens.length > 1 ? tokens[1] : tag;
	                      tag_collection.findOne(
		                      {type: tagType},
		                      function(error, tagsOfType){
		                        if( error ) callback(error);
		                        else {
                              if (!tagsOfType) {
	                              tag_collection.save(
                                  {type: tagType, tags: [tag]},
		                              function(error){
		                                if( error ) callback(error);
		                                else callback(null, tag);
                                  });
                              } else {
	                              tag_collection.update(
		                              {type: tagType},
		                              {"$addToSet": { tags : tagValue } },
		                              function(error){
		                                if( error ) callback(error);
		                                else callback(null, tag);
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
        }
      });
    };
  });
};

exports.TagProvider = TagProvider;