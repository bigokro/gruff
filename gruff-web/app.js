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
		       title: debate.bestTitleText(),
		       debate:debate
		   }
		   });
    });
});


app.post('/debate/comment/new', function(req, res) {
    debateProvider.addCommentToDebate(req.param('_id'), {
        user: req.param('user'),
        comment: req.param('comment'),
        date: new Date()
    } , function( error, docs) {
        res.redirect('/debate/' + req.param('_id'))
    });
});

app.get('/debate/:id/title', function(req, res) {
    debateProvider.findById(req.params.id, function(error, debate) {
        res.render('debate_titles_show.jade',
		   { locals: {
		       title: debate.bestTitleText(),
		       debate:debate
		   }
		   });
    });
});

app.post('/debate/title/new', function(req, res) {
    debateProvider.addTitleToDebate(req.param('_id'), {
        user: req.param('user'),
        title: req.param('title'),
        date: new Date()
    } , function( error, docs) {
        res.redirect('/debate/' + req.param('_id') + '/title')
    });
});


app.post('/debate/answer/new', function(req, res) {
    debateProvider.addAnswerToDebate(req.param('_id'), {
        user: req.param('user'),
        titles: [{
            user: req.param('user'),
            title: req.param('title'),
            date: new Date()
        }],
        date: new Date()
    }, function( error, docs) {
        res.redirect('/debate/' + req.param('_id'))
    });
});

app.get('/debate/:id/answer/:ansid', function(req, res) {
    debateProvider.findById(req.params.id, function(error, parent) {
        debateProvider.findById(req.params.ansid, function(error, debate) {
            res.render('answer_show.jade',
                       { locals: {
                           parent:parent,
                           debate:debate
		               }
		               });
        });
    });
});

app.post('/debate/argument/new', function(req, res) {
    debateProvider.addArgumentToDebate(req.param('_id'), {
        user: req.param('user'),
        for: req.param('for'),
        titles: [{
            user: req.param('user'),
	    title: req.param('title'),
            date: new Date()
	}],
        date: new Date()
    } , function( error, docs) {
        res.redirect('/debate/' + req.param('_id'))
    });
});

app.get('/debate/:id/argument/:argid', function(req, res) {
    debateProvider.findById(req.params.id, function(error, debate) {
        res.render('argument_show.jade',
		   { locals: {
		       debate:debate,
		       argument:debate.argument(req.params.argid)
		   }
		   });
    });
});



app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
