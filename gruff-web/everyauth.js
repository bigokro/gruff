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
      userProvider.findByLogin(User.AuthTypes.LOCAL, login, function (err, user) {
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
      };
    })
    .validateRegistration(function (registration, errors) {
      var promise = this.Promise()
        , validators = [validateLogin, validateEmail]
        , count = validators.length
        ;
        
      validators.forEach(function (validator) {
        validator(registration, function(error) {
          if (typeof error !== 'undefined') {
            errors.push(error);
          }
          count--;
          if (count <= 0) {
            promise.fulfill(errors);
          }
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

everyauth.facebook
  .myHostname('http://gruff.co')
  .appId('284793468267979')
  .appSecret('90eb5735f5f58beaf88c98e0d7fc1398')
  .entryPath('/auth/facebook')
  .callbackPath('/auth/facebook/callback')
  .canvasPath('/auth/facebook/canvas')
  .canvasPage('http://apps.facebook.com/gruff-it')
  .scope('email,user_status') // Defaults to undefined
  .fields('id,name,email,picture')
  .handleAuthCallbackError( function(req, res) {
	  console.log("Facebook handleAuthCallbackError()");
  })
  .findOrCreateUser( function(session, accessToken, accessTokExtra, fbUserMetadata) {
      console.log("Facebook findOrCreateUser(session="+session+", accessToken="+accessToken+", accessTokExtra="+accessTokExtra+", fbUserMetaData="+JSON.stringify(fbUserMetadata));
      var promise = this.Promise();
      var login = fbUserMetadata.user_id;
      userProvider.findByLogin(User.AuthTypes.LOCAL, login, function (err, foundUser) {
        if (err) {
          promise.fulfill(err);
        }
        else {
          if (foundUser) {
            user.id = foundUser._id;
            promise.fulfill(foundUser);
          }
          else {
            var newUser = {
              login: login
       	      authenticator: User.AuthTypes.FACEBOOK,
              data: fbUserMetadata
            };
            userProvider.save(newUser, function(err, users) {
              if (err) {
                return promise.fulfill([err]);
              }
              var user = users[0];
              user.id = user._id;
              promise.fulfill(user);
            });
          }
        }
      });
      return promise;
  })
  .redirectPath('/');


exports.everyauth = everyauth;

var validateLogin = function (registration, callback) {
  userProvider.findByKey(registration.login, 'login', function(err, user) {
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

var validateEmail = function (registration, callback) {
  try {
    validator.check(registration.email, 'Invalid email address').isEmail();
  }
  catch (err) {
    callback(err);
    return;
  }
  userProvider.findByKey(registration.email, 'email', function(err, user) {
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
