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
    @model.answers.fetch 
      success: (answers, response1) =>
        @model.argumentsFor.fetch
          success: (argumentsFor, response2) =>
            @model.argumentsAgainst.fetch
              success: (argumentsAgainst, response3) =>
                @model.subdebates.fetch
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
                        'el': $(@el).find('.answers .debates-list')
                        'collection': answers
                        'attributeType': 'answers'
                      @answersView.render()
                    if @model.get("type") == @model.DebateTypes.DIALECTIC
                      @argumentsForView = new Gruff.Views.Debates.ListView
                        'el': $(@el).find('.arguments .for .debates-list')
                        'collection': argumentsFor
                        'attributeType': 'argumentsFor'
                      @argumentsForView.render()
                      @argumentsAgainstView = new Gruff.Views.Debates.ListView
                        'el': $(@el).find('.arguments .against .debates-list')
                        'collection': argumentsAgainst
                        'attributeType': 'argumentsAgainst'
                      @argumentsAgainstView.render()
                    @subdebatesView = new Gruff.Views.Debates.ListView
                      'el': $(@el).find('.subdebates .debates-list')
                      'collection': subdebates
                      'attributeType': 'subdebates'
                    @subdebatesView.render()
                    @enableDragDrop()
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

  enableDragDrop: =>
    $( ".argument" ).draggable({ revert: true })
    $( ".answer" ).draggable({ revert: true })
    $( ".subdebate" ).draggable({ revert: true })
    $( ".argument" ).width (index, width) ->
      el = $("#"+this.id)
      el.find("h4 > a").width()

    $( ".for, .against, .subdebates, .answers" ).droppable(
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

    $( ".argument, .subdebate, .answer" ).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      hoverClass: 'over'
      greedy: true
      over: (e, ui) =>
        @timeout = setTimeout( 
          () => 
            @showSubdebateDiv(e)
          , 1500
        )
      out: (e, ui) =>
        clearTimeout(@timeout)
    )

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

  showSubdebateDiv: (e) ->
    overDebate = @model.findDebate e.target.id
    @modalView?.close()
    @modalView = new Gruff.Views.Debates.SubdebateView
      'el': $(e.target).find('.subdebate')
      'model': overDebate
      'parentView': @
    @modalView.render()

