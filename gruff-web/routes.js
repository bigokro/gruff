var referenceProvider = new ReferenceProvider('localhost', 27017)
var describableProvider = new DescribableProvider('localhost', 27017)
var debateProvider = new DebateProvider('localhost', 27017, describableProvider, referenceProvider)
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
      title: debate.parent ? debate.parent.bestTitleText() + " - " + debate.bestTitleText() : debate.bestTitleText() ,
      parent: debate.parent,
      debate: debate
    }});
  });
};

exports.getReference = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    res.render('reference_show.jade', { locals: {
        title: reference.debate.bestTitleText() + " - " + reference.bestTitleText(),
        reference: reference
    }});
  });
};

exports.getDebateTitle = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    res.render('titles_show.jade', { locals: {
      type: 'debate',
      title: debate.bestTitleText(),
      parent: debate.parent,
      describable: debate
    }});
  });
};

exports.getDebateDescription = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    res.render('descriptions_show.jade', { locals: {
      type: 'debate',
      title: debate.bestTitleText(),
      parent: debate.parent,
      describable: debate
    }});
  });
};

exports.getReferenceTitle = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    res.render('titles_show.jade', { locals: {
      type: 'reference',
      title: reference.bestTitleText(),
      parent: reference.debate,
      describable: reference
    }});
  });
};

exports.getReferenceDescription = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    res.render('descriptions_show.jade', { locals: {
      type: 'reference',
      title: reference.bestTitleText(),
      parent: reference.debate,
      describable: reference
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
    user: req.user.login,
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
  describableProvider.addDescriptor("debates"
                                    , "title"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        title: req.param('title'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    res.redirect('/debates/' + req.param('_id') + '/titles')
  });
};

exports.postDebateDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("debates"
                                    , "description"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        text: req.param('desc'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
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
      user: req.user.login,
      type: debate.DebateTypes.DEBATE,
      desc: req.param('desc'),
      titles: [{
        user: req.user.login,
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
      user: req.user.login,
      type: debate.DebateTypes.DIALECTIC,
      desc: req.param('desc'),
      titles: [{
        user: req.user.login,
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
    user: req.user.login,
    type: debate.DebateTypes.DIALECTIC,
    desc: req.param('desc'),
    titles: [{
      user: req.user.login,
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
    user: req.user.login,
    url: req.param('url'),
    desc: req.param('desc'),
    titles: [{
      user: req.user.login,
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
    user: req.user.login,
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
  describableProvider.addDescriptor("references"
                                    , "title"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        title: req.param('title'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    res.redirect('/references/' + req.param('_id') + '/titles')
  });
};

exports.postReferenceDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("references"
                                    , "description"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        text: req.param('desc'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    res.redirect('/references/' + req.param('_id') + '/descriptions')
  });
};

exports.postDebateTitleVote = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.voteForDescriptor("debates"
                                         , "title"
                                         , req.params.id
                                         , req.user.login
                                         , req.param('title')
                                         , function( error, docs) {
    res.redirect('/debates/' + req.params.id + '/titles')
  });
};

exports.postDebateDescriptionVote = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.voteForDescriptor("debates"
                                         , "description"
                                         , req.params.id
                                         , req.user.login
                                         , req.param('desc')
                                         , function( error, docs) {
    res.redirect('/debates/' + req.params.id + '/descriptions')
  });
};

exports.postReferenceTitleVote = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.voteForDescriptor("references"
                                         , "title"
                                         , req.params.id
                                         , req.user.login
                                         , req.param('title')
                                         , function( error, docs) {
    res.redirect('/references/' + req.params.id + '/titles')
  });
};

exports.postReferenceDescriptionVote = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.voteForDescriptor("references"
                                         , "description"
                                         , req.params.id
                                         , req.user.login
                                         , req.param('desc')
                                         , function( error, docs) {
    res.redirect('/references/' + req.params.id + '/descriptions')
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