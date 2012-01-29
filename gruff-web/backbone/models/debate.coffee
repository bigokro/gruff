class Gruff.Models.Debate extends Backbone.Model
  paramRoot: 'debate'
  urlRoot: '/rest/debates'

  defaults:
    title: null
    description: null

  initialize: (options) ->
    this.answers = this.initializeDebates "answers"
    this.argumentsFor = this.initializeDebates "argumentsFor"
    this.argumentsAgainst = this.initializeDebates "argumentsAgainst"
    this.subdebates = this.initializeDebates "subdebates"
    this.parentCollection = options.parentCollection

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
        
class Gruff.Collections.Debates extends Backbone.Collection
  model: Gruff.Models.Debate
  url: '/rest/debates'

  fullJSON: () ->
    json = []
    @each (debate) =>
      json.push( debate.fullJSON() )
    json

  add: (debate) ->
    super(debate)
    debate.parentCollection = @

  remove: (debate) ->
    super(debate)
    debate.parentCollection = null

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Debate, exports.Debate
