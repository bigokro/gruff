Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-list-item-template').text()

  constructor: (options) ->
    super(options)
    @parentEl = options.parentEl
    @model = options.model

  events:
    "click .title": "showDescription"

  render: ->
    json = @model.fullJSON()
    $(@parentEl).append(@template json)
    @el = $('#'+@model.linkableId())
    @

  showDescription: (e) ->
    $(@el).find('.body').show()