var referenceProvider = new ReferenceProvider('localhost', 27017);
var describableProvider = new DescribableProvider('localhost', 27017);
var debateProvider = new DebateProvider('localhost', 27017, describableProvider, referenceProvider);
var tagProvider = new TagProvider('localhost', 27017, debateProvider, referenceProvider);
var userProvider = new UserProvider('localhost', 27017, userProvider, referenceProvider);
var debate = new Debate();

//GET

exports.about = function(req, res) {
  res.render('about.pug', {
      title: 'About Gruff'
  });
};

exports.canvas = function(req, res) {
  var id = req.params.id;
  res.render('canvas.pug', {
    title: 'Make Your Gruff'
    , id: id
  });
};

exports.contact = function(req, res) {
  res.render('contact.pug', {
      title: 'Contact Us'
      , showTwitter: true
  });
};

exports.feed = function(req, res){
  debateProvider.findRecent(10, 0, function(error, docs){
    if (handleError(req, res, error, true)) {
      return;
    }
    var date = new Date;
    res.render('feed.pug', { 
      layout: 'layout_xml'
      , locals: {
        title: 'Recent Debates Feed'
        , debates: docs
        , now: date.toString()
      }
    });
  });
};

exports.getSearch = function(req, res){
  debateProvider.search(req.param('value'), function(error, results) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.render('search_results.pug', {
      title: 'Search Results',
      results: results
    });
  });
};

exports.getNewDebate = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  res.render('debate_new.pug', {
    title: 'New Debate',
    debate: new Debate()
  });
};

exports.getDebate = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.render('debate_show.pug', {
      title: debate.parent ? debate.parent.bestTitleText() + " - " + debate.bestTitleText() : debate.bestTitleText()
      , parent: debate.parent
      , debate: debate
      , type: 'debate'
      , describable: debate
      , linkToMe: false
      , showReferences: true
      , showAddThis: true
    });
  });
};

exports.getCurrentUser = function(req, res) {
  if (req.loggedIn) {
    res.json({
      _id: req.session.user._id
      , login: req.session.user.login
      , authenticator: req.session.user.authenticator
      , email: req.session.user.email
    });
  } else {
    res.json({});
  }
};

exports.getReferences = function(req, res) {
  referenceProvider.findAllByDebateId(req.params.id, function(error, references) {
    if (handleError(req, res, error, references)) {
      return;
    }
    res.json(references);
  });
};

exports.getReference = function(req, res) {
  /*
  referenceProvider.findById(req.params.id, function(error, references) {
    if (handleError(req, res, error, references)) {
      return;
    }
    res.json(references);
  });
  */
  "For some reason not implemented yet"
};

exports.getDebateTitle = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.render('titles_show.pug', {
      title: debate.bestTitleText()
      , parent: debate.parent
      , type: 'debate'
      , describable: debate
      , linkToMe: true
    });
  });
};

exports.getDebateDescription = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.render('descriptions_show.pug', {
      title: debate.bestTitleText()
      , parent: debate.parent
      , type: 'debate'
      , describable: debate
      , linkToMe: true
    });
  });
};

exports.getReferenceTitle = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    if (handleError(req, res, error, reference)) {
      return;
    }
    else {
      res.render('titles_show.pug', {
        title: reference.bestTitleText()
        , parent: reference.debate
        , type: 'reference'
        , describable: reference
        , linkToMe: true
      });
    }
  });
};

exports.getReferenceDescription = function(req, res) {
  referenceProvider.findById(req.params.id, function(error, reference) {
    if (handleError(req, res, error, reference)) {
      return;
    }
    res.render('descriptions_show.pug', {
      title: reference.bestTitleText()
      , parent: reference.debate
      , type: 'reference'
      , describable: reference
      , linkToMe: true
    });
  });
};

exports.getTaggedItems = function(req, res) {
  tagProvider.findAllByTag(req.params.tag, function(error, items) {
    if (handleError(req, res, error, true)) {
      return;
    }
    res.render('tags.pug', {
      title: "Stuff Tagged " + req.params.tag
      , tag: req.params.tag
      , debates: items.debates
      , references: items.references
      , titles: items.titles
      , descriptions: items.descriptions
      , showTagCloud: true
    });
  });
};

// Curation

exports.moveDebate = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  debateProvider.moveTo(req.session.user.login, req.params.debateId, req.params.parentId, req.params.destination, function(error, debate) {
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
  debateProvider.findDebatesForUser(req.session.user.login, function(error, debates) {
    if (handleError(req, res, error, debates)) {
      return;
    }
    referenceProvider.findReferencesForUser(req.session.user.login, function(error, references) {
      if (handleError(req, res, error, references)) {
        return;
      }
      res.render('my/debates.pug', {
        title: "My Debates"
        , created: debates.created
        , contributed: debates.contributed
        , voted: debates.voted
        , references_created: references.created
        , references_contributed: references.contributed
        , references_voted: references.voted
        , showMyReferences: true
      });
    });
  });
};

exports.index = function(req, res){
  debateProvider.findRecent(10, 0, function(error, docs){
    if (handleError(req, res, error, true)) {
      return;
    }
    res.render('index.pug', {
      title: 'Recent Debates'
      , debates: docs
      , showTwitter: true
      , showTagCloud: true
    });
  });
};

// GET JSON

exports.getTagSearch = function(req, res){
  tagProvider.findAllByPartialMatch(req.param('term'), function(error, tags){
    if (handleError(req, res, error, true)) {
      return;
    }
    res.json(tags);
  });
};

exports.getTagCounts = function(req, res){
  tagProvider.getTagCounts(req.param('tags'), function(error, counts){
    if (handleError(req, res, error, true)) {
      return;
    }
    res.json(counts);
  });
};

exports.getJSONDebate = function(req, res) {
  debateProvider.findById(req.params.id, function(error, debate) {
    if (handleError(req, res, error, debate)) {
      return;
    }
    res.json(debate.stripChildren());
  });
};

exports.getJSONDebates = function(req, res) {
  debateProvider.findAllByIdAndType(req.params.id, req.params.attributetype, function(error, docs){
    if (handleError(req, res, error, docs)) {
      return;
    }
    res.json(docs);
  });
};

// POST

exports.postJSONLogin = function(req, res){
    res.json({error: "For some reason not implemented"});
};

exports.postDebate = function(req, res){
  if (bounceAnonymous(req, res)) {
    return;
  }
  if (req.xhr) {
    var debate = req.body;
  } else {
    var debate = {
      title: req.param('title'),
      url: req.param('url'),
      desc: req.param('desc'),
      type: req.param('type')
    };
  }
  debate.attributeType = req.params.attributetype;
  debateProvider.save(debate, function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.json(docs[0].stripChildren());
    } else {
      res.redirect('/');
    }
  });
};

exports.postComment = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  console.log("using session user "+req.session.user);
  if (req.xhr) {
    var comment = new Comment(req.session.user.login, req.body.comment, false);
    var parentId = req.params.objectid;
    var commentId = req.params.commentid;
    var txtIdx = req.params.textidx;
    console.log("Parent ID: " + parentId);
    console.log("Comment ID: " + commentId);
    console.log("Text index: " + txtIdx);
    console.log(JSON.stringify(comment));
  } else {
    var comment = new Comment(req.session.user.login, req.param('comment'), false);
    var parentId = req.param('_id');
    var commentId = req.param('commentId');
    var txtIdx = req.param('textIndex');
  }
  describableProvider.addComment(req.params.objecttype, parentId, commentId, txtIdx, comment, 
    function( error, doc) {
      if (handleError(req, res, error, doc)) {
        return;
      }
      if (req.xhr) {
        res.json(comment);
      } else {
        res.redirect('/'+ req.params.objecttype + '/' + req.param('_id'));
      }
    });
};

exports.voteComment = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var objectType = req.params.objecttype;
  var parentId = req.params.objectid;
  var commentId = req.params.commentid;
  var vote = req.params.vote;
  describableProvider.voteComment(objectType, parentId, commentId, req.session.user, vote,
    function( error, comment) {
      if (handleError(req, res, error, comment)) {
        return;
      }
      res.json(comment);
    });
};

exports.postDebateTitle = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("debates"
                                    , "titles"
                                    , req.param('_id')
                                    , req.session.user.login
                                    , {
                                        user: req.session.user.login,
                                        title: req.param('title'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.redirect('/debates/' + req.param('_id') + '/titles');
    } else {
      req.json(req.param('title'));
    }
  });
};

exports.postDebateDescription = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("debates"
                                    , "descriptions"
                                    , req.param('_id')
                                    , req.session.user.login
                                    , {
                                        user: req.session.user.login,
                                        text: req.param('desc'),
                                        date: new Date()
                                    } 
                                    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.redirect('/debates/' + req.param('_id') + '/descriptions');
    } else {
      req.json(req.param('title'));
    }
  });
};

exports.postAnswer = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var debate = new Debate();
  var parentId = req.params.id ? req.params.id : req.param('_id');
  debateProvider.addAnswerToDebate(parentId, {
    user: req.session.user.login,
    type: debate.DebateTypes.DIALECTIC,
    attributeType: Debate.prototype.AttributeTypes.ANSWER,
    desc: req.param('desc'),
    titles: [{
      user: req.session.user.login,
      title: req.param('title'),
      date: new Date()
    }],
    date: new Date()
  }, function( error, doc) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.json(doc);
    } else {
      res.redirect('/debates/' + req.param('_id'));
    }
  });
};

exports.postSubdebate = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var debate = new Debate();
  var parentId = req.params.id ? req.params.id : req.param('_id');
  debateProvider.addSubdebateToDebate(parentId, {
    user: req.session.user.login,
    type: req.param('type'),
    desc: req.param('desc'),
    attributeType: Debate.prototype.AttributeTypes.SUBDEBATE,
    titles: [{
      user: req.session.user.login,
      title: req.param('title'),
      date: new Date()
    }],
    date: new Date()
  }, function( error, doc) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.json(doc);
    } else {
      res.redirect('/debates/' + req.param('_id'));
    }
  });
};

exports.postArgument = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  var parentId = req.params.id ? req.params.id : req.param('_id');
  debateProvider.addArgumentToDebate(parentId, {
    user: req.session.user.login,
    type: debate.DebateTypes.DIALECTIC,
    attributeType: req.params.attributetype,
    desc: req.param('desc'),
    titles: [{
      user: req.session.user.login,
      title: req.param('title'),
      date: new Date()
    }],
    date: new Date()
  },
  (req.param('isFor') == 'true') || (req.params.attributetype === 'argumentsFor'),
  function( error, doc) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.json(doc);
    } else {
      res.redirect('/debates/' + req.param('_id'));
    }
  });
}

exports.addDebateToDebate = function(req, res) {
  if (req.params.attributetype === 'subdebates') {
    exports.postSubdebate(req, res);
  } else if (req.params.attributetype === 'argumentsFor') {
    exports.postArgument(req, res);
  } else if (req.params.attributetype === 'argumentsAgainst') {
    exports.postArgument(req, res);
  } else if (req.params.attributetype === 'answers') {
    exports.postAnswer(req, res);
  } else {
    exports.handle404(req, res);
  }
};

exports.postReference = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  if (req.xhr) {
    var reference = req.body;
    reference.user = req.session.user.login;
    reference.titles = [{
      user: req.session.user.login,
      title: reference.title,
      date: new Date()
    }],
    reference.date = new Date();
    var parentId = req.params.id;
  } else {
    var reference = {
      user: req.session.user.login,
      url: req.param('url'),
      desc: req.param('desc'),
      titles: [{
        user: req.session.user.login,
        title: req.param('title'),
        date: new Date()
      }],
      date: new Date()
    };
    var parentId = req.param('_id');
  }
  debateProvider.addReferenceToDebate(parentId, reference,
  function( error, doc) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
      res.json(doc);
    } else {
      res.redirect('/debates/' + req.param('_id'));
    }
  });
};

exports.postReferenceTitle = function(req, res) {
  if (bounceAnonymous(req, res)) {
    return;
  }
  describableProvider.addDescriptor("references"
                                    , "titles"
                                    , req.param('_id')
                                    , req.session.user.login
                                    , {
                                      user: req.session.user.login,
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
                                    , req.session.user.login
                                    , {
                                        user: req.session.user.login,
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
                                         , req.session.user.login
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
                                         , req.session.user.login
                                         , req.params.tag
                                         , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
	res.json({ name: docs });
    } else {
      res.redirect('/' 
                 + req.params.objecttype
                 + '/' 
                 + req.params.objectid 
                 + (req.params.attributetype ? '/'+req.params.attributetype : '')
                );
    }
  });
};

exports.getTag = function(req, res) {
    res.json({
          "Object type": req.params.objecttype,
          "Object id": req.params.objectid,
          "Attr type": req.params.attributetype,
          "Attr id": req.params.attributeid,
          "Tag": req.params.tag
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
    , req.session.user.login
    , req.params.tag
    , function( error, docs) {
    if (handleError(req, res, error, true)) {
      return;
    }
    if (req.xhr) {
	res.json({ name: docs });
    } else {
      res.redirect('/' 
        + req.params.objecttype
        + '/' 
        + req.params.objectid 
        + (req.params.attributetype ? '/'+req.params.attributetype : '')
      );
    }
});
};

// PUT

exports.putDebate = function(req, res){
  if (bounceAnonymous(req, res)) {
    return;
  }
  if (req.xhr) {
    var debate = req.body;
  } else {
    var debate = {
      title: req.param('title'),
      url: req.param('url'),
      desc: req.param('desc'),
      type: req.param('type')
    };
  }
  debateProvider.update(debate, function( error, doc) {
    if (handleError(req, res, error, doc)) {
      return;
    }
    if (req.xhr) {
      res.json(doc);
    } else {
      res.redirect('/debates/'+doc._id);
    }
  });
};

// DELETE

exports.deleteDebate = function(req, res){
  if (bounceAnonymous(req, res)) {
    return;
  }
  debateProvider.delete(req.params.id, function( error, doc) {
    if (handleError(req, res, error, doc)) {
      return;
    }
    if (req.xhr) {
      res.json(doc.stripChildren());
    } else {
      res.redirect('/debates/'+doc.parentId);
    }
  });
};

// Facebook App
exports.postFacebook = function(req, res) {
    var signed_request = req.param('signed_request').split('.');
    var signature = signed_request[0];
    var data = signed_request[1];
    var decoded = new Buffer(data, 'base64').toString('utf8');
    var json = JSON.parse(decoded);

    if (!json.user_id || json.user_id === null) {
      var appID = "284793468267979";
      var appID = everyauth.facebook.appId();
      var authURL = "http://www.facebook.com/dialog/oauth?client_id="+ appID + "&redirect_uri=" + encodeURI("http://gruff.co/facebook");
      //res.redirect(authURL);
      res.redirect('/auth/facebook');
    } else {
        res.json(json);
    }
};


// Handlers

exports.handle404 = function(req, res) {
  res.statusCode = 404;
  if (req.xhr) {
    res.json([{ "message": "404 Not Found" }]);
  } else {
    res.render('404.pug', {
      title: '404 Not Found'
      , showTwitter: true
    });
  }
};

exports.handle500 = function(req, res, error) {
  res.statusCode = 500;
  if (req.xhr) {
    res.json([{ "message": "500 Error: " + error }]);
  } else {
    res.render('500.pug', {
      title: '500 Horrendous Error'
    });
  }
};

// Helpers

bounceAnonymous = function (req, res) {
    if (! req.session.user) {
	console.log('bouncing anonymous user');
	userProvider.findByLogin('manual', 'gruff', function(error, user) {
	    if (user == null) {
		if (error) {
		    console.log(error);
		}
		console.log('creating a new user');
		user = {login: 'gruff', authenticator: 'manual', email: 'timothy.high@gmail.com'}
		userProvider.save(user, function(error, user) { console.log("Error? " + error) });
	    }
	    console.log('setting user on session');
	    req.session.user = user
	});
	/*
	if (req.xhr) {
	    res.statusCode = 401;
	    res.json([{ "message": "You must be logged in to perform this action." }]);
	} else {
	    res.redirect('/login');
	}
	return true;
	*/
	return false;
    }
    else {
	return false;
    }
};

handleError = function(req, res, error, value) {
  if (error) {
    console.log('500 error: ' + error);
    exports.handle500(req, res, error);
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
};
