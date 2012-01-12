Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.NewView extends Backbone.View
  template: $('#debate-new-template')

  events:
    "submit #new-debate": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (debate) =>
        @model = debate
        window.location.hash = "/#{@model.id}"

      error: (debate, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
