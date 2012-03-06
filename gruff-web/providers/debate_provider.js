var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Debate = require('../common/models/debate').Debate;
var Reference = require('../common/models/reference').Reference;
var ClassHelper = require('../common/lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

// Utility functions

DebateProvider = function(host, port, describable_provider, reference_provider) {
    this.db= new Db(process.env.DBNAME, new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
    this.describable_provider = describable_provider;
    this.reference_provider = reference_provider;
};

DebateProvider.prototype.getCollection= function(callback) {
    this.db.collection('debates', function(error, debate_collection) {
	      if( error ) callback(error);
	      else callback(null, debate_collection);
    });
};

DebateProvider.prototype.getHistoryCollection= function(callback) {
    this.db.collection('history', function(error, history_collection) {
	      if( error ) callback(error);
	      else callback(null, history_collection);
    });
};

DebateProvider.prototype.getUserCollection= function(callback) {
    this.db.collection('users', function(error, user_collection) {
	      if( error ) callback(error);
	      else callback(null, user_collection);
    });
};


// Finders

DebateProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback(error)
	      else {
            debate_collection.find().toArray(function(error, results) {
		            if( error ) {
		                callback(error);
		            } else {
		                callback(null, augmentDebates(results));
		            }
            });
	      }
    });
};

DebateProvider.prototype.findRecent = function(limit, skip, callback) {
  this.getCollection(function(error, debate_collection) {
    if( error ) callback(error)
    else {
      debate_collection.find({parentId: null}).sort({date: -1}).skip(skip).limit(limit).toArray(function(error, results) {
        if( error ) {
          callback(error);
        } else {
          callback(null, augmentDebates(results));
        }
    });
  }
  });
};

DebateProvider.prototype.findByTag = function(tag, callback) {
  this.getCollection(function(error, debate_collection) {
    if (error) {
      callback(error)
    }
    else {
      debate_collection.find({ tags: tag }).toArray(function(error, results) {
        if (error) {
          callback(error);
        } else {
          callback(null, augmentDebates(results));
        }
      });
    }
  });
};

DebateProvider.prototype.search = function(query, callback) {
    this.getCollection(function(error, debate_collection) {
        if (error) {
            callback(error)
        }
        else {
            // TODO: This is really our first big candidate for a unit test!
            // Which also implies the logic to construct the query should be extracted
            var queryExprs = [];
            var queries = query.split(" ");
            var search = buildSearchQueryExpression(queries);
            if (search.length < 1) {
                callback(null, []);
            }
            debate_collection.find(
                search
            ).toArray(function(error, results) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, augmentDebates(results));
                }
            });
        }
    });
};

// Unit test this sucka!
function buildSearchQueryExpression(tokens) {
  var result = [[]];
  var orCount = 0;
  for (var i=0; i < tokens.length; i++) {
    var token = tokens[i].toLowerCase().trim();
    if (token == 'or') {
      if (i == 0 || i == tokens.length-1) {
        // Just ignore. Toss out "OR" operators at the start or end of the query.
      } else {
        orCount += 1;
        result.push([]);
      }
    } else if (token != '' && token != 'and') {
      var tokenForRegex = token.replace(/[.*+,\/"%!@#$^&()=<>?:;`~|]/g, ""); // "
      var expr = '(.*' + tokenForRegex + '.*)'; 
      var tagexpr = '((.*:)?' + tokenForRegex + ')';
     result[orCount].push(
        { $or: [
          {"titles.title": { $regex : expr, $options: 'i'}},
          {"descs.text": { $regex : expr, $options: 'i'}},
          {"tags": { $regex : tagexpr, $options: 'i'}},
          {"titles.tags": { $regex : tagexpr, $options: 'i'}},
          {"descs.tags": { $regex : tagexpr, $options: 'i'}}
        ]}
      );
    }
  }
  for (var i=0; i < result.length; i++) {
    if (result[i].length > 1) {
      result[i] = { $and: result[i] };
    } else if (result[i].length == 0) {
      result[i] = [];
    } else {
      result[i] = result[i][0];
    }
  }
  return result.length == 1 ? result[0] : { $or: result };
}

DebateProvider.prototype.findById = function(id, callback) {
  try {
    var objId = this.idToObjId(id);
  }
  catch (error) {
    if (error == 'Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters in hex format') {
      // we want a 404 here and not an error
      return callback(null, null);
    }
    else {
      callback(error);
    }
  }
  this.findByObjID(objId, callback);
};

DebateProvider.prototype.findByObjID = function(objId, callback) {
  var provider = this;
  this.getCollection(function(error, debate_collection) {
    if (error) {
      callback(error);
    }
    else {
        debate_collection.findOne({_id: objId}, function(error, result) {
          if (error) {
            callback(error)
          }
          else if (!result) {
            callback(null, null)
          }
          else {
            // Pre-load the parent debate
            provider.findByObjID(result.parentId, function(error, parent) {
              if (error) {
                callback(error)
              }
              else {
                result.parent = parent;
                // Pre-load any related answers
                provider.findAllByObjID(result.answerIds, function(error, answers) {
                  if (error) {
                    callback(error)
                  }
                    else {
                        result.answers = answers;
                        // Pre-load any related subdebates
                        provider.findAllByObjID(result.subdebateIds, function(error, subdebates) {
                            if (error) {
                                callback(error)
                            }
                            else {
                                result.subdebates = subdebates;
                                // Pre-load any related arguments
                                provider.findAllByObjID(result.argumentsForIds, function(error, argumentsFor) {
                                    if (error) {
                                        callback(error)
                                    }
                                    else {
                                        result.argumentsFor = argumentsFor;
                                        provider.findAllByObjID(result.argumentsAgainstIds, function(error, argumentsAgainst) {
                                            if (error) {
                                                callback(error)
                                            }
                                            else {
                                                result.argumentsAgainst = argumentsAgainst;
                                                // Pre-load any related references
                                                provider.reference_provider.findAllByObjID(result, result.referenceIds, function(error, references) {
                                                    if (error) {
                                                        callback(error)
                                                    }
                                                    else {
                                                        result.references = references;
                                                        callback(null, augmentDebate(result));
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
          }
        });
      }
  });
};

DebateProvider.prototype.findAllById = function(ids, callback) {
    var objIds = [];
    for (var id in ids) {
        objIds[objIds.length] = debate_collection.db.bson_serializer.ObjectID.createFromHexString(id);
    }
    this.findAllByObjID(objIds, callback);
}

DebateProvider.prototype.findAllByObjID = function(objIds, callback) {
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback(error)
	      else {
            if (objIds == null || objIds === undefined) callback(null, null);
            else if (objIds.length == 0) callback(null, []);
            else {
                debate_collection.find(
                    {_id: {$in : objIds} }
                ).toArray(function(error, results) {
		                if( error ) {
		                    callback(error);
		                } else {
		                    callback(null, augmentDebates(results));
		                }
                });
            }
	      }
    });
};


DebateProvider.prototype.findAllByIdAndType = function(id, attributeType, callback) {
  try {
    var objId = this.idToObjId(id);
  }
  catch (error) {
    if (error == 'Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters in hex format') {
      // we want a 404 here and not an error
      return callback(null, null);
    }
    else {
      callback(error);
    }
  }
  this.findAllByObjIDAndType(objId, attributeType, callback);
};

DebateProvider.prototype.findAllByObjIDAndType = function(objId, attributeType, callback) {
  var provider = this;
  this.getCollection(function(error, debate_collection) {
    if (error) {
      callback(error)
    }
    else {
      // TODO: no need to load debate - just query for id collection
      debate_collection.findOne({_id: objId}, function(error, result) {
        if (error) {
          callback(error)
        }
        else if (!result) {
          callback(null, null)
        }
        else {
          // Load the debates by attribute
          if (attributeType == 'answers') {
            var ids = result.answerIds;
          } else if (attributeType == 'argumentsFor') {
            var ids = result.argumentsForIds;
          } else if (attributeType == 'argumentsAgainst') {
            var ids = result.argumentsAgainstIds;
          } else if (attributeType == 'subdebates') {
            var ids = result.subdebateIds;
          } else {
            // we want a 404 here and not an error
            return callback(null, null);
          }
          provider.findAllByObjID(ids, function(error, docs) {
            if (error) {
              callback(error)
            }
            else {
              callback(null, docs || []);
            }
          });
        }
      });
    }
  });
};

DebateProvider.prototype.findDebatesForUser = function(login, callback) {
    var provider = this;
    this.getUserCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
            user_collection.findOne({login: login}, function(error, user) {
                if( error ) {
                    callback(error);
                } else {
                    var debates = {};
                    provider.findAllByObjID(user.created_debates, function(error, created) {
                        if( error ) {
                            callback(error);
                        } else {
                            debates.created = created;
                            provider.findAllByObjID(user.contributed_debates, function(error, contributed) {
                                if( error ) {
                                    callback(error);
                                } else {
                                    debates.contributed = contributed;
                                    provider.findAllByObjID(user.voted_debates, function(error, voted) {
                                        if( error ) {
                                            callback(error);
                                        } else {
                                            debates.voted = voted;
		                                        callback(null, debates);
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

DebateProvider.prototype.save = function(debates, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback(error)
	      else {
            provider.getUserCollection(function(error, user_collection) {
	              if( error ) callback(error)
	              else {
                    if( typeof(debates.length)=="undefined")
		                    debates = [debates];
                    var login = debates[0].user;
                    for( var i =0;i< debates.length;i++ ) {
		                    debate = debates[i];
		                    debate.date = new Date();
		                    if (debate.title) {
		                        if (debate.titles === undefined) {
			                          debate.titles = [];
		                        }
		                        debate.titles[debate.titles.length] = { 
                                          user: debate.user,
			                  title: debate.title,
			                  date: new Date()
		                        };
		                        debate.title = null;
		                    }
		                    if (debate.desc) {
		                        if (debate.descs === undefined) {
			                          debate.descs = [];
		                        }
		                        debate.descs[debate.descs.length] = { 
                                user: debate.user,
			                          text: debate.desc,
			                          date: new Date()
		                        };
		                        debate.desc = null;
		                    }
		                    if( debate.type == Debate.prototype.DebateTypes.DEBATE && debate.answerIds === undefined ) {
                            debate.answerIds = [];
                        }
		                    if( debate.type != Debate.prototype.DebateTypes.DEBATE && debate.argumentsForIds === undefined ) {
                            debate.argumentsForIds = [];
                        }
		                    if( debate.type != Debate.prototype.DebateTypes.DEBATE && debate.argumentsAgainstIds === undefined ) {
                            debate.argumentsAgainstIds = [];
                        }
		                    if( debate.comments === undefined ) debate.comments = [];
                    }
                    
                    debate_collection.insert(debates, function(error, results) {
	                      if( error ) callback( error );
	                      else {
                            var ids = [];
                            for (i=0; i < debates.length; i++) {
                                ids.push(debates[i]._id);
                            }
                            user_collection.update( 
                                {login:login}, 
                                {"$addToSet": { created_debates : {$each: ids} } },
                                function(error, user) {
	                                  if( error ) callback( error );
	                                  else {
		                                    callback(null, debates);
                                    }
                                });
                        }
                    });
                }
            });
	      }
    });
};

DebateProvider.prototype.update = function(debate, callback) {
  var mongoDebate = this.prepareForSave(debate);
  var provider = this;
  this.getCollection(function(error, debate_collection) {
    if( error ) callback(error)
    else {
      provider.getUserCollection(function(error, user_collection) {
        if( error ) callback(error)
        else {
          debate_collection.update(
            {_id: mongoDebate._id},
            mongoDebate,
            function(error, result){
              if( error ) callback(error);
              else callback(null, debate)
            }
          );
        }
      });
    }
  });
}
       

DebateProvider.prototype.addAnswerToDebate = function(debateId, answer, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
            var parentId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId);
            answer.parentId = parentId;
            provider.save(answer, function(error, answers) {
                // Add the answer as a new debate
                var doc = answers[0];
                var answerId = doc._id;
	              debate_collection.update(
		                {_id: parentId},
		                {"$push": {answerIds: answerId}},
		                function(error, debate){
		                    if( error ) callback(error);
		                    else callback(null, doc)
		                });
            });
        }
	  });
};

DebateProvider.prototype.addSubdebateToDebate = function(debateId, subdebate, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
            var parentId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId);
            subdebate.parentId = parentId;
            provider.save(subdebate, function(error, subdebates) {
                // Add the subdebate as a new debate
                var doc = subdebates[0];
                var subdebateId = doc._id;
	              debate_collection.update(
		                {_id: parentId},
		                {"$push": {subdebateIds: subdebateId}},
		                function(error, debate){
		                    if( error ) callback(error);
		                    else callback(null, doc)
		                });
            });
        }
	  });
};

DebateProvider.prototype.addArgumentToDebate = function(debateId, argument, isFor, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
            var parentId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId);
            argument.parentId = parentId;
            provider.save(argument, function(error, arguments) {
                var doc = arguments[0];
                // Add the answer as a new debate
                var argumentId = doc._id;
	              debate_collection.update(
		                {_id: parentId},
		                {"$push": (isFor ? {argumentsForIds: argumentId} : {argumentsAgainstIds: argumentId})},
		                function(error, debate){
		                    if( error ) callback(error);
		                    else {
                                      callback(null, doc)
}
		                });
            });
        }
	  });
};

DebateProvider.prototype.addReferenceToDebate = function(debateId, reference, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
            var parentId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId);
            reference.debateId = parentId;
            provider.reference_provider.save(reference, function(error, references) {
                var referenceId = references[0]._id;
	              debate_collection.update(
		                {_id: parentId},
		                {"$push": {referenceIds: referenceId}},
		                function(error, debate){
		                    if( error ) callback(error);
		                    else callback(null, debate);
		                });
            });
        }
	  });
};

DebateProvider.prototype.delete = function(id, callback) {
    var provider = this;
    try {
        var objId = this.idToObjId(id);
    }
    catch (error) {
        if (error == 'Error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters in hex format') {
            // we want a 404 here and not an error
            return callback(null, null);
        }
        else {
            return callback(error);
        }
    }
    this.getCollection(
        function(error, debate_collection) {
	          if( error ) callback( error );
	          else {
                provider.findByObjID(
                    objId,
                    function(error, found) {
                        if (error) {
                            callback(error);
                        }
                        else if (found.hasChildren()) {
                            callback("You cannot delete a debate that has subdebates or references");
                        }
                        else {
                            var debate = found;
	                          debate_collection.remove(
                                {_id: objId}, 
                                function(error, removed) {
		                                if( error ) callback(error);
                                    else if (debate.parentId === null || typeof(debate.parentId) === 'undefined') {
                                        callback(null, debate);
                                    }
		                                else {
                                        provider.removeLink(
                                            objId, 
                                            debate.parentId,
                                            function(error, updated) {
                                                if (error) {
                                                    callback(error);
                                                }
                                                else {
                                                    callback(null, debate);
                                                }
                                            });
                                    }
                                    
                                });
                        }
                    });
            }
        });
};

// TODO: There MUST be a more efficient way to do this
DebateProvider.prototype.removeLink = function(parentId, childId, callback) {
    var provider = this;
    this.getCollection(
        function(error, debate_collection) {
	          if( error ) callback( error );
	          else {
                debate_collection.update(
                    {_id: parentId}, 
                    { $pull: { argumentsForIds: childId }},
                    function(error, updated) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            debate_collection.update(
                                {_id: parentId}, 
                                { $pull: { argumentsAgainstIds: childId }},
                                function(error, updated) {
                                    if (error) {
                                        callback(error);
                                    }
                                    else {
                                        debate_collection.update(
                                            {_id: parentId}, 
                                            { $pull: { answerIds: childId }},
                                            function(error, updated) {
                                                if (error) {
                                                    callback(error);
                                                }
                                                else {
                                                    debate_collection.update(
                                                        {_id: parentId}, 
                                                        { $pull: { subdebateIds: childId }},
                                                        function(error, updated) {
                                                            if (error) {
                                                                callback(error);
                                                            }
                                                            else {
                                                                callback(null, updated);
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

DebateProvider.prototype.mergeDebates = function(userId, redundantId, survivorId, callback) {
    var provider = this;
    var userObjId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(userId);
    var redundantObjId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(redundantId);
    var survivorObjId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(survivorId);
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
            this.getHistoryCollection(function(error, history_collection) {
	              if( error ) callback( error );
	              else {
                    debate_collection.findOne({_id: redundantObjId}, function(error, redundant) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            debate_collection.findOne({_id: survivorObjId}, function(error, survivor) {
                                if (error) {
                                    callback(error);
                                }
                                else {
                                    // Merge debates
                                    survivor.titles.concat(redundant.titles);
                                    survivor.descriptions.concat(redundant.descriptions);
                                    survivor.answerIds.concat(redundant.answerIds);
                                    survivor.subdebateIds.concat(redundant.subdebateIds);
                                    survivor.argumentsForIds.concat(redundant.argumentsForIds);
                                    survivor.argumentsAgainstIds.concat(redundant.argumentsAgainstIds);
                                    survivor.referenceIds.concat(redundant.referenceIds);
                                    survivor.comments.concat(redundant.comments);
                                    
                                    // Save change history
                                    var history = {
                                        type: "merge",
                                        fromId: redundantObjId,
                                        toId: survivorObjId,
                                        date: new Date(),
                                        user: userObjId,
                                        fromObj: redundant
                                    };
                                    history_collection.insert(history, function() {

                                        // Update survivor
	                                      debate_collection.update(
		                                        {_id: survivorObjId},
		                                        survivor,
		                                        function(error, debate){
		                                            if( error ) callback(error);
		                                            else {

                                                    // Delete redundant
	                                                  debate_collection.remove({_id: redundantObjId}, function(error, removed) {
		                                                        if( error ) callback(error);
		                                                        else {
                                                                callback(null, survivor);
                                                            }
                                                    });
                                                }
		                                        });
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


DebateProvider.prototype.moveTo = function(user, movedId, parentId, moveTo, callback) {
  var provider = this;
  var movedObjId = this.idToObjId(movedId);
  var parentObjId = this.idToObjId(parentId);
  this.getCollection(function(error, debate_collection) {
	  if( error ) callback( error );
	  else {
      provider.getHistoryCollection(function(error, history_collection) {
	      if( error ) callback( error );
	      else {
          debate_collection.findOne({_id: movedObjId}, function(error, moved) {
            if (error) {
              callback(error)
            }
            else {
              var oldParentObjId = moved.parentId;
              debate_collection.findOne({_id: oldParentObjId}, function(error, parent) {
                if (error) {
                  callback(error)
                }
                else {
                  // Save change history
                  var history = {
                    type: 'move',
                    parentId: parentObjId,
                    oldParentId: oldParentObjId,
                    movedId: movedObjId,
                    moveTo: moveTo,
                    date: new Date(),
                    user: user,
                    oldParentObj: parent
                  };
                  var moveFrom = "";
                  if (parent.argumentsForIds && parent.argumentsForIds.join(',').indexOf(movedObjId) != -1) {
                    moveFrom = "argumentsFor";
                  } else if (parent.argumentsAgainstIds && parent.argumentsAgainstIds.join(',').indexOf(movedObjId) != -1) {
                    moveFrom = "argumentsAgainst";
                  } else if (parent.subdebateIds && parent.subdebateIds.join(',').indexOf(movedObjId) != -1) {
                    moveFrom = "subdebates";
                  }
                  if (moveFrom != '') {
                    history["movedFrom"] = moveFrom;
                  }
                  history_collection.insert(history, function() {
                    var addAction = "";
                    if (moveTo == 'argumentsFor') {
                      addAction = { $addToSet: { argumentsForIds: movedObjId }};
                    } else if (moveTo == 'argumentsAgainst') {
                      addAction = { $addToSet: { argumentsAgainstIds: movedObjId }};
                    } else if (moveTo == 'subdebates') {
                      addAction = { $addToSet: { subdebateIds: movedObjId }};
                    }
                    debate_collection.update(
                      {_id: parentObjId}, 
                      addAction,
                      function(error, switched) {
                        if (error) {
                          callback(error)
                        }
                        else {
                          var targetId = oldParentObjId;
                          var updateAction = "";
                          if (moveFrom == 'argumentsFor') {
                            updateAction = { $pull: { argumentsForIds: movedObjId }};
                          } else if (moveFrom == 'argumentsAgainst') {
                            updateAction = { $pull: { argumentsAgainstIds: movedObjId }};
                          } else if (moveFrom == 'subdebates') {
                            updateAction = { $pull: { subdebateIds: movedObjId }};
                          } else {
                            targetId = movedObjId;
                            updateAction = { $set: { parentId: parentObjId }};
                          }
                          debate_collection.update(
                            {_id: targetId}, 
                            updateAction,
                            function(error, updated) {
                              if (error) {
                                callback(error)
                              }
                              else {
                                if (oldParentObjId != parentObjId) {
                                  debate_collection.update(
                                    {_id: movedObjId}, 
                                    { $set: { parentId: parentObjId }},
                                    function(error, updated) {
                                      if (error) {
                                        callback(error)
                                      }
                                      else {
                                        callback(null, augmentDebate(parent));
                                      }
                                    });
                                } else {
                                  callback(null, augmentDebate(parent));
                                }
                              }
                            });
                        }
                      });
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



function augmentDebate(result) {
  var debate = classHelper.augment(result, Debate);
  if (debate.answers) {
	  for (answer in debate.answers) {
	    classHelper.augment(answer, Debate);
	  }
  }
  if (debate.argumentsFor) {
	  for (argument in debate.argumentsFor) {
	    classHelper.augment(argument, Debate);
	  }
  }
  if (debate.argumentsAgainst) {
	  for (argument in debate.argumentsAgainst) {
	    classHelper.augment(argument, Debate);
	  }
  }
  if (debate.references) {
	  for (reference in debate.references) {
	    classHelper.augment(reference, Reference);
	  }
  }
  return debate;
}

function augmentDebates(results) {
  if (!results || results == null) return null;
  var debates = [];
  for (var i=0; i < results.length; i++) {
		// PERF: this is a "deep augmentation". 
		// Maybe we only need to augment the Debate itself
		debates[i] = augmentDebate(results[i]);
	}
  return results;
}

DebateProvider.prototype.prepareForSave= function(debate) {
  debate._id = this.idToObjId(debate._id);
  debate.parentId = this.idToObjId(debate.parentId);
  debate.answerIds = this.idsToObjIds(debate.answerIds);
  debate.answers = [];
  debate.argumentsForIds = this.idsToObjIds(debate.argumentsForIds);
  debate.argumentsFor = [];
  debate.argumentsAgainstIds = this.idsToObjIds(debate.argumentsAgainstIds);
  debate.argumentsAgainst = [];
  debate.subdebateIds = this.idsToObjIds(debate.subdebateIds);
  debate.subdebates = [];
  debate.referenceIds = this.idsToObjIds(debate.referenceIds);
  debate.references = [];
  return debate;
}

DebateProvider.prototype.idToObjId= function(id) {
  if (id == null || typeof(id) === 'undefined') return null;
  if (typeof(id) === 'string') {
    return this.db.bson_serializer.ObjectID.createFromHexString(id);
  }
  return id;
}

DebateProvider.prototype.idsToObjIds= function(ids) {
  if (ids == null || typeof(ids) === 'undefined') return [];
  var objIds = [];
  for (var i=0; i < ids.length; i++) {
    objIds.push(this.idToObjId(ids[i]));
  }
  return objIds;
}

DebateProvider.prototype.augment = augmentDebate;
DebateProvider.prototype.augmentAll = augmentDebates;

exports.DebateProvider = DebateProvider;
