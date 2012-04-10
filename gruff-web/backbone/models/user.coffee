Gruff.Models.Users ||= {}

class Gruff.Models.User extends Backbone.Model
  paramRoot: ''
  idAttribute: '_id'
  url: '/rest/user'

  initialize: (options) ->

  fullJSON: =>
    json = @toJSON()
    json.logged = @isLogged()
    json.curator = @isCurator()
    json

  isCurator: =>
    login = @get("login")
    login == 'thigh' || login == 'biggusgruffus'

  isLogged: =>
    @id?
