Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.DebateView extends Backbone.View
  template: $('#debate-template')

  events:
    "click .destroy" : "destroy"

  tagName: "tr"

  destroy: () ->
    @model.destroy()
    this.remove()

    return false

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
