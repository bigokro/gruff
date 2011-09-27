var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

DescribableProvider = function(host, port) {
    this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};

DescribableProvider.prototype.getCollection= function(name, callback) {
    this.db.collection(name, function(error, describable_collection) {
	      if( error ) callback(error);
	      else callback(null, describable_collection);
    });
};

DescribableProvider.prototype.addComment = function(type, describableId, comment, callback) {
    this.getCollection(type, function(error, describable_collection) {
	      if( error ) callback( error );
	      else {
	          describable_collection.update(
		            {_id: describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId)},
		            {"$push": {comments: comment}},
		            function(error, describable){
		                if( error ) callback(error);
		                else callback(null, describable)
		            });
	      }
    });
};

DescribableProvider.prototype.addTitle = function(type, describableId, title, callback) {
    this.getCollection(type, function(error, describable_collection) {
	      if( error ) callback( error );
	      else {
	          describable_collection.update(
		            {_id: describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId)},
		            {"$push": {titles: title}},
		            function(error, describable){
		                if( error ) callback(error);
		                else callback(null, describable)
		            });
	      }
    });
};

DescribableProvider.prototype.addDescription = function(type, describableId, description, callback) {
    this.getCollection(type, function(error, describable_collection) {
	      if( error ) callback( error );
	      else {
	          describable_collection.update(
		            {_id: describable_collection.db.bson_serializer.ObjectID.createFromHexString(describableId)},
		            {"$push": {descs: description}},
		            function(error, describable){
		                if( error ) callback(error);
		                else callback(null, describable)
		            });
	      }
    });
};

exports.DescribableProvider = DescribableProvider;