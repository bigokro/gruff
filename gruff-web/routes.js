// Routes

var debateProvider = new DebateProvider('localhost', 27017)

//GET

exports.index = function(req, res){
  debateProvider.findRecent(10, 0, function(error,docs){
    res.render('index.jade', {
      locals: {
        title: 'Gruff',
        debates:docs
      }
    });
  })
};

exports.getNewDebate = function(req, res) {
  res.render('debate_new.jade', { locals: {
    title: 'New Debate',
    debate: new Debate()
  }});
};

exports.getDebate = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    res.render('debate_show.jade', { locals: {
      title:debate.parent ? debate.parent.bestTitleText() + " - " + debate.bestTitleText() : debate.bestTitleText() ,
      parent:debate.parent,
      debate:debate
    }});
  });
};

exports.getTitle = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    res.render('debate_titles_show.jade', { locals: {
      title:debate.bestTitleText(),
      parent:debate.parent,
      debate:debate
    }});
  });
};

// POST

exports.postDebate = function(req, res){
  debateProvider.save({
    title: req.param('title'),
    ref: req.param('ref'),
    body: req.param('body'),
    type: req.param('type')
  }, function( error, docs) {
    res.redirect('/')
  });
};

exports.postComment = function(req, res) {
  debateProvider.addCommentToDebate(req.param('_id'), {
    user: req.param('user'),
    comment: req.param('comment'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debate/' + req.param('_id'))
  });
};

exports.postTitle = function(req, res) {
  debateProvider.addTitleToDebate(req.param('_id'), {
    user: req.param('user'),
    title: req.param('title'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debate/' + req.param('_id') + '/title')
  });
};

exports.postAnswer = function(req, res) {
  debateProvider.addAnswerToDebate(req.param('_id'), {
    user: req.param('user'),
    ref: req.param('ref'),
    body: req.param('body'),
    titles: [{
      user: req.param('user'),
      title: req.param('title'),
      date: new Date()
    }],
    date: new Date()
  }, function( error, docs) {
    res.redirect('/debate/' + req.param('_id'))
  });
};

exports.postArgument = function(req, res) {
    debateProvider.addArgumentToDebate(req.param('_id'), {
        user: req.param('user'),
        ref: req.param('ref'),
        titles: [{
            user: req.param('user'),
            title: req.param('title'),
            date: new Date()
        }],
        date: new Date()
    }, 
    req.param('isFor') == 'true',
    function( error, docs) {
      res.redirect('/debate/' + req.param('_id'))
    });
};