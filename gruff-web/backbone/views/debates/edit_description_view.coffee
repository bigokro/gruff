Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.EditDescriptionView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-edit-description-template').text()

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
        @descriptionEl.html newDescription
        @close()
      error: (debate, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
        alert jqXHR.responseText
    )

  render: ->
    json = @model.fullJSON()
    @el = $(@el).parents('.debate-list-item')[0] unless $(@el).hasClass('.debate-list-item')
    $(@el).append(@template( json ))
    @descriptionEl = $(@el).find('.body')
    @descriptionEl.hide()
    @editDescriptionField = $(@el).find('#'+@model.linkableId()+"-description-field")
    @editDescriptionField.bind("keypress", @handleKeys)
    @editDescriptionField.bind("blur", @close)
    @editDescriptionField.show()
    @editDescriptionField.focus()
    @

  close: =>
    @descriptionEl.show()
    @editDescriptionField.remove()
    @unbind()

  handleKeys: (e) =>
    if e.keyCode == 13
      @save()
      false
    else
      true
