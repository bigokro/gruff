class Gruff.Models.Login extends Backbone.Model
  paramRoot: 'login'
  urlRoot: '/rest/login'

  defaults:
    login: null
    password: null
