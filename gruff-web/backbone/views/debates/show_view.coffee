Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @tags_template = _.template $('#tags-index-template').text()

  events:
    "click .new-debate-link": "showNewDebateForm"

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
                        'el': $(@el).find('.answers .debates-list'),
                        'collection': answers,
                        'attributeType': 'answers'
                      @answersView.render()
                    if @model.get("type") == @model.DebateTypes.DIALECTIC
                      @argumentsForView = new Gruff.Views.Debates.ListView
                        'el': $(@el).find('.arguments .for .debates-list'),
                        'collection': argumentsFor,
                        'attributeType': 'argumentsFor'
                      @argumentsForView.render()
                      @argumentsAgainstView = new Gruff.Views.Debates.ListView
                        'el': $(@el).find('.arguments .against .debates-list'),
                        'collection': argumentsAgainst,
                        'attributeType': 'argumentsAgainst'
                      @argumentsAgainstView.render()
                    @subdebatesView = new Gruff.Views.Debates.ListView
                      'el': $(@el).find('.subdebates .debates-list'),
                      'collection': subdebates,
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
      'el': formDiv, 
      'collection': collection, 
      'attributeType': debateType
    formView.render()

  enableDragDrop: =>
    $( ".argument" ).draggable({ revert: true })
    $( ".argument" ).width (index, width) ->
      el = $("#"+this.id)
      el.find("h4 > a").width()

    $( ".for, .against" ).droppable(
      accept: '.subdebate, .argument, .debate'
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        if true || isTheSameDivThatContainsThisGuy
          @moveDebate dragged, event.target
        else
          $(this).removeClass('over')
      over: ( event, ui ) =>
        if true || isTheSameDivThatContainsThisGuy
          $(this).addClass('over')
      out: ( event, ui ) =>
        $(this).removeClass('over')
    )

    $( ".argument" ).droppable(
      accept: '.subdebate, .argument, .debate'
      hoverClass: 'over'
      greedy: true
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        @moveDebate dragged, event.target
    )

  moveDebate: (dragged, dropped) =>
    droppedParent = $(dropped).parents('.debate')[0]
    droppedDebateId = droppedParent.id
    droppedDebate = @model.findDebate droppedDebateId
    newCollection = droppedDebate.getCollectionByName dropped.className

    debate = @model.findDebate dragged.id
    oldCollection = debate.parentCollection

    oldCollection.remove debate
    newCollection.add debate

    debate.save()
    oldCollection.parent.save()
    newCollection.parent.save() if oldCollection.parent != newCollection.parent
