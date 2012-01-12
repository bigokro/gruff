Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.EditView extends Backbone.View
  template : $('#debate-edit-template')

  events :
    "submit #edit-debate" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (debate) =>
        @model = debate
        window.location.hash = "/#{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
