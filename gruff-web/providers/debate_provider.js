var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Debate = require('../models/debate').Debate;
var ClassHelper = require('../lib/class_helper').ClassHelper;
var classHelper = new ClassHelper();

DebateProvider = function(host, port) {
    this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};

DebateProvider.prototype.getCollection= function(callback) {
    this.db.collection('debates', function(error, debate_collection) {
	      if( error ) callback(error);
	      else callback(null, debate_collection);
    });
};

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


DebateProvider.prototype.findById = function(id, callback) {
    this.findByObjID(this.db.bson_serializer.ObjectID.createFromHexString(id), callback);
};

DebateProvider.prototype.findByObjID = function(objId, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	    if( error ) callback(error)
	      else {
            debate_collection.findOne({_id: objId}, function(error, result) {
		            if( error ) callback(error)
                else if (!result) callback(null, null)
		            else {
                    // Pre-load the parent debate
                    provider.findByObjID(result.parentId, function(error, parent) {
		                    if( error ) callback(error)
		                    else {
                            result.parent = parent;
                            // Pre-load any related answers
                            provider.findAllByObjID(result.answerIds, function(error, answers) {
		                            if( error ) callback(error)
		                            else {
                                    result.answers = answers;
                                    // Pre-load any related arguments
                                    provider.findAllByObjID(result.argumentsForIds, function(error, argumentsFor) {
		                                    if( error ) callback(error)
		                                    else {
                                            result.argumentsFor = argumentsFor;
                                            provider.findAllByObjID(result.argumentsAgainstIds, function(error, argumentsAgainst) {
		                                            if( error ) callback(error)
		                                            else {
                                                    result.argumentsAgainst = argumentsAgainst;
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

DebateProvider.prototype.save = function(debates, callback) {
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback(error)
	      else {
            if( typeof(debates.length)=="undefined")
		            debates = [debates];
            
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
            
            debate_collection.insert(debates, function() {
		            callback(null, debates);
            });
	      }
    });
};

DebateProvider.prototype.addCommentToDebate = function(debateId, comment, callback) {
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
	          debate_collection.update(
		            {_id: debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId)},
		            {"$push": {comments: comment}},
		            function(error, debate){
		                if( error ) callback(error);
		                else callback(null, debate)
		            });
	      }
    });
};

DebateProvider.prototype.addTitleToDebate = function(debateId, title, callback) {
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
	          debate_collection.update(
		            {_id: debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId)},
		            {"$push": {titles: title}},
		            function(error, debate){
		                if( error ) callback(error);
		                else callback(null, debate)
		            });
	      }
    });
};

DebateProvider.prototype.addDescriptionToDebate = function(debateId, description, callback) {
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
	          debate_collection.update(
		            {_id: debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId)},
		            {"$push": {descs: description}},
		            function(error, debate){
		                if( error ) callback(error);
		                else callback(null, debate)
		            });
	      }
    });
};

DebateProvider.prototype.addAnswerToDebate = function(debateId, answer, callback) {
    var provider = this;
    this.getCollection(function(error, debate_collection) {
	      if( error ) callback( error );
	      else {
            var parentId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId);
            answer.parentId = parentId;
            provider.save(answer, function(error, answers) {
                // Add the answer as a new debate
                var answerId = answers[0]._id;
	              debate_collection.update(
		                {_id: parentId},
		                {"$push": {answerIds: answerId}},
		                function(error, debate){
		                    if( error ) callback(error);
		                    else callback(null, debate)
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
                // Add the answer as a new debate
                var argumentId = arguments[0]._id;
	              debate_collection.update(
		                {_id: parentId},
		                {"$push": isFor ? {argumentsForIds: argumentId} : {argumentsAgainstIds: argumentId}},
		                function(error, debate){
		                    if( error ) callback(error);
		                    else callback(null, debate)
		                });
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
    return debate;
}

function augmentDebates(results) {
    var debates = [];
    for (var i=0; i < results.length; i++) {
		    // PERF: this is a "deep augmentation". 
		    // Maybe we only need to augment the Debate itself
		    debates[i] = augmentDebate(results[i]);
	  }
    return results;
}

exports.DebateProvider = DebateProvider;