Gruff.Views.Debates ||= {}
Gruff.Views.Debates.ShowViews ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @tags_template = _.template $('#tags-index-template').text()
    @childView = options.childView
    @childView.parentView = @ if @childView?
    @parentView = options.parentView
    @parentView.childView = @ if @parentView?
    @loaded = false
    @status = "unrendered"
    Gruff.Views.Debates.ShowViews[@model.id] = @
    
  render: ->
    json = @model.fullJSON()
    json.loggedIn = true
    $(@el).html(@template json)
    @zoomLink = @.$('> .canvas-title .zoom-link')
    @renderParents()
    @setUpEvents()
    @zoomLink.hide()
    @status = "rendered"
    @

  renderParents: =>
    parentId = @model.get("parentId")
    if parentId? && !@model.parent?
      @model.parent = new Gruff.Models.Debate {"_id": parentId}
      @model.parent.fetch
        success: (model, response) =>
          parentEl = $(@el).clone()
          parentEl.attr('id', parentId)
          $(@el).before(parentEl)
          @parentView = new Gruff.Views.Debates.ShowView 
            'el': parentEl
            'model': @model.parent
            'childView': @
          @parentView.render()
          @parentView.minimize()
          @indentTitle()
    else
      @parentView?.childView = @
      @indentTitle()

  indentTitle: =>
    parents = 0
    currParent = @model.parent
    while currParent?
      parents++
      currParent = currParent.parent
    @.$('> div.title').css('margin-left', 5*parents+'%')

  showNewDebateForm: (e) =>
    debateType = $(e.target).attr("debate-type")
    collection = @model[debateType]
    $(e.target).hide()
    formDiv = $('#'+@model.id+'-new-'+debateType+'-div')
    formDiv.show()
    formView = new Gruff.Views.Debates.NewView
      'el': formDiv
      'collection': collection
      'attributeType': debateType
    formView.render()

  setUpEvents: =>
    @.$("> .title").bind "click", @toggleDescription
    @.$("> .title").bind "dblclick", @showEditTitleForm
    @.$("> .description").bind "dblclick", @showEditDescriptionForm
    @zoomLink.bind "click", @maximize
    @setUpHandleKeys()

  setUpMinimizeEvents: =>
    @.$("> .title").bind "click", @toggleDescription
    @zoomLink.show()
    @setUpZoomLinkDragDrop()

  setUpMaximizeEvents: =>
    @zoomLink.hide()
    @.$("> .title").unbind "click", @toggleDescription
    @.$(".bottom-form .new-debate-link").bind "click", @showNewDebateForm
    @setUpDragDrop()

  setUpHandleKeys: =>
    $(document).bind('keydown', @handleKeys)

  cancelHandleKeys: =>
    $(document).unbind('keydown', @handleKeys)

  handleKeys: (e) =>
    if $("input:focus, textarea:focus").length > 0
      return true
    if e.keyCode == 65
      @.$('[debate-type="argumentsAgainst"], [debate-type="answers"]').click()
      false
    else if e.keyCode == 70
      @.$('[debate-type="argumentsFor"]').click()
      false
    else if e.keyCode == 83
      @.$('[debate-type="subdebates"]').click()
      false
    else
      true

  setUpDragDrop: =>
    _this = @
    @.$( "> .arguments > .for, > .arguments > .against, > .subdebates, > .answers" ).droppable(
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
    @.$( ".argument, .answer, .subdebate" ).draggable( "option", "disabled", true )
    @.$( ".argument, .answer, .subdebate" ).droppable( "option", "disabled", true )
    @.$( ".for, .against, .subdebates, .answers" ).droppable( "option", "disabled", true )

  enableDragDrop: =>
    @.$( ".argument, .answer, .subdebate" ).draggable( "option", "disabled", false )
    @.$( ".argument, .answer, .subdebate" ).droppable( "option", "disabled", false )
    @.$( ".for, .against, .subdebates, .answers" ).droppable( "option", "disabled", false )

  toggleDescription: (e) =>
    @.$('> div.description').toggle()
    false

  toggleSubdebateDiv: (listItemView) ->
    if @modalView?
      @modalView.close()
      @modalView = null
      @enableDragDrop()
      listItemView.closeModalView()
    else
      subdebateDiv = listItemView.el[0]
      subdebateDiv = $(subdebateDiv).parents('.debate-list-item')[0] unless $(subdebateDiv).hasClass('debate-list-item')
      @disableDragDrop()
      if ui?
        dragged = ui.helper
        $(dragged).draggable( "option", "disabled", false )
      $(subdebateDiv).droppable( "option", "disabled", false )
      overDebate = @model.findDebate subdebateDiv.id
      @modalView = new Gruff.Views.Debates.SubdebateView
        'el': $(subdebateDiv).find('> .subdebate-show')
        'model': overDebate
        'parentView': @
      @modalView.render()

  showEditTitleForm: (e) =>
    e.preventDefault()
    e.stopPropagation()
    clearTimeout @clickTimeout
    @clickTimeout = null
    editTitleView = new Gruff.Views.Debates.EditTitleView
      'el': e.target
      'titleEl': e.target
      'model': @model
    editTitleView.render()

  showEditDescriptionForm: (e) =>
    e.preventDefault()
    e.stopPropagation() 
    editDescriptionView = new Gruff.Views.Debates.EditDescriptionView
      'el': e.target
      'descriptionEl': e.target
      'model': @model
    editDescriptionView.render()

  minimize: () =>
    if @isOffScreen
      @onScreen()
    @parentView?.minimize()
    @.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').hide()
    @setUpMinimizeEvents()
    @status = "minimized"
    false

  maximize: () =>
    @status = "maximized"
    unless @isDragging()
      @focus()
    if @loaded
      @.$('> .description, > .tags, > .arguments, > .answers, > .subdebates, > .comments').show(200)
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
          json.baseurl = (json.attributetype!="") ? "/"+json.objecttype+"/"+json.objectid+"/tag/" : "/"+json.objecttype+"/"+json.objectid+"/"+json.attributetype+"/"+json.attributeid+"/tag/"
  
          @.$('.tags').html(@tags_template json)
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
    @argumentsForView?.close()
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

  show: ->
    $(@el).show(200)

  focus: ->
    if @isOffScreen
      @onScreen()
    @childView?.hide()
    @parentView?.minimize()

  offScreen: ->
    unless @isOffScreen
      height = $(@el).height() - @.$('> .canvas-title').height()
      childPos = $(@childView.el).offset()
      $(@childView.el).offset
        left: childPos.left
        top: childPos.top - height
      @isOffScreen = true

  onScreen: ->
    if @isOffScreen
      height = $(@el).height() - @.$('> .canvas-title').height()
      childPos = $(@childView.el).offset()
      $(@childView.el).offset
        left: childPos.left
        top: childPos.top + height
      @isOffScreen = false
