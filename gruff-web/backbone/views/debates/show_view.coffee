Gruff.Views.Debates ||= {}
Gruff.Views.Debates.ShowViews ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @childView = options.childView
    @childView.parentView = @ if @childView?
    @parentView = options.parentView
    @parentView.childView = @ if @parentView?
    @loaded = false
    @status = "unrendered"
    @subdebateListsSelector = "> .arguments > .for, > .arguments > .against, > .subdebates, > .answers"
    @subdebatesSelector = '> .debates-list > .debate-list-item'
    @newDebateFormViews ||= []
    Gruff.Views.Debates.ShowViews[@model.id] = @
    
  render: ->
    json = @model.fullJSON()
    json.loggedIn = true
    json.typeHeading = @getTypeHeading()
    $(@el).html(@template json)
    @zoomLink = @.$('> .canvas-title .zoom-link')
    @renderTags()
    @renderParents()
    @setUpEvents()
    @zoomLink.hide()
    @status = "rendered"
    @

  renderTags: =>
    @model.tags = new Gruff.Collections.Tags
      parent: @model
    @model.tags.resetFromArray @model.get("tags")
    @tagsView = new Gruff.Views.Tags.IndexView
      el: @.$('> .tags')
      collection: @model.tags
      parentView: @
    @tagsView.render()

  renderParents: =>
    parentId = @model.get("parentId")
    if parentId? && !@model.parent?
      @model.parent = new Gruff.Models.Debate {"_id": parentId}
      @model.parent.fetch
        success: (model, response) =>
          @createParentView(null)
    else if @parentView?.model != @model.parent
      @createParentView(@parentView)
    else
      @parentView?.childView = @
      @indentTitle()

  createParentView: (parentView) =>
    parentId = @model.get("parentId")
    parentEl = $(@el).clone()
    parentEl.attr('id', parentId)
    $(@el).before(parentEl)
    @parentView = new Gruff.Views.Debates.ShowView 
      'el': parentEl
      'model': @model.parent
      'childView': @
      'parentView': parentView
    @parentView.render()
    @parentView.minimize()
    @indentTitle()

  mySubdebateLists: ->
    @.$(@subdebateListsSelector)

  mySubdebates: ->
    @mySubdebateLists().find(@subdebatesSelector)

  indentTitle: =>
    parents = 0
    currParent = @model.parent
    while currParent?
      parents++
      currParent = currParent.parent
    @.$('> div.title').css('margin-left', 5*parents+'%')
    @childView?.indentTitle()

  showNewDebateForm: (e) =>
    debateType = e
    debateType = $(e.target).attr("debate-type") if e.target?
    collection = @model[debateType]
    $(e.target).hide()
    formDiv = $('#'+@model.id+'-new-'+debateType+'-div')
    formDiv.show()
    formView = new Gruff.Views.Debates.NewView
      'el': formDiv
      'collection': collection
      'attributeType': debateType
    formView.render()
    @newDebateFormViews.push formView

  setUpEvents: =>
    @.$("> .title").bind "click", @toggleDescription
    @.$("> .title").bind "dblclick", @showEditTitleForm
    @.$("> .description").bind "dblclick", @showEditDescriptionForm
    @zoomLink.bind "click", @maximize
    @model.bind "change", @handleModelChanges

  setUpMinimizeEvents: =>
    @.$("> .title").bind "click", @toggleDescription
    @zoomLink.show()
    @setUpZoomLinkDragDrop()
    @cancelHandleKeys()

  setUpMaximizeEvents: =>
    @zoomLink.hide()
    @.$("> .title").unbind "click", @toggleDescription
    @.$(".bottom-form .new-debate-link").bind "click", @showNewDebateForm
    @.$(".selectable").bind "click", @selectClicked
    @setUpDragDrop()
    @setUpHandleKeys()

  setUpHandleKeys: =>
    $(document).bind('keydown', @handleKeys)

  cancelHandleKeys: =>
    $(document).unbind('keydown', @handleKeys)

  handleKeys: (e) =>
    if $("input:focus, textarea:focus").length > 0
      return true
    if e.keyCode == 65       # a
      if @argumentsForView?
        @showNewDebateForm("argumentsAgainst")
      else
        @showNewDebateForm("answers")
      false
    else if e.keyCode == 70  # f
      @showNewDebateForm("argumentsFor")
      false
    else if e.keyCode == 83  # s
      @showNewDebateForm("subdebates")
      false
    else if e.keyCode == 84  # t
      @tagsView.showForm()
      false
    else if e.keyCode == 90  # z
      $('.selected > .title > .zoom-link, .selected > .zoom-link').click()
      false
    else if e.keyCode == 68  # d
      $('.selected > .title > .delete-link').click()
      false
    else if e.keyCode == 13  # enter
      @handleEnter()
      false
    else if e.keyCode == 32  # spacebar
      @handleEnter()
      false
    else if e.keyCode == 37  # left arrow
      @selectLeft()
      false
    else if e.keyCode == 38  # up arrow
      @selectPrevious()
      false
    else if e.keyCode == 39  # right arrow
      @selectRight()
      false
    else if e.keyCode == 40  # down arrow
      @selectNext()
      false
    else
      console.log e.keyCode
      true

  handleEnter: ->
    actionEl = $('.selected .selected-enter-action').first()
    linkEl = $('.selected > .title > .title-link')
    if linkEl.length > 0
      linkEl.click()
    else if actionEl.length > 0
      actionEl.click()
    else
      $('.selected').dblclick()

  handleModelChanges: (model, options) =>
    @.$('> .canvas-title > h1 > .attribute-type').html @getTypeHeading()
    @.$('> .canvas-title > h1 > .title-text').html @model.bestTitleText()
    @.$('> .description').html @model.bestDescriptionText()

  setUpDragDrop: =>
    _this = @
    @mySubdebateLists().droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      drop: ( event, ui ) ->
        dragged = ui.draggable[0]
        $(this).removeClass('over')
        unless $(dragged).parent().parent()[0] == this
          _this.moveDebate dragged, $(this)
          ui.helper.hide()
          _this.focus()
      over: ( event, ui ) ->
        dragged = ui.draggable[0]
        unless $(dragged).parent().parent()[0] == this
          $(this).addClass('over')
      out: ( event, ui ) ->
        $(this).removeClass('over')
    )

  setUpZoomLinkDragDrop: =>
    @.$('> .canvas-title').add(@zoomLink).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      greedy: true
      over: (e, ui) =>
        @.$('> .canvas-title').addClass('over')
        @hoverTimeout = setTimeout( 
          () => 
            @maximize()
            ui.helper.show()
            ui.draggable.show()
          , 500
        )
      out: (e, ui) =>
        @.$('> .canvas-title').removeClass('over')
        clearTimeout @hoverTimeout
      drop: ( event, ui ) =>
        alert "Dropping a debate onto the zoom link does nothing"
    )

  disableDragDrop: =>
    @mySubdebateLists().droppable("destroy")
    @argumentsForView?.disableDragDrop()
    @argumentsAgainstView?.disableDragDrop()
    @answersView?.disableDragDrop()
    @subdebatesView?.disableDragDrop()

  enableDragDrop: =>
    @mySubdebateLists().droppable( "enable" )
    @argumentsForView?.enableDragDrop()
    @argumentsAgainstView?.enableDragDrop()
    @answersView?.enableDragDrop()
    @subdebatesView?.enableDragDrop()

  toggleDescription: (e) =>
    @.$('> div.description').toggle()
    false

  showEditTitleForm: (e) =>
    e.preventDefault()
    e.stopPropagation()
    clearTimeout @clickTimeout
    @clickTimeout = null
    @editTitleView = new Gruff.Views.Debates.EditTitleView
      'el': e.target
      'titleEl': e.target
      'model': @model
    @editTitleView.render()

  showEditDescriptionForm: (e) =>
    e.preventDefault()
    e.stopPropagation() 
    @editDescriptionView = new Gruff.Views.Debates.EditDescriptionView
      'el': e.target
      'descriptionEl': e.target
      'model': @model
    @editDescriptionView.render()

  minimize: () =>
    if @isOffScreen
      @onScreen()
    else if @status == 'hidden'
      @show()
    @parentView?.minimize()
    @.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').hide()
    @setUpMinimizeEvents()
    @tagsView.hideForm()
    @editTitleView?.close()
    @editDescriptionView?.close()
    _.each @newDebateFormViews, (formView) ->
      formView.close()
    @newDebateFormViews = []
    @status = "minimized"
    false

  maximize: () =>
    @status = "maximized"
    @focus() unless @isDragging()
    if @loaded
      @.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').show(200)
      @parentView?.childView = @
      @setUpMaximizeEvents()
    else
      @model.fetchSubdebates(
        success: (subdebates, response4) =>
          @.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').show(200)
          json = @model.fullJSON()
          json.loggedIn = true
          json.objecttype = "debates"
          json.objectid = json.linkableId
          json.attributetype = ""
          json.attributeid = ""
          json.typeHeading = @getTypeHeading()
          json.baseurl = (json.attributetype!="") ? "/"+json.objecttype+"/"+json.objectid+"/tag/" : "/"+json.objecttype+"/"+json.objectid+"/"+json.attributetype+"/"+json.attributeid+"/tag/"
  
          if @model.get("type") == @model.DebateTypes.DEBATE
            @answersView = new Gruff.Views.Debates.ListView
              'el': @.$('.answers .debates-list').first()
              'collection': @model.answers
              'attributeType': 'answers'
              'parentView': @
              'showView': @
            @answersView.render()
          if @model.get("type") == @model.DebateTypes.DIALECTIC
            @argumentsForView = new Gruff.Views.Debates.ListView
              'el': @.$('> .arguments > .for .debates-list').first()
              'collection': @model.argumentsFor
              'attributeType': 'argumentsFor'
              'parentView': @
              'showView': @
            @argumentsForView.render()
            @argumentsAgainstView = new Gruff.Views.Debates.ListView
              'el': @.$('> .arguments > .against .debates-list').first()
              'collection': @model.argumentsAgainst
              'attributeType': 'argumentsAgainst'
              'parentView': @
              'showView': @
            @argumentsAgainstView.render()
          @subdebatesView = new Gruff.Views.Debates.ListView
            'el': @.$('> .subdebates .debates-list').first()
            'collection': @model.subdebates
            'attributeType': 'subdebates'
            'parentView': @
            'showView': @
          @subdebatesView.render()
          @setUpMaximizeEvents()
          @loaded = true
      )
      false

  close: ->
    @childView?.close()
    @argumensForView?.close()
    @argumentsAgainstView?.close()
    @answersView?.close()
    @subdebatesView?.close()
    $(@el).html('')
    @status = "closed"
    @unbind()

  hide: ->
    @childView?.hide()
    $(@el).hide()
    @status = "hidden"
    @cancelHandleKeys()

  show: ->
    $(@el).show(200)

  focus: ->
    if @isOffScreen
      @onScreen()
    @childView?.hide()
    @parentView?.minimize()
    @setSelected()

  offScreen: ->
    unless @isOffScreen
      @disableDragDrop()
      height = $(@el).height() - @.$('> .canvas-title').height()
      childPos = $(@childView.el).offset()
      $(@childView.el).offset
        left: childPos.left
        top: childPos.top - height
      @isOffScreen = true

  onScreen: ->
    if @isOffScreen
      @enableDragDrop()
      height = $(@el).height() - @.$('> .canvas-title').height()
      childPos = $(@childView.el).offset()
      $(@childView.el).offset
        left: childPos.left
        top: childPos.top + height
      @isOffScreen = false

  getTypeHeading: =>
    result = ""
    switch @model.get("attributeType")
      when "argumentsFor" then result = "For:"
      when "argumentsAgainst" then result = "Against:"
      when "answers" then result = "Answer:"
      when "subdebates" then result = "Sub-debate:"
    result

  setSelected: =>
    @selectEl @.$('> .canvas-title')

  selectPrevious: =>
    @changeSelection(-1)

  selectNext: =>
    @changeSelection(1)

  changeSelection: (relativeIdx) =>
    selected = $('.selected')
    if selected.length > 0
      selectables = $('.selectable:visible')
      nextIdx = 0
      for selectable, i in selectables
        if $(selectable).hasClass('selected')
          nextIdx = i+relativeIdx
          break
      nextIdx = (nextIdx + selectables.length) % selectables.length
      next = selectables[nextIdx]
    else 
      return @setSelected()
    @selectEl next

  selectLeft: =>
    right = $('.against.selected:visible')
    unless right.length > 0 
      right = $('.selected').parents('.against')
    left = right.siblings('.for')
    if left.length > 0 
      @selectEl left

  selectRight: =>
    left = $('.for.selected:visible')
    unless left.length > 0 
      left = $('.selected').parents('.for')
    right = left.siblings('.against')
    if right.length > 0 
      @selectEl right

  selectEl: (el) =>
    $('.selected').removeClass('selected')
    $(el).addClass('selected')
    newTop = $(el).position().top - ($(window).height() / 2)
    $(window).scrollTop newTop

  selectClicked: (e) =>
    @selectEl e.currentTarget
    false
