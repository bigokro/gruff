var referenceProvider = new ReferenceProvider('localhost', 27017)
var describableProvider = new DescribableProvider('localhost', 27017)
var debateProvider = new DebateProvider('localhost', 27017, describableProvider, referenceProvider)
var tagProvider = new TagProvider('localhost', 27017, debateProvider, referenceProvider);
var debate = new Debate();

//GET

exports.about = function(req, res) {
  res.render('about.jade', { locals: {
      title: 'About Gruff'
  }});
};

exports.contact = function(req, res) {
  res.render('contact.jade', { locals: {
      title: 'Contact Us'
      , showTwitter: true
  }});
};

exports.feed = function(req, res){
  debateProvider.findRecent(10, 0, function(error, docs){
    if (handleError(req, res, error, true)) {
      return;
    }
    var date = new Date;
    res.render('feed.jade', { 
      layout: 'layout_xml'
      , locals: {
        title: 'Recent Debates Feed'
        , debates: docs
        , now: date.toString()
      }
    });
  })
};

exports.getSearch = function(req, res){
  debateProvider.search(req.param('value'), function(error, results) {
    if (handleError(req, res, error, true)) {
      return;
    }
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
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.render('debate_show.jade', { locals: {
      title: debate.parent ? debate.parent.bestTitleText() + " - " + debate.bestTitleText() : debate.bestTitleText()
      , parent: debate.parent
      , debate: debate
      , type: 'debate'
      , describable: debate
      , linkToMe: false
      , showReferences: true
      , showAddThis: true
    }});
  });
};

exports.getReference = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    if (handleError(req, res, error, reference)) {
      return;
    }
    res.render('reference_show.jade', { locals: {
        title: reference.debate.bestTitleText() + " - " + reference.bestTitleText()
        , reference: reference
        , type: 'reference'
        , describable: reference
        , linkToMe: false
    }});
  });
};

exports.getDebateTitle = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.render('titles_show.jade', { locals: {
      title: debate.bestTitleText()
      , parent: debate.parent
      , type: 'debate'
      , describable: debate
      , linkToMe: true
    }});
  });
};

exports.getDebateDescription = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.render('descriptions_show.jade', { locals: {
      title: debate.bestTitleText()
      , parent: debate.parent
      , type: 'debate'
      , describable: debate
      , linkToMe: true
    }});
  });
};

exports.getReferenceTitle = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    if (handleError(req, res, error, reference)) {
      return;
    }
    else {
      res.render('titles_show.jade', { locals: {
        title: reference.bestTitleText()
        , parent: reference.debate
        , type: 'reference'
        , describable: reference
        , linkToMe: true
      }});
    }
  });
};

exports.getReferenceDescription = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    if (handleError(req, res, error, reference)) {
      return;
    }
    res.render('descriptions_show.jade', { locals: {
      title: reference.bestTitleText()
      , parent: reference.debate
      , type: 'reference'
      , describable: reference
      , linkToMe: true
    }});
  });
};

exports.getTaggedItems = function(req, res) {
  tagProvider.findAllByTag(req.params.tag, function(error, items) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.render('tags.jade', { locals: {
      title: "Stuff Tagged " + req.params.tag
      , tag: req.params.tag
      , debates: items.debates
      , references: items.references
      , titles: items.titles
      , descriptions: items.descriptions
      , showTagCloud: true
    }});
  });
};

// Curation

exports.moveDebate = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  debateProvider.moveTo(req.user.login, req.params.debateId, req.params.parentId, req.params.destination, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.redirect('/debates/' + debate.linkableId());
  });
};

// Account Info

exports.getMyDebates = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  debateProvider.findDebatesForUser(req.user.login, function(error, debates) {
    if (handleError(req, res, error, debates)) {
      return;
    }
    referenceProvider.findReferencesForUser(req.user.login, function(error, references) {
      if (handleError(req, res, error, references)) {
        return;
      }
      res.render('my/debates.jade', { locals: {
        title: "My Debates"
        , created: debates.created
        , contributed: debates.contributed
        , voted: debates.voted
        , references_created: references.created
        , references_contributed: references.contributed
        , references_voted: references.voted
        , showMyReferences: true
      }});
    });
  });
};

exports.index = function(req, res){
  debateProvider.findRecent(10, 0, function(error, docs){
    if (handleError(req, res, error, true)) {
      return;
    }
    res.render('index.jade', { locals: {
      title: 'Recent Debates'
      , debates: docs
      , showTwitter: true
      , showTagCloud: true
    }});
  })
};

// GET JSON

exports.getTagSearch = function(req, res){
  tagProvider.findAllByPartialMatch(req.param('term'), function(error, tags){
    if (handleError(req, res, error, true)) {
      return;
    }
    res.json(tags);
  })
};

exports.getTagCounts = function(req, res){
  tagProvider.getTagCounts(req.param('tags'), function(error, counts){
    if (handleError(req, res, error, true)) {
      return;
    }
    res.json(counts);
  })
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
    if (handleError(req, res, error, true)) {
      return;
    }
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
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/debates/' + req.param('_id'));
  });
};

exports.postDebateTitle = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("debates"
                                    , "titles"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        title: req.param('title'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
                                      res.redirect('/debates/' + req.param('_id') + '/titles');
  });
};

exports.postDebateDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("debates"
                                    , "descriptions"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        text: req.param('desc'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
                                      res.redirect('/debates/' + req.param('_id') + '/descriptions');
  });
};

exports.postAnswer = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var debate = new Debate();
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
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/debates/' + req.param('_id'));
  });
};

exports.postSubdebate = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var debate = new Debate();
  debateProvider.addSubdebateToDebate(req.param('_id'), {
    user: req.user.login,
    type: req.param('type'),
    desc: req.param('desc'),
    titles: [{
      user: req.user.login,
      title: req.param('title'),
      date: new Date()
    }],
    date: new Date()
  }, function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/debates/' + req.param('_id'));
  });
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
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/debates/' + req.param('_id'));
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
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/debates/' + req.param('_id'));
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
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/references/' + req.param('_id'));
  });
};

exports.postReferenceTitle = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("references"
                                    , "titles"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                      user: req.user.login,
                                      title: req.param('title'),
                                      date: new Date()
                                    } 
                                    , function( error, docs) {
                                      if (handleError(req, res, error, true)) {
                                        return;
                                      }
                                      res.redirect('/references/' + req.param('_id') + '/titles');
                                    });
};

exports.postReferenceDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("references"
                                    , "descriptions"
                                    , req.param('_id')
                                    , req.user.login
                                    , {
                                        user: req.user.login,
                                        text: req.param('desc'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
                                      res.redirect('/references/' + req.param('_id') + '/descriptions');
  });
};

exports.postDescriptorVote = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.voteForDescriptor(req.params.objecttype
                                         , req.params.objectid
                                         , req.params.attributetype
                                         , req.params.attributeid
                                         , req.user.login
                                         , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/' 
                 + req.params.objecttype
                 + '/' 
                 + req.params.objectid 
                 + '/' 
                 + req.params.attributetype
                );
  });
};

exports.postTag = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  tagProvider.addTag(req.params.objecttype
                                         , req.params.objectid
                                         , req.params.attributetype
                                         , req.params.attributeid
                                         , req.user.login
                                         , req.params.tag
                                         , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/' 
                 + req.params.objecttype
                 + '/' 
                 + req.params.objectid 
                 + (req.params.attributetype ? '/'+req.params.attributetype : '')
                );
  });
};

exports.removeTag = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  tagProvider.removeTag(req.params.objecttype
    , req.params.objectid
    , req.params.attributetype
    , req.params.attributeid
    , req.user.login
    , req.params.tag
    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.redirect('/' 
      + req.params.objecttype
      + '/' 
      + req.params.objectid 
      + (req.params.attributetype ? '/'+req.params.attributetype : '')
    );
});
};

// Handlers

exports.handle404 = function(req, res) {
  res.statusCode = 404;
  res.render('404.jade', { locals: {
    title: '404 Not Found'
    , showTwitter: true
 }});
};

exports.handle500 = function(req, res) {
  res.statusCode = 500;
  res.render('500.jade', { locals: {
      title: '500 Horrendous Error'
    }});
  
}

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

handleError = function(req, res, error, value) {
  if (error) {
    console.log('500 error: ' + error);
    exports.handle500(req, res);
    return true;
  }
  else if (! value || value == null) {
    console.log('404 error: value is ' + value);
    exports.handle404(req, res);
    return true;
  }
  else {
    return false;
  }
}