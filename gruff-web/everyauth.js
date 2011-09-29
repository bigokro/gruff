var everyauth = require('everyauth')
, userProvider = new UserProvider('localhost', 27017)
, usersById = {}
, nextUserId = 0
;

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, userProvider.findById(id));
  });

everyauth
  .password
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Gruff Login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = userProvider.findByLogin(login);
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
          title: 'Gruff Registration'
        });
      }, 200);
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.login;
      var promise = this.Promise();
      userProvider.findByLogin(login, function(err, user) {
        if (user) {
          errors.push('Login already taken');
        }
        else if (err) {
          errors.push(err);
        }
        promise.fulfill(errors);
      });
      return promise;
    })
    .registerUser( function (newUserAttrs) {
      var promise = this.Promise();
      var login = newUserAttrs[this.loginKey()];
      userProvider.save(newUserAttrs, function(err, users) {
        if (err) {
          return promise.fulfill([err]);
        }
        promise.fulfill(users[0]);
      });
      return promise;
    })
    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

exports.everyauth = everyauth;