Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-show-template').text()
    @tags_template = _.template $('#tags-index-template').text()

  render: ->
    json = @model.fullJSON()
    $(@el).html(@template json)

    json.objecttype = "debates"
    json.objectid = json.linkableId
    json.attributetype = ""
    json.attributeid = ""
    json.baseurl = (json.attributetype!="") ? "/"+json.objecttype+"/"+json.objectid+"/tag/" : "/"+json.objecttype+"/"+json.objectid+"/"+json.attributetype+"/"+json.attributeid+"/tag/"
    json.loggedIn = true
    $(@el).find('.tags').html(@tags_template json)

    return this
