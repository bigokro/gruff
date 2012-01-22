Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @tags_template = _.template $('#tags-index-template').text()

  events:
    "click #new-debate-link": "showNewDebateForm"

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
                    json.answers = answers.fullJSON()
                    json.argumentsFor = argumentsFor.fullJSON()
                    json.argumentsAgainst = argumentsAgainst.fullJSON()
                    json.subdebates = subdebates.fullJSON()
                    json.loggedIn = true
                    $(@el).html(@template json)
                
                    json.objecttype = "debates"
                    json.objectid = json.linkableId
                    json.attributetype = ""
                    json.attributeid = ""
                    json.baseurl = (json.attributetype!="") ? "/"+json.objecttype+"/"+json.objectid+"/tag/" : "/"+json.objecttype+"/"+json.objectid+"/"+json.attributetype+"/"+json.attributeid+"/tag/"
                    $(@el).find('.tags').html(@tags_template json)

    return this

  showNewDebateForm: (e) ->
    debateType = $(e.target).attr("debate-type")
    collection = @model[debateType]
    formDiv = $('#new-'+debateType+'-div')
    $(this).hide()
    formDiv.show()
    formView = new Gruff.Views.Debates.NewView
      'el': formDiv, 
      'collection': collection, 
      'attributeType': debateType
    formView.render()
