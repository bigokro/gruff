Gruff.Models.Users ||= {}

class Gruff.Models.User extends Backbone.Model
  paramRoot: ''
  idAttribute: '_id'
  url: '/rest/user'

  initialize: (options) ->

  fullJSON: =>
    json = @toJSON()
    json.curator = json.login == 'thigh' || json.login == 'biggusgruffus'
    json

