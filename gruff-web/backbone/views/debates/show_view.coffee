Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @tags_template = _.template $('#tags-index-template').text()
    

  events:
    "click .new-debate-link": "showNewDebateForm"
    "dblclick .debate-list-item .title": "showEditTitleForm"
    "dblclick .debate-list-item .body": "showEditDescriptionForm"

  render: ->
    @model.fetchSubdebates(
      success: (subdebates, response4) =>
        json = @model.fullJSON()
        json.loggedIn = true
        $(@el).html(@template json)
    
        json.objecttype = "debates"
        json.objectid = json.linkableId
        json.attributetype = ""
        json.attributeid = ""
        json.baseurl = (json.attributetype!="") ? "/"+json.objecttype+"/"+json.objectid+"/tag/" : "/"+json.objecttype+"/"+json.objectid+"/"+json.attributetype+"/"+json.attributeid+"/tag/"

        $(@el).find('.tags').html(@tags_template json)
        if @model.get("type") == @model.DebateTypes.DEBATE
          @answersView = new Gruff.Views.Debates.ListView
            'el': $(@el).find('.answers .debates-list').first()
            'collection': @model.answers
            'attributeType': 'answers'
            'parentView': @
            'showView': @
          @answersView.render()
        if @model.get("type") == @model.DebateTypes.DIALECTIC
          @argumentsForView = new Gruff.Views.Debates.ListView
            'el': $(@el).find('> .arguments > .for .debates-list').first()
            'collection': @model.argumentsFor
            'attributeType': 'argumentsFor'
            'parentView': @
            'showView': @
          @argumentsForView.render()
          @argumentsAgainstView = new Gruff.Views.Debates.ListView
            'el': $(@el).find('> .arguments > .against .debates-list').first()
            'collection': @model.argumentsAgainst
            'attributeType': 'argumentsAgainst'
            'parentView': @
            'showView': @
          @argumentsAgainstView.render()
        @subdebatesView = new Gruff.Views.Debates.ListView
          'el': $(@el).find('> .subdebates .debates-list').first()
          'collection': @model.subdebates
          'attributeType': 'subdebates'
          'parentView': @
          'showView': @
        @subdebatesView.render()
        @setUpDragDrop()
    )
    @

  showNewDebateForm: (e) ->
    debateType = $(e.target).attr("debate-type")
    collection = @model[debateType]
    $(e.target).hide()
    formDiv = $('#new-'+debateType+'-div')
    formDiv.show()
    formView = new Gruff.Views.Debates.NewView
      'el': formDiv
      'collection': collection
      'attributeType': debateType
    formView.render()

  setUpDragDrop: =>
    $(@el).find( ".argument, .answer, .subdebate" ).draggable(
      revert: true
      refreshPositions: true
      start: (e, ui) ->
        $(e.target).width($(e.target).find("h4 > a.title-link").width())
      stop: (e, ui) ->
        $(e.target).width("100%")
    )

    $(@el).find( ".for, .against, .subdebates, .answers" ).droppable(
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

    $(@el).find( ".argument, .subdebate, .answer" ).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      hoverClass: 'over'
      greedy: true
      over: (e, ui) =>
        @timeout = setTimeout( 
          () => 
            @toggleSubdebateDiv(e, ui)
          , 1000
        )
      out: (e, ui) =>
        clearTimeout(@timeout)
    )

  disableDragDrop: =>
    $(@el).find( ".argument, .answer, .subdebate" ).draggable( "option", "disabled", true )
    $(@el).find( ".argument, .answer, .subdebate" ).droppable( "option", "disabled", true )
    $(@el).find( ".for, .against, .subdebates, .answers" ).droppable( "option", "disabled", true )

  enableDragDrop: =>
    $(@el).find( ".argument, .answer, .subdebate" ).draggable( "option", "disabled", false )
    $(@el).find( ".argument, .answer, .subdebate" ).droppable( "option", "disabled", false )
    $(@el).find( ".for, .against, .subdebates, .answers" ).droppable( "option", "disabled", false )

  showEditTitleForm: (e) ->
    clickedDebateId = $(e.target).parents('.debate-list-item')[0].id
    clickedDebate = @model.findDebate clickedDebateId
    editTitleView = new Gruff.Views.Debates.EditTitleView
      'el': e.target
      'model': clickedDebate
    editTitleView.render()

  showEditDescriptionForm: (e) ->
    clickedDebateId = $(e.target).parents('.debate-list-item')[0].id
    clickedDebate = @model.findDebate clickedDebateId
    editDescriptionView = new Gruff.Views.Debates.EditDescriptionView
      'el': e.target
      'model': clickedDebate
    editDescriptionView.render()

  toggleSubdebateDiv: (e, ui) ->
    if @modalView?
      @modalView.close()
      @modalView = null
      @enableDragDrop()
    else
      subdebateDiv = e.target
      subdebateDiv = $(e.target).parents('.debate-list-item')[0] unless $(e.target).hasClass('debate-list-item')
      @disableDragDrop()
      if ui?
        dragged = ui.draggable[0]
        $(dragged).draggable( "option", "disabled", false )
      $(subdebateDiv).droppable( "option", "disabled", false )
      overDebate = @model.findDebate subdebateDiv.id
      @modalView = new Gruff.Views.Debates.SubdebateView
        'el': $(subdebateDiv).find('.subdebate-show')
        'model': overDebate
        'parentView': @
      @modalView.render()

