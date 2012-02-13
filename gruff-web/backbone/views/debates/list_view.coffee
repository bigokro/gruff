Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListView extends Backbone.View
  initialize: (options) ->
    @attributeType = options.attributeType
    @collection.bind('add', @add);
    @collection.bind('remove', @remove);
    @parentView = options.parentView

  render: ->
    @views = []
    @collection.each (debate) =>
      @add debate
    return @

  close: ->
    _.each @views, (view) ->
      view.remove()
      view.unbind()

  add: (debate) =>
    debate.parentCollection = @collection
    itemView = new Gruff.Views.Debates.ListItemView
      'parentEl': @el
      'model': debate
      'attributeType': @attributeType
      'parentView': @
    @views.push itemView
    itemView.render()

  remove: (debate) =>
    viewToRemove = _.select(@views, (view) =>
      view.model == debate
    )[0]
    @views = _.without(@views, viewToRemove)
    $(viewToRemove.el).remove()
