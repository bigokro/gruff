/**
 * Module dependencies.
 */

var express = require('express')
  , DebateProvider = require('./providers/debate_provider').DebateProvider
  , DescribableProvider = require('./providers/describable_provider').DescribableProvider
  , ReferenceProvider = require('./providers/reference_provider').ReferenceProvider
  , UserProvider = require('./providers/user_provider').UserProvider
  , TagProvider = require('./providers/tag_provider').TagProvider
  , Debate = require('./models/debate').Debate
  , everyauth = require('./everyauth').everyauth
  , fs = require('fs')
  , logStream = fs.createWriteStream('gruff.log')
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
  app.use(express.logger({stream: fs.createWriteStream('gruff.' + Date.now() + '.log')}));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: ':DP:DP:DP:DP'}));
  app.use(express.methodOverride());
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/search', routes.getSearch);
app.get('/debates/new', routes.getNewDebate);
app.get('/debates/:id', routes.getDebate);
app.get('/debates/:id/titles', routes.getDebateTitle);
app.get('/debates/:id/descriptions', routes.getDebateDescription);
app.get('/references/:id', routes.getReference);
app.get('/references/:id/titles', routes.getReferenceTitle);
app.get('/references/:id/descriptions', routes.getReferenceDescription);
app.get('/tags/:tag', routes.getTaggedItems);
app.get('/my/debates', routes.getMyDebates);

app.post('/debates/new', routes.postDebate);
app.post('/debates/comments/new', routes.postDebateComment);
app.post('/debates/titles/new', routes.postDebateTitle);
app.post('/debates/descriptions/new', routes.postDebateDescription);
app.post('/debates/answers/new', routes.postAnswer);
app.post('/debates/subdebates/new', routes.postSubdebate);
app.post('/debates/arguments/new', routes.postArgument);
app.post('/references/new', routes.postReference);
app.post('/references/comments/new', routes.postReferenceComment);
app.post('/references/titles/new', routes.postReferenceTitle);
app.post('/references/descriptions/new', routes.postReferenceDescription);
app.get('/:objecttype/:objectid/:attributetype/:attributeid/vote', routes.postDescriptorVote);
app.get('/:objecttype/:objectid/tag/:tag', routes.postTag);
app.get('/:objecttype/:objectid/:attributetype/:attributeid/tag/:tag', routes.postTag);

// Main

everyauth.helpExpress(app);
app.listen(port);
console.log('Gruff listening on port ' + app.address().port + ' in ' + app.settings.env + ' mode');