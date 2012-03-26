Gruff.Models.References ||= {}

class Gruff.Models.Reference extends Backbone.Model
  paramRoot: 'reference'
  urlRoot: '/rest/references'
  idAttribute: "_id"

  defaults:
    title: null
    description: null

  initialize: (options) ->
    @normalize()
    @answers = @initializeReferences "answers"
    @argumentsFor = @initializeReferences "argumentsFor"
    @argumentsAgainst = @initializeReferences "argumentsAgainst"
    @subreferences = @initializeReferences "subreferences"
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
    json.ReferenceTypes = @ReferenceTypes
    json

  normalize: ->
    @set({answerIds: []}) if (typeof(@get("answerIds")) == 'undefined' || @get("answerIds") == null)
    @set({argumentsForIds: []}) if (typeof(@get("argumentsForIds")) == 'undefined' || @get("argumentsForIds") == null)
    @set({argumentsAgainstIds: []}) if (typeof(@get("argumentsAgainstIds")) == 'undefined' || @get("argumentsAgainstIds") == null)
    @set({subreferenceIds: []}) if (typeof(@get("subreferenceIds")) == 'undefined' || @get("subreferenceIds") == null)

  initializeReferences: (type) =>
    references = new Gruff.Collections.References
    references.url = "/rest/references/" + @id + "/" + type
    references.setParent @
    references.type = type
    references.bind("add", @makeAddToCollectionEvent(references))
    references.bind("remove", @makeRemoveFromCollectionEvent(references))
    references

  updateGlobalHash: ->
    Gruff.Models.References[@linkableId()] = @

  fetchSubreferences: (options) ->
    @answers.fetch 
      success: (answers, response1) =>
        @argumentsFor.fetch
          success: (argumentsFor, response2) =>
            @argumentsAgainst.fetch
              success: (argumentsAgainst, response3) =>
                @subreferences.fetch
                  success: (subreferences, response4) =>
                    options?.success? subreferences, response4
                    @trigger "fetched-subreferences"

  findReference: (id) ->
    return Gruff.Models.References[id]
    root = @findRootReference()
    root.findSubreference(id)

  findRootReference: ->
    if @parent?
      @parent.findRootReference()
    else
      @

  findSubreference: (id) ->
    return @ if @linkableId() == id
    result = null
    _.each([@answers, @argumentsFor, @argumentsAgainst, @subreferences], (coll) ->
      if coll != null && result == null
        coll.each( (reference) -> 
          if result == null
            result = reference.findSubreference(id)
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
        when "subreference", "subreferences" then result = @subreferences
    )
    result

  getIdListName: (nameStr) ->
    result = null
    _.each(nameStr.split(" "), (name) =>
      switch name
        when "answer", "answers" then result = "answerIds"
        when "argumentFor", "argumentsFor", "for" then result = "argumentsForIds"
        when "argumentAgainst", "argumentsAgainst", "against" then result = "argumentsAgainstIds"
        when "subreference", "subreferences" then result = "subreferenceIds"
    )
    result

  makeAddToCollectionEvent: (coll) ->
    (reference) =>
      reference.parentCollection = coll
      reference.set({parentId: @linkableId()})
      @updateReferenceIds coll

  makeRemoveFromCollectionEvent: (coll) ->
    (reference) =>
      reference.parentCollection = null
      reference.set({parentId: null})
      @updateReferenceIds coll

  updateReferenceIds: (references) ->
    vals = {}
    vals[@getIdListName(references.type)] = references.pluck("_id")
    @set vals

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
    @parent.bind "change", @updateUrl

  updateUrl: (e) =>
    @url = "/rest/references/" + @parent.id + "/" + @type

  add: (reference) =>
    unless reference.length?
      reference.set
        attributeType: @type
    super reference

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Reference, exports.Reference
