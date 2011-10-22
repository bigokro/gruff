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
browser.get('/register', function (res, $) {
  $('form#register')
    .fill({ login: 'testuser', email: 'test2@example.com', password: 'password' })
    .submit( function (res, $) {
      res.should.have.status(200);
      $('#errors li:first').should.have.text('Login already taken');
    });
  $('form#register')
    .fill({ login: 'testuser2', email: 'test@example.com', password: 'password' })
    .submit( function (res, $) {
      res.should.have.status(200);
      $('#errors li:first').should.have.text('Email already taken');
    });
});

// Test a successful login
browser.get('/login', function (res, $) {
  $('form#login')
    .fill({ login: 'testuser', password: 'password' })
    .submit( function (res, $) {
      res.should.have.status(200);
      $('li.user').should.have.text('You are logged in as testuser');
      $('li.login').should.not.have.text('Login');
    });
});