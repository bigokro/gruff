Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListView extends Backbone.View
  initialize: (options) ->
    @attributeType = options.attributeType
    @debates = options.debates

  render: ->
    @views = []
    @debates.each (debate) =>
      itemView = new Gruff.Views.Debates.ListItemView
        'parentEl': @el,
        'model': debate
      itemView.render()
      @views.push itemView

    return @

  close: ->
    @views.each (view) ->
      view.remove()
      view.unbind()
