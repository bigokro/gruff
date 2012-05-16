var everyauth = require('everyauth')
, userProvider = new UserProvider('localhost', 27017)
, validator = require('validator')
, querystring = require('querystring')
, restler = require('restler')
, User = require('./common/models/user').User
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
      userProvider.findByLogin(User.prototype.AuthTypes.LOCAL, login, function (err, user) {
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
        });
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
        return promise.fulfill(user);
      });
      return promise;
    })
    .loginSuccessRedirect('/my/debates')
    .registerSuccessRedirect('/');

everyauth.facebook
  .myHostname('http://gruff.co')
  .appId('284793468267979')
  .appSecret('90eb5735f5f58beaf88c98e0d7fc1398')
  .entryPath('/auth/facebook')
  .callbackPath('/auth/facebook/callback')
  .scope('email,user_status') // Defaults to undefined
  .fields('id,name,email,picture')
  .handleAuthCallbackError( function(req, res) {
	  console.log("Facebook handleAuthCallbackError()");
  })
  .findOrCreateUser( function(session, accessToken, accessTokExtra, fbUserMetadata) {
      console.log("Facebook findOrCreateUser(session="+session+", accessToken="+accessToken+", accessTokExtra="+accessTokExtra+", fbUserMetaData="+JSON.stringify(fbUserMetadata));
      var promise = this.Promise();
      if (accessToken == "access_token") {
	  accessToken = fbUserMetadata.oauth_token;
      }
      var request = restler.get("https://graph.facebook.com/me", { query: { access_token: accessToken } });

      request.on('fail', function(data) {
        var result = JSON.parse(data);
        console.log("couldn't retrieve FB user: " + result.error.message);
        return promise.fulfill([err]);
      });

      request.on('success', function(data) {
        var userData = JSON.parse(data);
        console.log("user data: "+JSON.stringify(userData));
        var login = userData.username;

        console.log("Calling findbylogin");
        userProvider.findByLogin(User.prototype.AuthTypes.FACEBOOK, login, function (err, foundUser) {
          if (err) {
      console.log("Findbylogin returned error");
            promise.fulfill(err);
          }
          else {
      console.log(" findbylogin ok");
            if (foundUser) {
      console.log("found user");
              foundUser.id = foundUser._id;
              promise.fulfill(foundUser);
            }
            else {
	      console.log("user not found");
              var newUser = {
                login: userData.username,
       	        authenticator: User.prototype.AuthTypes.FACEBOOK,
                data: userData
              };
	      console.log("new user: "+JSON.stringify(newUser));
  	    console.log("saving new user");
              userProvider.save(newUser, function(err, users) {
                if (err) {
		  console.log("save user returned error");
                  return promise.fulfill([err]);
                }
	      console.log("saved user");
                var user = users[0];
                user.id = user._id;
                return promise.fulfill(user);
              });

            }
          }
        });
      });
      return promise;
  })
  .redirectPath('/my/debates');


everyauth.facebookCanvas
  .canvasPath('/auth/facebook/canvas')
  .canvasPage('http://apps.facebook.com/gruff-it');


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
