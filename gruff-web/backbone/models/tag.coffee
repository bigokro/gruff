Gruff.Models.Tags ||= {}

class Gruff.Models.Tag extends Backbone.Model
  paramRoot: ''
  idAttribute: "name"

  defaults:
    name: null

  initialize: (options) ->
    @updateUrl()
    @bind "change", @updateUrl

  updateUrl: (e) ->
    @url = "/rest/debates/" + @collection?.parent?.id + "/tag/" + @get("name")

  save: ->
    @updateUrl()
    super

  fullJSON: () ->
    json = @toJSON()
    json.user = Gruff.User.fullJSON()
    json

class Gruff.Collections.Tags extends Backbone.Collection
  model: Gruff.Models.Tag

  initialize: (options) ->
    @parent = options.parent
    @url = "/rest/debates/" + @parent?.id + "/tags"

  resetFromArray: (arr) ->
    tagArr = []
    _.each arr, (tag) ->
      tagArr.push { name: tag }
    @reset tagArr
