Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.IndexView extends Backbone.View
  template: $('#debate-index-template')

  initialize: () ->
    @options.debates.bind('reset', @addAll)

  addAll: () =>
    @options.debates.each(@addOne)

  addOne: (debate) =>
    view = new Gruff.Views.Debates.DebateView({model : debate})
    @$("tbody").append(view.render().el)

  render: =>
    $(@el).html(@template(debates: @options.debates.toJSON() ))
    @addAll()

    return this
