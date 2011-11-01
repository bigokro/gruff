/*
 * @file registration.test.js
 * test the registration process
 */

var tobi = require('tobi')
  , should = require('should')
  , step = require('step')
  , browser = tobi.createBrowser(7080, 'localhost');

/**
 *  step requires you to pass a callback using "this" to invoke the next step,
 *  this is passed on to the next function in the series.
 *  
 *  tobi's browser.get calls a callback with (res, $)
 *  
 *  so we tweak tobi's normal invocation a bit and put the next get request at 
 *  the end of the prior set of assertions.
 */

step(
  function primePump() {
    browser.get('/register', this);
  },
  function createUser(res, $) {
    $('form#register')
      .fill({ login: 'testuser', email: 'test@example.com', password: 'password' })
      .submit( function (res, $) {
        res.should.have.status(200);
        $('li.user').should.have.text('You are logged in as testuser');
        $('li.login').should.not.have.text('Login');
      });
    browser.get('/register', this);
  },
  function sameUsername(res, $) {
    $('form#register')
      .fill({ login: 'testuser', email: 'test2@example.com', password: 'password' })
      .submit( function (res, $) {
        res.should.have.status(200);
        $('#errors li:first').should.have.text('Login already taken');
      });
    browser.get('/register', this);
  },
  function sameEmail(res, $) {
    $('form#register')
      .fill({ login: 'testuser2', email: 'test@example.com', password: 'password' })
      .submit( function (res, $) {
        res.should.have.status(200);
        $('#errors li:first').should.have.text('Email already taken');
      });
  }
);