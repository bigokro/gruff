Gruff.Models.References ||= {}

class Gruff.Models.Reference extends Backbone.Model
  paramRoot: 'reference'
  urlRoot: '/rest/references'
  idAttribute: "_id"

  defaults:
    title: null
    description: null

  initialize: (options) ->
    @collection = options.collection
    @updateGlobalHash()
    @bind('change', @updateGlobalHash)

  fullJSON: () ->
    json = @toJSON()
    json.bestTitle = @bestTitleText()
    json.bestTitle = "(no title)" unless json.bestTitle?
    json.bestDescription = @bestDescriptionText()
    json.linkableId = @linkableId()
    json.user = Gruff.User.fullJSON()
    json

  updateGlobalHash: ->
    Gruff.Models.References[@linkableId()] = @

  findReference: (id) ->
    return Gruff.Models.References[id]

class Gruff.Collections.References extends Backbone.Collection
  model: Gruff.Models.Reference
  url: '/rest/references'

  fullJSON: () ->
    json = []
    @each (reference) =>
      json.push( reference.fullJSON() )
    json

  setParent: (parent) ->
    @parent = parent
    @updateUrl()
    @parent.bind "change", @updateUrl

  updateUrl: (e) =>
    @url = "/rest/debates/" + @parent.id + "/references"

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Reference, exports.Reference
