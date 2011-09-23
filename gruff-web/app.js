/**
 * Module dependencies.
 */

var express = require('express')
  , DebateProvider = require('./providers/debate_provider').DebateProvider
  , Debate = require('./models/debate').Debate
  , everyauth = require('./everyauth.js')
  , port = process.env.NODE_ENV == 'production' ? 80 : 7080
  , routes = require('./routes.js')
  ;

// Configuration

var app = module.exports = express.createServer();

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: ':DP:DP:DP:DP'}));
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(everyauth.everyauth.middleware());
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
app.get('/debates/new', routes.getNewDebate);
app.get('/debates/:id', routes.getDebate);
app.get('/debates/:id/titles', routes.getTitle);
app.get('/debates/:id/descriptions', routes.getDescription);

app.post('/debates/new', routes.postDebate);
app.post('/debates/comments/new', routes.postComment);
app.post('/debates/titles/new', routes.postTitle);
app.post('/debates/descriptions/new', routes.postDescription);
app.post('/debates/answers/new', routes.postAnswer);
app.post('/debates/arguments/new', routes.postArgument);

// Main

everyauth.everyauth.helpExpress(app);
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);