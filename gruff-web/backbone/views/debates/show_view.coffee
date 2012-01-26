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
                        'debates': answers,
                        'attributeType': 'answers'
                      @answersView.render()
                    if @model.get("type") == @model.DebateTypes.DIALECTIC
                      @argumentsForView = new Gruff.Views.Debates.ListView
                        'el': $(@el).find('.arguments .for .debates-list'),
                        'debates': argumentsFor,
                        'attributeType': 'argumentsFor'
                      @argumentsForView.render()
                      @argumentsAgainstView = new Gruff.Views.Debates.ListView
                        'el': $(@el).find('.arguments .against .debates-list'),
                        'debates': argumentsAgainst,
                        'attributeType': 'argumentsAgainst'
                      @argumentsAgainstView.render()
                    @subdebatesView = new Gruff.Views.Debates.ListView
                      'el': $(@el).find('.subdebates .debates-list'),
                      'debates': subdebates,
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
        if ((ui.draggable.hasClass('argumentFor') && $(this).hasClass('against')) \
            || (ui.draggable.hasClass('argumentAgainst') && $(this).hasClass('for')) \
            || (ui.draggable.hasClass('subdebate')))
          moveTo = $(this).hasClass('for') ? "argumentsFor" : "argumentsAgainst"
          url = "/debates/"+@model.linkableId()+"/moveto/"+moveTo+"/"+dragged.id
        else
          $(this).removeClass('over')
      over: ( event, ui ) =>
        if ((ui.draggable.hasClass('argumentFor') && $(this).hasClass('against')) \
            || (ui.draggable.hasClass('argumentAgainst') && $(this).hasClass('for')) \
            || (ui.draggable.hasClass('subdebate')))
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
        url = "/debates/"+this.id+"/moveto/subdebates/"+dragged.id
    )
