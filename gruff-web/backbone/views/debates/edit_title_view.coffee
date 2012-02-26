Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.EditTitleView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-edit-title-template').text()
    @titleEl = options.titleEl
    @zoomEl = options.zoomEl

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
        $(@titleEl).html newTitle
        @close()
      error: (jqXHR, type) =>
        @handleRemoteError jqXHR
    )

  render: ->
    json = @model.fullJSON()
    @el = $(@el).parents('.title')[0] unless $(@el).hasClass('.title')
    $(@el).append(@template( json ))
    @titleEl = $(@el).find('a.title-link') unless @titleEl?
    $(@titleEl).hide()
    @zoomEl = $(@el).find('a.zoom-link') unless @zoomEl?
    $(@zoomEl).hide()
    @editTitleField = $(@el).find('#'+@model.linkableId()+"-title-field")
    @editTitleField.bind("keydown", @handleKeys)
    @editTitleField.bind("blur", @close)
    @editTitleField.show()
    @editTitleField.focus()
    @

  close: =>
    $(@titleEl).show()
    $(@zoomEl).show()
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
