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
      validateLogin(registration.login, function (newError) {
        if (typeof newError !== 'undefined') {
          errors.push(newError);
        }
        validateEmail(registration.email, function (newError) {
          if (typeof newError !== 'undefined') {
            errors.push(newError);
          }
          validateDisplayName(registration.displayname, function (newError) {
            if (typeof newError !== 'undefined') {
              errors.push(newError);
            }
            promise.fulfill(errors);
          })
        })
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
        var user = users[0];
        user.id = user._id;
        promise.fulfill(user);
      });
      return promise;
    })
    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

validateLogin = function(login, callback) {
  userProvider.findByKey(login, 'login', function(err, user) {
    if (user) {
      callback('Login already taken');
    }
    else if (err) {
      callback(err);
    }
    else {
      callback();
    }
  });
}

validateEmail = function(email, callback) {
  try {
    validator.check(email, 'Invalid email address').isEmail();
  }
  catch (err) {
    callback(err);
    return;
  }
  userProvider.findByKey(email, 'email', function(err, user) {
    if (user) {
      callback('Email already taken');
    }
    else if (err) {
      callback(err);
    }
    else {
      callback();
    }
  });
}

validateDisplayName = function(displayname, callback) {
  userProvider.findByKey(displayname, 'displayname', function(err, user) {
    if (user) {
      callback('Display name already taken');
    }
    else if (err) {
      callback(err);
    }
    else {
      callback();
    }
  });
}

exports.everyauth = everyauth;