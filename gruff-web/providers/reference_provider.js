var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Debate = require('../models/debate').Debate;
var Reference = require('../models/reference').Reference;
var ClassHelper = require('../lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

// Utility Functions

ReferenceProvider = function(host, port) {
    this.db= new Db(process.env.DBNAME, new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};

ReferenceProvider.prototype.getCollection= function(callback) {
    this.db.collection('references', function(error, reference_collection) {
	      if( error ) callback(error);
	      else callback(null, reference_collection);
    });
};

ReferenceProvider.prototype.getDebateCollection= function(callback) {
    this.db.collection('debates', function(error, debate_collection) {
	      if( error ) callback(error);
	      else callback(null, debate_collection);
    });
};

ReferenceProvider.prototype.getUserCollection= function(callback) {
    this.db.collection('users', function(error, user_collection) {
	      if( error ) callback(error);
	      else callback(null, user_collection);
    });
};


// Finders

ReferenceProvider.prototype.findById = function(id, callback) {
    this.findByObjID(this.db.bson_serializer.ObjectID.createFromHexString(id), callback);
};

ReferenceProvider.prototype.findByObjID = function(objId, callback) {
  var provider = this;
  this.getCollection(function(error, reference_collection) {
    if (error) {
      callback(error)
    }
    else {
      reference_collection.findOne({_id: objId}, function(error, result) {
        if (error) {
          callback(error)
        }
        else if (!result) {
          callback(null, null)
        }
        else {
          // Pre-load the debate reference
          provider.getDebateCollection(function(error, debate_collection) {
            if (error) {
              callback(error)
            }
            debate_collection.findOne({_id: result.debateId}, function(error, debate) {
              if (error) {
                callback(error)
              }
              else if (!result) {
                callback(null, null)
              }
              else {
                result.debate = debate;
                callback(null, augmentReference(result));
              }
            });
          });
        }
      });
    }
  });
}

ReferenceProvider.prototype.findAllById = function(debate, ids, callback) {
    var objIds = [];
    for (var id in ids) {
        objIds[objIds.length] = reference_collection.db.bson_serializer.ObjectID.createFromHexString(id);
    }
    this.findAllByObjID(debate, objIds, callback);
}

ReferenceProvider.prototype.findAllByObjID = function(debate, objIds, callback) {
    this.getCollection(function(error, reference_collection) {
	      if( error ) callback(error)
	      else {
            if (objIds == null || objIds === undefined) callback(null, null);
            else if (objIds.length == 0) callback(null, []);
            else {
                reference_collection.find(
                    {_id: {$in : objIds} }
                ).toArray(function(error, results) {
		                if( error ) {
		                    callback(error);
		                } else {
		                    callback(null, augmentReferences(debate, results));
		                }
                });
            }
	      }
    });
};

ReferenceProvider.prototype.findByTag = function(tag, callback) {
  this.getCollection(function(error, reference_collection) {
    if (error) {
      callback(error)
    }
    else {
      reference_collection.find({ tags: tag }).toArray(function(error, results) {
        if (error) {
          callback(error);
        } else {
          callback(null, augmentReferences(results));
        }
      });
    }
  });
};

ReferenceProvider.prototype.findReferencesForUser = function(login, callback) {
    var provider = this;
    this.getUserCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
            user_collection.findOne({login: login}, function(error, user) {
                if( error ) {
                    callback(error);
                } else {
                    var references = {};
                    provider.findAllByObjID(null, user.created_references, function(error, created) {
                        if( error ) {
                            callback(error);
                        } else {
                            references.created = created;
                            provider.findAllByObjID(null, user.contributed_references, function(error, contributed) {
                                if( error ) {
                                    callback(error);
                                } else {
                                    references.contributed = contributed;
                                    provider.findAllByObjID(null, user.voted_references, function(error, voted) {
                                        if( error ) {
                                            callback(error);
                                        } else {
                                            references.voted = voted;
		                                        callback(null, references);
                                        }
                                    });
                                }
                            });
                        };
                    });
                };
            });
        };
    });
};
                    

// Modifiers

ReferenceProvider.prototype.save = function(references, callback) {
    var provider = this;
    this.getCollection(function(error, reference_collection) {
	      if( error ) callback(error)
	      else {
            provider.getUserCollection(function(error, user_collection) {
	              if( error ) callback(error)
	              else {
                    if( typeof(references.length)=="undefined")
		                    references = [references];
                    var login = references[0].user;
                    for( var i =0;i< references.length;i++ ) {
		                    reference = references[i];
		                    reference.date = new Date();
		                    if (reference.title) {
		                        if (reference.titles === undefined) {
			                          reference.titles = [];
		                        }
		                        reference.titles[reference.titles.length] = { 
                                user: reference.user,
			                          title: reference.title,
			                          date: new Date()
		                        };
		                        reference.title = null;
		                    }
		                    if (reference.desc) {
		                        if (reference.descs === undefined) {
			                          reference.descs = [];
		                        }
		                        reference.descs[reference.descs.length] = { 
                                user: reference.user,
			                          text: reference.desc,
			                          date: new Date()
		                        };
		                        reference.desc = null;
		                    }
		                    if( reference.comments === undefined ) reference.comments = [];
                    }
                    
                    reference_collection.insert(references, function(error, results) {
	                      if( error ) callback( error );
	                      else {
                            var ids = [];
                            for (i=0; i < references.length; i++) {
                                ids.push(references[i]._id);
                            }
                            user_collection.update( 
                                {login:login}, 
                                {"$addToSet": { created_references : {$each: ids} } },
                                function(error, user) {
	                                  if( error ) callback( error );
	                                  else {
		                                    callback(null, references);
                                    }
                                });
                        }
                    });
                }
            });
	      }
    });
};


function augmentReference(result) {
  var reference = classHelper.augment(result, Reference);
  if (reference.debate) {
	  classHelper.augment(reference.debate, Debate);
  }
  return reference;
}

function augmentReferences(debate, results) {
  if (!results || results == null) return null;
  var references = [];
  for (var i=0; i < results.length; i++) {
		references[i] = augmentReference(results[i]);
		references[i].debate = debate;
	}
  return results;
}

ReferenceProvider.prototype.augment = augmentReference;
ReferenceProvider.prototype.augmentAll = augmentReferences;

exports.ReferenceProvider = ReferenceProvider;