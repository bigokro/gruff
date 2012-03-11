Gruff.Models.Debates ||= {}

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
    @updateGlobalHash()
    @bind('change', @updateGlobalHash)

  fullJSON: () ->
    json = @toJSON()
    json.bestTitle = @bestTitleText()
    json.bestTitle = "(no title)" unless json.bestTitle?
    json.bestDescription = @bestDescriptionText()
    json.linkableId = @linkableId()
    json.titleLink = @titleLink()
    json.attributeType = @get("attributeType")
    json.DebateTypes = @DebateTypes
    json

  normalize: ->
    @set({answerIds: []}) if (typeof(@get("answerIds")) == 'undefined' || @get("answerIds") == null)
    @set({argumentsForIds: []}) if (typeof(@get("argumentsForIds")) == 'undefined' || @get("argumentsForIds") == null)
    @set({argumentsAgainstIds: []}) if (typeof(@get("argumentsAgainstIds")) == 'undefined' || @get("argumentsAgainstIds") == null)
    @set({subdebateIds: []}) if (typeof(@get("subdebateIds")) == 'undefined' || @get("subdebateIds") == null)

  initializeDebates: (type) =>
    debates = new Gruff.Collections.Debates
    debates.url = "/rest/debates/" + @id + "/" + type
    debates.setParent @
    debates.type = type
    debates.bind("add", @makeAddToCollectionEvent(debates))
    debates.bind("remove", @makeRemoveFromCollectionEvent(debates))
    debates

  updateGlobalHash: ->
    Gruff.Models.Debates[@linkableId()] = @

  fetchSubdebates: (options) ->
    @answers.fetch 
      success: (answers, response1) =>
        @argumentsFor.fetch
          success: (argumentsFor, response2) =>
            @argumentsAgainst.fetch
              success: (argumentsAgainst, response3) =>
                @subdebates.fetch
                  success: (subdebates, response4) =>
                    options?.success? subdebates, response4
                    @trigger "fetched-subdebates"

  findDebate: (id) ->
    return Gruff.Models.Debates[id]
    root = @findRootDebate()
    root.findSubdebate(id)

  findRootDebate: ->
    if @parent?
      @parent.findRootDebate()
    else
      @

  findSubdebate: (id) ->
    return @ if @linkableId() == id
    result = null
    _.each([@answers, @argumentsFor, @argumentsAgainst, @subdebates], (coll) ->
      if coll != null && result == null
        coll.each( (debate) -> 
          if result == null
            result = debate.findSubdebate(id)
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

  setParent: (parent) ->
    @parent = parent
    @parent.bind "change", @updateUrl

  updateUrl: (e) =>
    @url = "/rest/debates/" + @parent.id + "/" + @type

  add: (debate) =>
    unless debate.length?
      debate.set
        attributeType: @type
    super debate

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Debate, exports.Debate
