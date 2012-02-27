Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @tags_template = _.template $('#tags-index-template').text()
    @rendered = false
    
  render: ->
    json = @model.fullJSON()
    json.loggedIn = true
    $(@el).html(@template json)
    @renderParents()
    @setUpEvents()
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
          @parentView.render()
          @parentView.minimize()
          @indentTitle()
    else
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
    @.$("> .title").bind "click", @maximize
    @.$("> .title").bind "dblclick", @showEditTitleForm
    @.$("> .description").bind "dblclick", @showEditDescriptionForm
    @setUpHandleKeys()

  setUpMaximizeEvents: =>
    @.$("> .title").unbind "click", @maximize
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
    @.$( ".for, .against, .subdebates, .answers" ).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        $(event.target).removeClass('over')
        if $(event.target).has(dragged).length == 0
          @moveDebate dragged, event.target
      over: ( event, ui ) =>
        dragged = ui.draggable[0]
        if $(event.target).has(dragged).length == 0
          $(event.target).addClass('over')
      out: ( event, ui ) =>
        $(event.target).removeClass('over')
    )

  disableDragDrop: =>
    @.$( ".argument, .answer, .subdebate" ).draggable( "option", "disabled", true )
    @.$( ".argument, .answer, .subdebate" ).droppable( "option", "disabled", true )
    @.$( ".for, .against, .subdebates, .answers" ).droppable( "option", "disabled", true )

  enableDragDrop: =>
    @.$( ".argument, .answer, .subdebate" ).draggable( "option", "disabled", false )
    @.$( ".argument, .answer, .subdebate" ).droppable( "option", "disabled", false )
    @.$( ".for, .against, .subdebates, .answers" ).droppable( "option", "disabled", false )

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
    @.$('.description, .tags, .arguments, .answers, .subdebates, .comments').hide()

  maximize: () =>
    if @rendered
      @.$('.description, .tags, .arguments, .answers, .subdebates, .comments').show()
    else
      @model.fetchSubdebates(
        success: (subdebates, response4) =>
          @.$('.description, .tags, .arguments, .answers, .subdebates, .comments').show()
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
          @rendered = true
      )
