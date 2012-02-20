Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-list-item-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @showView = options.showView
    @attributeType = options.attributeType

  render: ->
    json = @model.fullJSON()
    if @attributeType == "argumentsFor" then json.divClass = "argument argumentFor"
    if @attributeType == "argumentsAgainst" then json.divClass = "argument argumentAgainst"
    if @attributeType == "answers" then json.divClass = "answers"
    if @attributeType == "subdebates" then json.divClass = "subdebate"
    $(@parentEl).append(@template json)
    @el = $('#'+@model.linkableId())
    @setUpEvents()
    @enableDragDrop()
    @

  setUpEvents: =>
    @.$("h4.title a.title-link").bind "click", @toggleInfo
    @.$("h4.title a.title-link").bind "dblclick", @showEditTitleForm
    @.$("h4.title a.zoom-link").bind "click", @openModalView
    @.$(".body").bind "dblclick", @showEditDescriptionForm

  showEditTitleForm: (e) =>
    e.preventDefault()
    e.stopPropagation()
    clearTimeout @clickTimeout
    @clickTimeout = null
    clickedDebateId = $(e.target).parents('.debate-list-item')[0].id
    clickedDebate = @model.findDebate clickedDebateId
    editTitleView = new Gruff.Views.Debates.EditTitleView
      'el': e.target
      'model': clickedDebate
    editTitleView.render()

  showEditDescriptionForm: (e) =>
    e.preventDefault()
    e.stopPropagation() 
    clickedDebateId = $(e.target).parents('.debate-list-item')[0].id
    clickedDebate = @model.findDebate clickedDebateId
    editDescriptionView = new Gruff.Views.Debates.EditDescriptionView
      'el': e.target
      'model': clickedDebate
    editDescriptionView.render()

  toggleInfo: (e) =>
    if @clickTimeout?
      false
    else
      @clickTimeout = setTimeout( () =>
        @toggleSubdebates(e)
        @clickTimeout = null
      , 500
      )
      false

  hideInfo: =>
    @.$('div.body').hide()
    @.$('div.answers').hide()
    @.$('div.arguments').hide()

  toggleDescription: (e) =>
    parent = $(e.target).parents('.debate-list-item')[0]
    unless $(parent).hasClass('ui-draggable-dragging')
      @.$('> div.body').toggle()
    false

  toggleSubdebates: (e) =>
    parent = $(e.target).parents('.debate-list-item')[0]
    if @model.get("type") == @model.DebateTypes.DIALECTIC
      containerEl = @.$('> div.arguments')
    else
      containerEl = @.$('> div.answers')
    if ($(containerEl).css("display") == "none")
      @model.fetchSubdebates(
        error: =>
          alert "Error"
        success: (subdebates, response4) =>
          json = @model.fullJSON()
          json.loggedIn = true
          unless $(parent).hasClass('ui-draggable-dragging')
            if @model.get("type") == @model.DebateTypes.DIALECTIC
              @.$('div.arguments').show()
              forEl = @.$('> div.arguments > .for .debates-list').first()
              againstEl = @.$('> div.arguments > .against .debates-list').first()
              @argumentsForView = new Gruff.Views.Debates.MiniListView
                'el': forEl
                'collection': @model.argumentsFor
                'attributeType': 'argumentsFor'
                'parentView': @
                'showView': @showView
              @argumentsForView.render()
              @argumentsAgainstView = new Gruff.Views.Debates.MiniListView
                'el': againstEl
                'collection': @model.argumentsAgainst
                'attributeType': 'argumentsAgainst'
                'parentView': @
                'showView': @showView
              @argumentsAgainstView.render()
            else
              answersEl = @.$('> div.answers > .debates-list').first()
              answersEl.show()
              @answersView = new Gruff.Views.Debates.MiniListView
                'el': answersEl
                'collection': @model.answers
                'attributeType': 'answers'
                'parentView': @
                'showView': @showView
              @answersView.render()
            @toggleDescription(e)
            containerEl.show()
      )
    else
      @argumentsForView?.close()
      @argumentsForView = null
      @argumentsAgainstView?.close()
      @argumentsAgainstView = null
      @answersView?.close()
      @answersView = null
      containerEl.hide()
      @toggleDescription(e)
    false

  openModalView: (e, ui) =>
    @hideInfo()
    @showView.toggleSubdebateDiv(e, ui)
    false

  enableDragDrop: =>
    $(@el).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      hoverClass: 'over'
      greedy: true
      over: (e, ui) =>
        @hoverTimeout = setTimeout( 
          () => 
            @openModalView(e, ui)
          , 1000
        )
      out: (e, ui) =>
        clearTimeout @hoverTimeout
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        @moveDebate dragged, event.target
    )

    $(@el).draggable(
      revert: true
      refreshPositions: true
      start: (e, ui) ->
        $(e.target).width($(e.target).find("h4 > a.title-link").width())
      stop: (e, ui) ->
        $(e.target).width("100%")
    )

