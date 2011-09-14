var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Debate = require('./models/debate').Debate;
var Argument = require('./models/argument').Argument;
var ClassHelper = require('./lib/class_helper').ClassHelper;
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
		    var debates = [];
                    for (var i=0; i < results.length; i++) {
			// PERF: this is a "deep augmentation". 
			// Maybe we only need to augment the Debate itself
			debates[debates.length] = augmentDebate(results[i]);
		    }
		    callback(null, debates);
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
		        else {
                    if (result.answerIds !== undefined)  {
                        // Pre-load any related answers
                        provider.findAllByObjID(result.answerIds, function(error, answers) {
		                    if( error ) callback(error)
		                    else {
                                result.answers = answers;
                                callback(null, augmentDebate(result));
                            }
                        });
                    } else {
                        callback(null, augmentDebate(result));
                    }
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
            debate_collection.find(
                {_id: {$in : objIds} }
            ).toArray(function(error, results) {
		        if( error ) {
		            callback(error);
		        } else {
		            var debates = [];
                    for (var i=0; i < results.length; i++) {
			            // PERF: this is a "deep augmentation". 
			            // Maybe we only need to augment the Debate itself
			            debates[debates.length] = augmentDebate(results[i]);
		            }
		            callback(null, debates);
		        }
            });
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
		        if( debate.type == Debate.prototype.DebateTypes.DEBATE && debate.answers === undefined ) {
                    debate.answers = [];
                    debate.answerIds = [];
                }
		        if( debate.type == Debate.prototype.DebateTypes.ANSWER && debate.arguments === undefined ) debate.arguments = [];
		        if( debate.comments === undefined ) debate.comments = [];
		        for(var j =0;j< debate.comments.length; j++) {
		            debate.comments[j].date = new Date();
		        }
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

DebateProvider.prototype.addAnswerToDebate = function(debateId, answer, callback) {
    var provider = this;
    this.save(answer, function(error, answers) {
        var answerId = answers[0]._id;
        provider.getCollection(function(error, debate_collection) {
	        if( error ) callback( error );
	        else {
                // Add the answer as a new debate
                var parentId = debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId);
                answer.parentId = parentId;
	            debate_collection.update(
		            {_id: parentId},
		            {"$push": {answerIds: answerId}},
		            function(error, debate){
		                if( error ) callback(error);
		                else callback(null, debate)
		            });
            }
        });
	});
};

DebateProvider.prototype.addArgumentToDebate = function(debateId, argument, callback) {
    this.getCollection(function(error, debate_collection) {
	    if( error ) callback( error );
	    else {
	        debate_collection.update(
		        {_id: debate_collection.db.bson_serializer.ObjectID.createFromHexString(debateId)},
		        {"$push": {arguments: argument}},
		        function(error, debate){
		            if( error ) callback(error);
		            else callback(null, debate)
		        });
	    }
    });
};


function augmentDebate(result) {
    var debate = classHelper.augment(result, Debate);
    if (debate.arguments) {
	for (argument in debate.arguments) {
	    classHelper.augment(argument, Argument);
	}
    }
    return debate;
}


exports.DebateProvider = DebateProvider;
