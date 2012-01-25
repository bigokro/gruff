Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-list-item-template').text()
    @parentEl = options.parentEl

  events:
    "click .title a": "toggleDescription"

  render: ->
    json = @model.fullJSON()
    $(@parentEl).append(@template json)
    @el = $('#'+@model.linkableId())
    @.$("h4.title a").bind("click", @.toggleDescription)
    @

  toggleDescription: (e) =>
    e.stopPropagation()
    @.$('div.body').toggle()
    false

