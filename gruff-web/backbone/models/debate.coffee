class Gruff.Models.Debate extends Backbone.Model
  paramRoot: 'debate'
  urlRoot: '/rest/debates'

  defaults:
    title: null
    description: null

  fullJSON: () ->
    json = @toJSON()
    json.bestTitle = @bestTitleText()
    json.bestDescription = @bestDescriptionText()
    json



class Gruff.Collections.Debates extends Backbone.Collection
  model: Gruff.Models.Debate
  url: '/rest/debates'


classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Debate, exports.Debate
