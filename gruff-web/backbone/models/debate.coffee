class Gruff.Models.Debate extends Backbone.Model
  paramRoot: 'debate'
  urlRoot: '/rest/debates'
  idAttribute: "_id"

  defaults:
    title: null
    description: null

  initialize: (options) ->
    @normalize()
    @answers = @initializeDebates "answers"
    @argumentsFor = @initializeDebates "argumentsFor"
    @argumentsAgainst = @initializeDebates "argumentsAgainst"
    @subdebates = @initializeDebates "subdebates"
    @parentCollection = options.parentCollection

  fullJSON: () ->
    json = @toJSON()
    json.bestTitle = @bestTitleText()
    json.bestDescription = @bestDescriptionText()
    json.linkableId = @linkableId()
    json.titleLink = @titleLink()
    json

  normalize: ->
    @set({answerIds: []}) if (typeof(@get("answerIds")) == 'undefined' || @get("answerIds") == null)
    @set({argumentsForIds: []}) if (typeof(@get("argumentsForIds")) == 'undefined' || @get("argumentsForIds") == null)
    @set({argumentsAgainstIds: []}) if (typeof(@get("argumentsAgainstIds")) == 'undefined' || @get("argumentsAgainstIds") == null)
    @set({subdebateIds: []}) if (typeof(@get("subdebateIds")) == 'undefined' || @get("subdebateIds") == null)

  initializeDebates: (type) ->
    debates = new Gruff.Collections.Debates
    debates.url = "/rest/debates/" + @id + "/" + type
    debates.parent = @
    debates.type = type
    debates.bind("add", @makeAddToCollectionEvent(debates))
    debates.bind("remove", @makeRemoveFromCollectionEvent(debates))
    debates

  findDebate: (id) ->
    return @ if @linkableId() == id
    result = null
    _.each([@answers, @argumentsFor, @argumentsAgainst, @subdebates], (coll) ->
      if coll != null && result == null
        coll.each( (debate) -> 
          if result == null
            result = debate.findDebate(id)
        )
    )
    result

  getCollectionByName: (nameStr) ->
    result = null
    _.each(nameStr.split(" "), (name) =>
      switch name
        when "answer", "answers" then result = @answers
        when "argumentFor", "argumentsFor", "for" then result = @argumentsFor
        when "argumentAgainst", "argumentsAgainst", "against" then result = @argumentsAgainst
        when "subdebate", "subdebates" then result = @subdebates
    )
    result

  getIdListName: (nameStr) ->
    result = null
    _.each(nameStr.split(" "), (name) =>
      switch name
        when "answer", "answers" then result = "answerIds"
        when "argumentFor", "argumentsFor", "for" then result = "argumentsForIds"
        when "argumentAgainst", "argumentsAgainst", "against" then result = "argumentsAgainstIds"
        when "subdebate", "subdebates" then result = "subdebateIds"
    )
    result

  makeAddToCollectionEvent: (coll) ->
    (debate) =>
      debate.parentCollection = coll
      debate.set({parentId: @linkableId()})
      @updateDebateIds coll

  makeRemoveFromCollectionEvent: (coll) ->
    (debate) =>
      debate.parentCollection = null
      debate.set({parentId: null})
      @updateDebateIds coll

  updateDebateIds: (debates) ->
    vals = {}
    vals[@getIdListName(debates.type)] = debates.pluck("_id")
    @set vals

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
