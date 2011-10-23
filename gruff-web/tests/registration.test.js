var tobi = require('tobi')
  , should = require('should')
  , browser = tobi.createBrowser(7080, 'localhost');

// Test a successful registration

browser.get('/register', function (res, $) {
  $('form#register')
    .fill({ login: 'testuser', email: 'test@example.com', password: 'password' })
    .submit( function (res, $) {
      res.should.have.status(200);
      $('li.user').should.have.text('You are logged in as testuser');
      $('li.login').should.not.have.text('Login');
    });
});

// Test registration validation

/*
 * setTimeout is required to induce a block, s.t. the user created above exists when we want to test validation
 * without this block, there's a race condition in the db, and we are testing unique indices in the db
 * instead of the validation functions in code
 */

setTimeout(
  function() { browser.get('/register', 
    function (res, $) {
      $('form#register')
        .fill({ login: 'testuser', email: 'test2@example.com', password: 'password' })
        .submit( function (res, $) {
          res.should.have.status(200);
          $('#errors li:first').should.have.text('Login already taken');
        })
    }) 
  }, 1000);

setTimeout(
  function() { browser.get('/register', 
    function (res, $) {
      $('form#register')
        .fill({ login: 'testuser2', email: 'test@example.com', password: 'password' })
        .submit( function (res, $) {
          res.should.have.status(200);
          $('#errors li:first').should.have.text('Email already taken');
        })
    }) 
  }, 1000);