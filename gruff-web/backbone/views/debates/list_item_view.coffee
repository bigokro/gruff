Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-list-item-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @attributeType = options.attributeType

  render: ->
    json = @model.fullJSON()
    if @attributeType == "argumentsFor" then json.divClass = "argument argumentFor"
    if @attributeType == "argumentsAgainst" then json.divClass = "argument argumentAgainst"
    if @attributeType == "answers" then json.divClass = "answers"
    if @attributeType == "subdebates" then json.divClass = "subdebate"
    $(@parentEl).append(@template json)
    @el = $('#'+@model.linkableId())
    @.$("h4.title a").bind("click", @showDetails)
    @

  toggleDescription: (e) =>
    e.stopPropagation()
    parent = $(e.target).parents('.debate-list-item')[0]
    unless $(parent).hasClass('ui-draggable-dragging')
      @.$('div.body').toggle()
    false

  showDetails: (e) =>
    @parentView.parentView.toggleSubdebateDiv(e)

  enableDragDrop: =>
    $(@el).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      hoverClass: 'over'
      greedy: true
      over: (e) =>
        @showSubdebates()
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        @moveDebate dragged, event.target
    )

   showSubdebates: =>
    subdebatesView = new Gruff.Views.Debates.SubdebatesView
      'el': @el
      'model': @model
    subdebatesView.render()
