/**
 * Module dependencies.
 */

var express = require('express')
  , DebateProvider = require('./debateprovider-mongodb').DebateProvider
  , Debate = require('./models/debate').Debate
  , app = module.exports = express.createServer()
  , port = process.env.NODE_ENV == 'production' ? 80 : 7080
  , routes = require('./routes.js');

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
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
app.get('/debate/new', routes.getNewDebate);
app.get('/debate/:id', routes.getDebate);
app.get('/debate/:id/title', routes.getTitle);
app.get('/debate/:id/answer/:ansid', routes.getAnswer);
app.get('/debate/:id/argument/:argid', routes.getArgument);

app.post('/debate/new', routes.postDebate);
app.post('/debate/comment/new', routes.postComment);
app.post('/debate/title/new', routes.postTitle);
app.post('/debate/answer/new', routes.postAnswer);
app.post('/debate/argument/new', routes.postArgument);

// Main

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);