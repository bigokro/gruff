/*
 * Persistence methods for tags
 */

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

TagProvider = function(host, port, debateProvider, referenceProvider) {
  this.db= new Db(process.env.DBNAME, new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
  this.debateProvider = debateProvider;
  this.referenceProvider = referenceProvider;
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

TagProvider.prototype.findAllByTag = function(tag, callback) {
  var results = {};
  var provider = this;
  this.findDebatesByTag(tag, function(error, debates) {
	  if( error ) callback(error);
	  else {
      results.debates = debates;
      provider.findReferencesByTag(tag, function(error, references) {
	      if( error ) callback(error);
	      else {
          results.references = references;
          provider.findTitlesByTag("debates", tag, function(error, debateTitles) {
	          if( error ) callback(error);
	          else {
              results.titles = [];
              results.titles = results.titles.concat(debateTitles);
              provider.findTitlesByTag("references", tag, function(error, referenceTitles) {
	              if( error ) callback(error);
	              else {
                  results.titles = results.titles.concat(referenceTitles);
                  provider.findDescriptionsByTag("debates", tag, function(error, debateDescriptions) {
	                  if( error ) callback(error);
	                  else {
                      results.descriptions = [];
                      results.descriptions = results.descriptions.concat(debateDescriptions);
                      provider.findDescriptionsByTag("references", tag, function(error, referenceDescriptions) {
	                      if( error ) callback(error);
	                      else {
                          results.descriptions = results.descriptions.concat(referenceDescriptions);
                          callback(null, results);
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
    }
  });
};


TagProvider.prototype.findDebatesByTag = function(tag, callback) {
  this.debateProvider.findByTag(tag, function(error, results) {
	  if( error ) callback(error);
	  else callback(null, results);
  });
}

TagProvider.prototype.findReferencesByTag = function(tag, callback) {
  this.referenceProvider.findByTag(tag, function(error, results) {
	  if( error ) callback(error);
	  else callback(null, results);
  });
}

TagProvider.prototype.findTitlesByTag = function(objectType, tag, callback) {
  var provider = objectType == "debates" ? this.debateProvider : this.referenceProvider;
  findTaggedAttributes(objectType, "titles", provider, tag, function(error, results) {
	  if( error ) callback(error);
	  else callback(null, results);
  });
}

TagProvider.prototype.findDescriptionsByTag = function(objectType, tag, callback) {
  var provider = objectType == "debates" ? this.debateProvider : this.referenceProvider;
  findTaggedAttributes(objectType, "descs", provider, tag, function(error, results) {
	  if( error ) callback(error);
	  else callback(null, results);
  });
}

function findTaggedAttributes(objectType, attributeName, provider, tag, callback) {
  provider.getCollection(function(error, provider_collection) {
	  if( error ) callback(error);
	  else {
      var query = {};
      query[attributeName+".tags"] = tag;
      provider_collection.find(query).toArray(function(error, found) {
	      if( error ) callback(error);
	      else {
          var results = [];
          for (i=0; i < found.length; i++) {
            var obj = found[i];
            for (j=0; j < obj[attributeName].length; j++) {
              var attr = obj[attributeName][j];
              if (attr.tags && attr.tags.contains(tag)) {
                attr.parentType = objectType;
                attr.parent = provider.augment(obj);
                results.push(attr);
              }
            }
          }
          callback(null, results);
        }
      });
    }
  });
}

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

TagProvider.prototype.removeTag = function(objectType, objectId, attributeType, attributeId, login, tag, callback) {
  var provider = this;
  this.getCollection(objectType, function(error, object_collection) {
	  if( error ) callback( error );
	  else {
      var oid = object_collection.db.bson_serializer.ObjectID.createFromHexString(objectId);
      provider.getCollection("users", function(error, user_collection) {
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
                  action = {"$pull": action };
	                object_collection.update(
		                {_id: oid},
		                action,
		                function(error){
		                  if( error ) callback(error);
		                  else callback(null, tag);
		                });
	              }
              });
	      }
      });
	  }
  });
}

exports.TagProvider = TagProvider;