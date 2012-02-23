Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-list-item-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @showView = options.showView
    @attributeType = options.attributeType
    @dontShow = false

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
    @.$("> h4.title a.title-link").bind "click", @toggleInfo
    @.$("> h4.title a.title-link").bind "dblclick", @showEditTitleForm
    @.$("> h4.title a.zoom-link").bind "click", @openModalView
    @.$("> .body").bind "dblclick", @showEditDescriptionForm

  cancelEvents: =>
    @.$("> h4.title a.title-link").unbind
    @.$("> .body").unbind

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
        @doToggleInfo(e)
        @clickTimeout = null
      , 500
      )
      false

  doToggleInfo: (e) =>
    if @model.get("type") == @model.DebateTypes.DIALECTIC
      containerEl = @.$('> div.arguments')
    else
      containerEl = @.$('> div.answers')
    if ($(containerEl).css("display") == "none")
      @showInfo()
    else
      @hideInfo()
    false

  showInfo: (e) =>
    if @dontShow
      @dontShow = false
      return false
    if @model.get("type") == @model.DebateTypes.DIALECTIC
      containerEl = @.$('> div.arguments')
    else
      containerEl = @.$('> div.answers')
    @model.fetchSubdebates(
      error: =>
        alert "Error"
      success: (subdebates, response4) =>
        json = @model.fullJSON()
        json.loggedIn = true
        unless $(@el).hasClass('ui-draggable-dragging')
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
          @showDescription()
          containerEl.show()
    )

  hideInfo: =>
    @hideDescription()
    if @model.get("type") == @model.DebateTypes.DIALECTIC
      @.$('> div.arguments').hide()
      @argumentsForView?.close()
      @argumentsAgainstView?.close()
    else
      answersEl = @.$('> div.answers > .debates-list').first()
      answersEl.hide()
      @answersView?.close()

  toggleDescription: (e) =>
    unless $(@el).hasClass('ui-draggable-dragging')
      @.$('> div.body').toggle()
    false

  showDescription: =>
    @.$('> div.body').show()

  hideDescription: =>
    @.$('> div.body').hide()

  openModalView: (e, ui) =>
    @hideInfo()
    @showView.toggleSubdebateDiv(@)
    false

  closeModalView: ->

  enableDragDrop: =>
    @.$('> h4 a.title-link').droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      hoverClass: 'over'
      greedy: true
      over: (e, ui) =>
        @.$('> h4').addClass('over')
        @hoverTimeout = setTimeout( 
          () => 
            @showInfo(e, ui)
          , 1000
        )
      out: (e, ui) =>
        clearTimeout @hoverTimeout
        @.$('> h4').removeClass('over')
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        @mergeDebates dragged, event.target
    )

    @.$('> h4 a.zoom-link').droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      greedy: true
      over: (e, ui) =>
        @.$('> h4').addClass('over')
        @hoverTimeout = setTimeout( 
          () => 
            @openModalView(e, ui)
          , 1000
        )
      out: (e, ui) =>
        clearTimeout @hoverTimeout
        @.$('> h4').removeClass('over')
      drop: ( event, ui ) =>
        alert "Dropping a debate onto the modal link does nothing"
    )

    $(@el).draggable(
      revert: true
      refreshPositions: true
      start: (e, ui) =>
        @dragStartTimeout = setTimeout(
          () =>
            @dontShow = true
            @hideInfo()
          , 500
        )
        w = Math.min(
          @.$("> h4 > a.title-link").width() + @.$("> h4 > a.zoom-link").width() + 10
          @.$("> h4").width()
        )
        $(e.target).width(w)
      stop: (e, ui) =>
        clearTimeout @dragStartTimeout
        $(e.target).width("100%")
    )

  close: ->
    @el.remove()
    @unbind()

  mergeDebates: (dragged, target) =>
    alert "Dropping one debate onto another has not yet been implemented"
