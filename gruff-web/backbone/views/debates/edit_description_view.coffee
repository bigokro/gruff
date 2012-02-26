Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.EditDescriptionView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-edit-description-template').text()
    @descriptionEl = options.descriptionEl

    @model.bind("change:errors", () =>
      this.render()
    )

  save: ->
    @model.unset("errors")
    newDescription = @editDescriptionField.val()
    @model.setDescription(newDescription)

    $.ajax(
      type: "POST"
      url: "/debates/descriptions/new"
      data:
        _id: @model.linkableId()
        desc: newDescription
      success: (data) =>
        $(@descriptionEl).html newDescription
        @close()
      error: (jqXHR, type) =>
        @handleRemoteError jqXHR
    )

  render: =>
    json = @model.fullJSON()
    @parent = $(@el).parent()
    @descriptionEl = $(@parent).find('> .body') unless @descriptionEl?
    $(@descriptionEl).after(@template( json ))
    $(@descriptionEl).hide()
    @editDescriptionField = $(@parent).find('#'+@model.linkableId()+"-description-field")
    @editDescriptionField.bind("keydown", @handleKeys)
    @editDescriptionField.bind("blur", @close)
    @editDescriptionField.show()
    @editDescriptionField.focus()
    @

  close: =>
    $(@descriptionEl).show()
    @editDescriptionField.remove()
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
