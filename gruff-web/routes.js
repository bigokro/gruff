var referenceProvider = new ReferenceProvider('localhost', 27017)
var debateProvider = new DebateProvider('localhost', 27017, referenceProvider)
var describableProvider = new DescribableProvider('localhost', 27017)

//GET

exports.index = function(req, res){
  debateProvider.findRecent(10, 0, function(error, docs){
    res.render('index.jade', { locals: {
      title: 'Gruff',
      debates:docs
    }});
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

exports.getReference = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    res.render('reference_show.jade', { locals: {
        title: reference.debate.bestTitleText() + " - " + reference.bestTitleText(),
        reference:reference
    }});
  });
};

exports.getDebateTitle = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    res.render('titles_show.jade', { locals: {
      type: 'debate',
      title:debate.bestTitleText(),
      parent:debate.parent,
      describable:debate
    }});
  });
};

exports.getDebateDescription = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    res.render('descriptions_show.jade', { locals: {
      type: 'debate',
      title:debate.bestTitleText(),
      parent:debate.parent,
      describable:debate
    }});
  });
};

exports.getReferenceTitle = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    res.render('titles_show.jade', { locals: {
      type: 'reference',
      title:reference.bestTitleText(),
      parent:reference.debate,
      describable:reference
    }});
  });
};

exports.getReferenceDescription = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    res.render('descriptions_show.jade', { locals: {
      type: 'reference',
      title:reference.bestTitleText(),
      parent:reference.debate,
      describable:reference
    }});
  });
};

// POST

exports.postDebate = function(req, res){
  debateProvider.save({
    title: req.param('title'),
    url: req.param('url'),
    desc: req.param('desc'),
    type: req.param('type')
  }, function( error, docs) {
    res.redirect('/')
  });
};

exports.postDebateComment = function(req, res) {
  describableProvider.addComment('debates', req.param('_id'), {
    user: req.param('user'),
    comment: req.param('comment'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debates/' + req.param('_id'))
  });
};

exports.postDebateTitle = function(req, res) {
  describableProvider.addTitle("debates", req.param('_id'), {
    user: req.param('user'),
    title: req.param('title'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debates/' + req.param('_id') + '/titles')
  });
};

exports.postDebateDescription = function(req, res) {
  describableProvider.addDescription("debates", req.param('_id'), {
    user: req.param('user'),
    text: req.param('desc'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debates/' + req.param('_id') + '/descriptions')
  });
};

exports.postAnswer = function(req, res) {
    var debate = new Debate();
    debateProvider.addAnswerToDebate(req.param('_id'), {
        user: req.param('user'),
        url: req.param('url'),
        type: req.param('type') ? debate.DebateTypes.DEBATE : debate.DebateTypes.DIALECTIC,
        desc: req.param('desc'),
        titles: [{
            user: req.param('user'),
            title: req.param('title'),
            date: new Date()
        }],
        date: new Date()
    }, function( error, docs) {
        res.redirect('/debates/' + req.param('_id'))
    });
};

exports.postArgument = function(req, res) {
    debateProvider.addArgumentToDebate(req.param('_id'), {
        user: req.param('user'),
        url: req.param('url'),
        type: debate.DebateTypes.DIALECTIC,
        desc: req.param('desc'),
        titles: [{
            user: req.param('user'),
            title: req.param('title'),
            date: new Date()
        }],
        date: new Date()
    }, 
    req.param('isFor') == 'true',
    function( error, docs) {
      res.redirect('/debates/' + req.param('_id'))
    });
}

exports.postReference = function(req, res) {
    debateProvider.addReferenceToDebate(req.param('_id'), {
        user: req.param('user'),
        url: req.param('url'),
        desc: req.param('desc'),
        titles: [{
            user: req.param('user'),
            title: req.param('title'),
            date: new Date()
        }],
        date: new Date()
    },
    function( error, docs) {
      res.redirect('/debates/' + req.param('_id'))
    });
};

exports.postReferenceComment = function(req, res) {
  describableProvider.addComment('references', req.param('_id'), {
    user: req.param('user'),
    comment: req.param('comment'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/references/' + req.param('_id'))
  });
};

exports.postReferenceTitle = function(req, res) {
  describableProvider.addTitle("references", req.param('_id'), {
    user: req.param('user'),
    title: req.param('title'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/references/' + req.param('_id') + '/titles')
  });
};

exports.postReferenceDescription = function(req, res) {
  describableProvider.addDescription("references", req.param('_id'), {
    user: req.param('user'),
    text: req.param('desc'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/references/' + req.param('_id') + '/descriptions')
  });
};

