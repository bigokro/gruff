Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListView extends Backbone.View
  initialize: (options) ->
    @attributeType = options.attributeType
    @debates = options.debates
    @debates.bind('add', @add);
    @debates.bind('remove', @remove);

  render: ->
    @views = []
    @debates.each (debate) =>
      @add debate
    return @

  close: ->
    @views.each (view) ->
      view.remove()
      view.unbind()

  add: (debate) =>
    itemView = new Gruff.Views.Debates.ListItemView
      'parentEl': @el,
      'model': debate
    @views.push itemView
    itemView.render()

  remove: (debate) =>
    viewToRemove = @views.select( (view) =>
      view.model == model
    )[0]
    @views = @views.without viewToRemove
    $(viewToRemove.el).remove()