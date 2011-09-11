/**
 * Module dependencies.
 */

var express = require('express');
var DebateProvider = require('./debateprovider-mongodb').DebateProvider;
var Debate = require('./models/debate').Debate;


var app = module.exports = express.createServer();

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

var debateProvider = new DebateProvider('localhost', 27017);

// Routes

app.get('/', function(req, res){
    debateProvider.findAll( function(error,docs){
        res.render('index.jade', { 
            locals: {
                title: 'Gruff',
                debates:docs
            }
        });
    })
});

app.get('/debate/new', function(req, res) {
    res.render('debate_new.jade', { locals: {
        title: 'New Debate',
        debate: new Debate()
    }
				});
});

app.post('/debate/new', function(req, res){
    debateProvider.save({
        title: req.param('title'),
        body: req.param('body'),
        type: req.param('type')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/debate/:id', function(req, res) {
    debateProvider.findById(req.params.id, function(error, debate) {
        res.render('debate_show.jade',
		   { locals: {
		       title: debate.bestTitle(),
		       debate:debate
		   }
		   });
    });
});


app.post('/debate/addComment', function(req, res) {
    debateProvider.addCommentToDebate(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
    } , function( error, docs) {
        res.redirect('/debate/' + req.param('_id'))
    });
});

app.post('/debate/addTitle', function(req, res) {
    debateProvider.addTitleToDebate(req.param('_id'), {
        person: req.param('person'),
        title: req.param('comment'),
        created_at: new Date()
    } , function( error, docs) {
        res.redirect('/debate/' + req.param('_id'))
    });
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
