/**
 * Module dependencies.
 */

var express = require('express')
  , DebateProvider = require('./debateprovider-mongodb').DebateProvider
  , Debate = require('./models/debate').Debate
  , everyauth = require('everyauth')
  , port = process.env.NODE_ENV == 'production' ? 80 : 7080
  , routes = require('./routes.js')
  ;

// Everyauth

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

var usersByLogin = {
  'brian@example.com': addUser({ login: 'brian@example.com', password: 'password'})
};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth
  .password
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = usersByLogin[login];
      if (!user) return ['Login failed'];
      if (user.password !== password) return ['Login failed'];
      return user;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
    .registerLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async Register'
        });
      }, 200);
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.login;
      if (usersByLogin[login]) errors.push('Login already taken');
      return errors;
    })
    .registerUser( function (newUserAttrs) {
      var login = newUserAttrs[this.loginKey()];
      return usersByLogin[login] = addUser(newUserAttrs);
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

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
    app.use(everyauth.middleware());
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

app.post('/debate/new', routes.postDebate);
app.post('/debate/comment/new', routes.postComment);
app.post('/debate/title/new', routes.postTitle);
app.post('/debate/answer/new', routes.postAnswer);
app.post('/debate/argument/new', routes.postArgument);

// Main

everyauth.helpExpress(app);
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);