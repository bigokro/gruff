/**
 * Configuration part one
 */ 
 
process.env.DBNAME = process.env.NODE_ENV == 'production' ? 'gruff' : 'gruff-dev';
var logHome = process.env.NODE_ENV == 'production' ? '/var/log' : '.';

process.on('uncaughtException', function (err) {
  var d = new Date();
  console.log(d.toString());
  console.log(err.stack);
  process.exit();
});

/**
 * Module dependencies.
 */

var express = require('express')
  , DebateProvider = require('./providers/debate_provider').DebateProvider
  , DescribableProvider = require('./providers/describable_provider').DescribableProvider
  , ReferenceProvider = require('./providers/reference_provider').ReferenceProvider
  , UserProvider = require('./providers/user_provider').UserProvider
  , TagProvider = require('./providers/tag_provider').TagProvider
  , Comment = require('./common/models/comment').Comment
  , Debate = require('./common/models/debate').Debate
  , everyauth = require('./everyauth').everyauth
  , fs = require('fs')
  , port = process.env.NODE_ENV == 'production' ? 80 : 7080
  , routes = require('./routes')
  , stylus = require('stylus')
  ;

require('./lib/utils');

// Configuration

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger({stream: fs.createWriteStream(logHome + '/gruff.access.log', { flags: 'a' })}));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: ':DP:DP:DP:DP'}));
  app.use(express.methodOverride());
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  app.use(everyauth.middleware());
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/common'));
  app.use(app.router);
  app.use(express.favicon());
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.get('/debates/new', routes.getNewDebate);
app.get('/debates/:id', routes.getDebate);
app.get('/debates/:id/titles', routes.getDebateTitle);
app.get('/debates/:id/descriptions', routes.getDebateDescription);
app.get('/feed', routes.feed);
app.get('/my/debates', routes.getMyDebates);
app.get('/references/:id', routes.getReference);
app.get('/references/:id/titles', routes.getReferenceTitle);
app.get('/references/:id/descriptions', routes.getReferenceDescription);
app.get('/search', routes.getSearch);
app.get('/tags/:tag', routes.getTaggedItems);

// backbone
app.get('/canvas/:id', routes.canvas);

// blitz.io
app.get('/mu-18cba0e3-0a046521-fdcf6513-860a61a9', function(req, res) {
  res.write("42");
  res.end();
});

// Curation
app.get('/debates/:parentId/moveto/:destination/:debateId', routes.moveDebate);

// status
app.get('/404', routes.handle404);
app.get('/500', routes.handle500);

app.post('/debates/new', routes.postDebate);
app.post('/debates/titles/new', routes.postDebateTitle);
app.post('/debates/descriptions/new', routes.postDebateDescription);
app.post('/debates/answers/new', routes.postAnswer);
app.post('/debates/subdebates/new', routes.postSubdebate);
app.post('/debates/arguments/new', routes.postArgument);
app.post('/references/new', routes.postReference);
app.post('/references/titles/new', routes.postReferenceTitle);
app.post('/references/descriptions/new', routes.postReferenceDescription);
app.get('/:objecttype/:objectid/:attributetype/:attributeid/vote', routes.postDescriptorVote);
app.get('/:objecttype/:objectid/tag/:tag', routes.postTag);
app.get('/:objecttype/:objectid/:attributetype/:attributeid/tag/:tag', routes.postTag);
app.get('/:objecttype/:objectid/tag/:tag/remove', routes.removeTag);
app.get('/:objecttype/:objectid/:attributetype/:attributeid/tag/:tag/remove', routes.removeTag);
app.post('/:objecttype/comments/new', routes.postComment);

// facebook app
app.post('/facebook', routes.postFacebook);

// json
app.get('/rest/user', routes.getCurrentUser);
app.get('/rest/tags', routes.getTagSearch);
app.get('/rest/tags/counts', routes.getTagCounts);
app.get('/rest/:objecttype/:objectid/tag/:tag', routes.getTag);
app.post('/rest/:objecttype/:objectid/tag/:tag', routes.postTag);
app.put('/rest/:objecttype/:objectid/tag/:tag', routes.postTag);
app.delete('/rest/:objecttype/:objectid/tag/:tag', routes.removeTag);
app.post('/rest/:objecttype/:objectid/comments', routes.postComment);
app.post('/rest/:objecttype/:objectid/comments/:commentid/:textidx', routes.postComment);
app.post('/rest/:objecttype/:objectid/comments/:commentid/vote/:vote', routes.voteComment);
app.get('/rest/debates/:id/references', routes.getReferences);
app.post('/rest/debates/:id/references', routes.postReference);
app.get('/rest/debates', routes.getJSONDebates);
app.get('/rest/debates/:id', routes.getJSONDebate);
app.get('/rest/debates/:id/:attributetype', routes.getJSONDebates);
app.get('/rest/debates/:parentid/:attributetype/:id', routes.getJSONDebate);
app.post('/rest/debates/:id', routes.postDebate);
app.post('/rest/debates/:parentid/:attributetype/:id', routes.postDebate);
app.post('/rest/debates/:id/:attributetype', routes.addDebateToDebate);
app.put('/rest/debates/:id', routes.putDebate);
app.put('/rest/debates/:parentid/:attributetype/:id', routes.putDebate);
app.delete('/rest/debates/:id', routes.deleteDebate);
app.delete('/rest/debates/:parentid/:attributetype/:id', routes.deleteDebate);
app.get('/rest/references/:id', routes.getReference);
app.post('/rest/login', routes.postJSONLogin);

// default
app.get('*', routes.handle404);

// Main

everyauth.helpExpress(app);
app.listen(port);
console.log('Gruff listening on port ' + app.address().port + ' in ' + app.settings.env + ' mode');
