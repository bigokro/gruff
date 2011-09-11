var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Debate = require('./models/debate').Debate;
var ClassHelper = require('./lib/class_helpers').ClassHelper;
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
		if( error ) callback(error)
		else callback(null, results)
            });
	}
    });
};


DebateProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, debate_collection) {
	if( error ) callback(error)
	else {
            debate_collection.findOne({_id: debate_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
		if( error ) callback(error)
		else callback(null, classHelper.augment(result, Debate))
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
		debate.created_at = new Date();
		if (debate.title) {
		    if (debate.titles === undefined) {
			debate.titles = [];
		    }
		    debate.titles[debate.titles.length] = { 
			title: debate.title,
			created_at: new Date()
		    };
		    debate.title = null;
		}
		if( debate.comments === undefined ) debate.comments = [];
		for(var j =0;j< debate.comments.length; j++) {
		    debate.comments[j].created_at = new Date();
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

exports.DebateProvider = DebateProvider;
