class Gruff.Models.Debate extends Backbone.Model
  paramRoot: 'debate'
  urlRoot: '/rest/debates'

  defaults:
    title: null
    description: null

  initialize: ->
    this.answers = this.initializeDebates "answers"
    this.argumentsFor = this.initializeDebates "argumentsFor"
    this.argumentsAgainst = this.initializeDebates "argumentsAgainst"
    this.subdebates = this.initializeDebates "subdebates"

  fullJSON: () ->
    json = @toJSON()
    json.bestTitle = @bestTitleText()
    json.bestDescription = @bestDescriptionText()
    json.linkableId = @linkableId()
    json.titleLink = @titleLink()
    json

  initializeDebates: (type) ->
    debates = new Gruff.Collections.Debates
    debates.url = "/rest/debates/" + this.id + "/" + type
    debates


class Gruff.Collections.Debates extends Backbone.Collection
  model: Gruff.Models.Debate
  url: '/rest/debates'

  fullJSON: () ->
    json = []
    @each (debate) =>
      json.push( debate.fullJSON() )
    json

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Debate, exports.Debate
