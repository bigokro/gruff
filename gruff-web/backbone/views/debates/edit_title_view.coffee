Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.EditTitleView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-edit-title-template').text()

    @model.bind("change:errors", () =>
      this.render()
    )

  save: ->
    @model.unset("errors")
    newTitle = @editTitleField.val()
    @model.setTitle(newTitle)

    $.ajax(
      type: "POST"
      url: "/debates/titles/new"
      data:
        _id: @model.linkableId()
        title: newTitle
      success: (data) =>
        @titleLink.html newTitle
        @close()
      error: (jqXHR, type) =>
        @handleRemoteError jqXHR
    )

  render: ->
    json = @model.fullJSON()
    @el = $(@el).parents('.title')[0] unless $(@el).hasClass('.title')
    $(@el).append(@template( json ))
    @titleLink = $(@el).find('a.title-link')
    @titleLink.hide()
    @zoomLink = $(@el).find('a.zoom-link')
    @zoomLink.hide()
    @editTitleField = $(@el).find('#'+@model.linkableId()+"-title-field")
    @editTitleField.bind("keypress", @handleKeys)
    @editTitleField.bind("blur", @close)
    @editTitleField.show()
    @editTitleField.focus()
    @

  close: =>
    @titleLink.show()
    @zoomLink.show()
    @editTitleField.remove()
    @unbind()

  handleKeys: (e) =>
    if e.keyCode == 13
      @save()
      false
    else if e.keyCode == 27
      @close()
      false
    else
      true
