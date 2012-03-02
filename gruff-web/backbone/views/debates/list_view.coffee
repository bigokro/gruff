Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.ListView extends Backbone.View
  initialize: (options) ->
    @attributeType = options.attributeType
    @collection.bind('add', @add);
    @collection.bind('remove', @remove);
    @parentView = options.parentView
    @showView = options.showView

  render: ->
    @views = []
    @collection.each (debate) =>
      @add debate
    @

  close: ->
    _.each @views, (view) ->
      view.close()

  add: (debate) =>
    debate.parentCollection = @collection
    itemView = new Gruff.Views.Debates.ListItemView
      'parentEl': @el
      'model': debate
      'attributeType': @attributeType
      'parentView': @
      'showView': @showView
    @views.push itemView
    itemView.render()

  remove: (debate) =>
    viewToRemove = _.select(@views, (view) =>
      view.model?.id == debate.id
    )[0]
    @views = _.without(@views, viewToRemove)
    $(viewToRemove.el).remove()

  disableDragDrop: ->
    _.each @views, (view) ->
      view.disableDragDrop()

  enableDragDrop: ->
    _.each @views, (view) ->
      view.enableDragDrop()

