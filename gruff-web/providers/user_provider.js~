var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

UserProvider = function(host, port) {
  this.db= new Db(process.env.DBNAME, new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

UserProvider.prototype.getCollection= function(callback) {
  this.db.collection('users', function(error, user_collection) {
    if( error ) {
        callback(error);
    }
    else {
      callback(null, user_collection);
    }
  });
};

UserProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, user_collection) {
    if( error ) {
      callback(error)
    }
    else {
      user_collection.find().toArray(function(error, results) {
        if( error ) {
          callback(error);
        }
        else {
          callback(null, results);
        }
      });
    }
  });
};

UserProvider.prototype.findById = function(id, callback) {
  this.findByObjID(this.db.bson_serializer.ObjectID.createFromHexString(id), callback);
};

UserProvider.prototype.findByObjID = function(objId, callback) {
  var provider = this;
  this.getCollection(function(error, user_collection) {
    if( error ) {
      callback(error)
    }
    else {
      user_collection.findOne({_id: objId}, function(error, result) {
        if( error ) {
          callback(error)
        }
        else {
          result.id = result._id;
          callback(null, result);
        }
      });
    }
  });
};

UserProvider.prototype.findAllById = function(ids, callback) {
  var objIds = [];
  for (var id in ids) {
    objIds[objIds.length] = user_collection.db.bson_serializer.ObjectID.createFromHexString(id);
  }
  this.findAllByObjID(objIds, callback);
}

UserProvider.prototype.findAllByObjID = function(objIds, callback) {
  this.getCollection(function(error, user_collection) {
    if( error ) {
      callback(error)
    }
    else {
      if (objIds == null || objIds === undefined) {
        callback(null, null);
      }
      else if (objIds.length == 0) {
        callback(null, []);
      }
      else {
        user_collection
          .find({_id: {$in : objIds} })
          .toArray(function(error, results) {
            if( error ) {
                callback(error);
            }
              else {
                  callback(null, results);
              }
          });
      }
    }
  });
};

UserProvider.prototype.findByKey = function(value, key, callback) {
  this.getCollection(function(error, user_collection) {
    if (error) {
      callback(error)
    }
    else {
      var search = {};
      search[key] = {
        $regex: '^'+value+'$',
        $options: 'i'
      };
      user_collection.findOne(search, function(error, result) {
        if (error) {
          callback(error)
        }
        else if (!result) {
          callback();
        }
        else {
          callback(null, result);
        }
      });
    }
  });
};

UserProvider.prototype.save = function(users, callback) {
  this.getCollection(function(error, user_collection) {
    if (error) {
      callback(error)
    }
    else {
      if( typeof(users.length)=="undefined") {
        users = [users];
      }
      for( var i =0; i< users.length; i++ ) {
        user = users[i];
      }
      user_collection.insert(users, function() {
        callback(null, users);
      });
    }
  });
};

exports.UserProvider = UserProvider;
