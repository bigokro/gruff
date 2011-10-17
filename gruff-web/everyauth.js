var everyauth = require('everyauth')
, userProvider = new UserProvider('localhost', 27017)
, validator = require('validator');
;

everyauth.everymodule
  .findUserById( function (id, callback) {
    userProvider.findById(id, callback);
  });

everyauth
  .password
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) {
        errors.push('Missing login');
      }
      if (!password) {
        errors.push('Missing password');
      }
      if (errors.length) {
        return errors;
      }
      var promise = this.Promise();
      userProvider.findByKey(login, 'login', function (err, user) {
        if (err) {
          promise.fulfill(err);
        }
        else {
          if (!user) {
            promise.fulfill(['Login failed']);
          }
          else if (user.password !== password) {
           promise.fulfill(['Login failed']);
          }
          else {
            user.id = user._id;
            promise.fulfill(user);
          }
        }
      });
      return promise;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
    .registerLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Register'
        });
      }, 200);
    })
    .extractExtraRegistrationParams( function (req) {
      return {
          email: req.body.email
        , displayname: req.body.displayname
      };
    })
    .validateRegistration( function (registration, errors) {
      var promise = this.Promise()
      validateEmail(registration.email, errors, promise);
      validateLogin(registration.login, errors, promise);
      return promise;
    })
    .registerUser( function (newUserAttrs) {
      var promise = this.Promise();
      var login = newUserAttrs[this.loginKey()];
      userProvider.save(newUserAttrs, function(err, users) {
        if (err) {
          return promise.fulfill([err]);
        }
        var user = users[0];
        user.id = user._id;
        promise.fulfill(user);
      });
      return promise;
    })
    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

validateEmail = function(email, errors, promise) {
  try {
    validator.check(email, 'Invalid email address').isEmail();
  }
  catch (err) {
    errors.push(err);
  }
  userProvider.findByKey(email, 'email', function(err, user) {
    if (user) {
      errors.push('Email already taken');
    }
    else if (err) {
      errors.push(err);
    }
    promise.fulfill(errors);
  });
}

validateLogin = function(login, errors, promise) {
  userProvider.findByKey(login, 'login', function(err, user) {
    if (user) {
      errors.push('Login already taken');
    }
    else if (err) {
      errors.push(err);
    }
    promise.fulfill(errors);
  });
}

exports.everyauth = everyauth;