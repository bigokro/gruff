var referenceProvider = new ReferenceProvider('localhost', 27017)
var debateProvider = new DebateProvider('localhost', 27017, referenceProvider)
var describableProvider = new DescribableProvider('localhost', 27017)
var debate = new Debate();

//GET

exports.index = function(req, res){
  debateProvider.findRecent(10, 0, function(error, docs){
    res.render('index.jade', { locals: {
      title: 'Recent Debates',
      debates: docs
    }});
  })
};

exports.getSearch = function(req, res){
    debateProvider.search(req.param('value'), function(error, results) {
        res.render('search_results.jade', { locals: {
            title: 'Search Results',
            results: results
        }});
    });
};

exports.getNewDebate = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
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
  if (bounceAnonymous(req, res)) {
    return;
  }
  debateProvider.save({
    title: req.param('title'),
    url: req.param('url'),
    desc: req.param('desc'),
    type: req.param('type')
  }, function( error, docs) {
    res.redirect('/');
  });
};

exports.postDebateComment = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addComment('debates', req.param('_id'), {
    user: req.param('user'),
    comment: req.param('comment'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debates/' + req.param('_id'))
  });
};

exports.postDebateTitle = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addTitle("debates", req.param('_id'), {
    user: req.param('user'),
    title: req.param('title'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debates/' + req.param('_id') + '/titles')
  });
};

exports.postDebateDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescription("debates", req.param('_id'), {
    user: req.param('user'),
    text: req.param('desc'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/debates/' + req.param('_id') + '/descriptions')
  });
};

exports.postAnswer = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var debate = new Debate();
  if (req.param('type') == 'debate') {
    debateProvider.addSubdebateToDebate(req.param('_id'), {
      user: req.param('user'),
      type: debate.DebateTypes.DEBATE,
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
  }
  else {
    debateProvider.addAnswerToDebate(req.param('_id'), {
      user: req.param('user'),
      type: debate.DebateTypes.DIALECTIC,
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
  }
};

exports.postArgument = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  debateProvider.addArgumentToDebate(req.param('_id'), {
    user: req.param('user'),
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
  if (bounceAnonymous(req, res)) {
    return;
  }
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
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addComment('references', req.param('_id'), {
    user: req.param('user'),
    comment: req.param('comment'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/references/' + req.param('_id'))
  });
};

exports.postReferenceTitle = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addTitle("references", req.param('_id'), {
    user: req.param('user'),
    title: req.param('title'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/references/' + req.param('_id') + '/titles')
  });
};

exports.postReferenceDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescription("references", req.param('_id'), {
    user: req.param('user'),
    text: req.param('desc'),
    date: new Date()
  } , function( error, docs) {
    res.redirect('/references/' + req.param('_id') + '/descriptions')
  });
};

// Helpers

bounceAnonymous = function (req, res) {
  if (! req.loggedIn) {
    console.log('bouncing anonymous user');
    res.redirect('/login');
    return true;
  }
  else {
    return false;
  }
}