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
    @.$("h4.title a.title-link").bind("click", @toggleDescription)
    @.$("h4.title a.title-link").bind("click", @toggleSubdebates)
    @.$("h4.title a.zoom-link").bind("click", @showDetails)
    @

  toggleDescription: (e) =>
    e.stopPropagation()
    parent = $(e.target).parents('.debate-list-item')[0]
    unless $(parent).hasClass('ui-draggable-dragging')
      @.$('div.body').toggle()
    false

  toggleSubdebates: (e) =>
    e.stopPropagation()
    parent = $(e.target).parents('.debate-list-item')[0]
    if @model.get("type") == @model.DebateTypes.DIALECTIC
      containerEl = @.$('> div.arguments')
    else
      containerEl = @.$('> div.answers')
    if ($(containerEl).css("display") == "none")
      containerEl.show()
      @model.fetchSubdebates(
        success: (subdebates, response4) =>
          json = @model.fullJSON()
          json.loggedIn = true
          unless $(parent).hasClass('ui-draggable-dragging')
            if @model.get("type") == @model.DebateTypes.DIALECTIC
              @.$('div.arguments').show()
              forEl = @.$('> div.arguments > .for .debates-list').first()
              againstEl = @.$('> div.arguments > .against .debates-list').first()
              @argumentsForView = new Gruff.Views.Debates.ListView
                'el': forEl
                'collection': @model.argumentsFor
                'attributeType': 'argumentsFor'
                'parentView': @
              @argumentsForView.render()
              @argumentsAgainstView = new Gruff.Views.Debates.ListView
                'el': againstEl
                'collection': @model.argumentsAgainst
                'attributeType': 'argumentsAgainst'
                'parentView': @
              @argumentsAgainstView.render()
            else
              answersEl = @.$('> div.answers > .debates-list').first()
              answersEl.show()
              @answersView = new Gruff.Views.Debates.ListView
                'el': answersEl
                'collection': @model.answers
                'attributeType': 'answers'
                'parentView': @
              @answersView.render()
      )
    else
      @argumentsForView?.close()
      @argumentsForView = null
      @argumentsAgainstView?.close()
      @argumentsAgainstView = null
      @answersView?.close()
      @answersView = null
      containerEl.hide()
    false

  showDetails: (e) =>
    @parentView.parentView.toggleSubdebateDiv(e)
    false

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
