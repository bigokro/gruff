Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.MiniListView extends Gruff.Views.Debates.ListView
  initialize: (options) ->
    super options

  render: ->
    super
    @model = @collection.parent
    @linkEl = $(@el).next()
    @linkEl.bind "click", @showNewDebateForm
    @setUpDragDrop()
    @

  close: ->
    super

  setUpDragDrop: =>
    $(@el).parent().droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      greedy: true
      drop: ( event, ui ) =>
        dragged = ui.draggable[0]
        $(event.target).removeClass('over')
        if $(event.target).has(dragged).length == 0
          @moveDebate dragged, event.target
      over: ( event, ui ) =>
        dragged = ui.draggable[0]
        if $(event.target).has(dragged).length == 0
          $(event.target).addClass('over')
      out: ( event, ui ) =>
        $(event.target).removeClass('over')
    )

  showNewDebateForm: (e) =>
    @linkEl.hide()
    @newView = new Gruff.Views.Debates.SimpleNewView
      'el': @el
      'parentView': @
      'collection': @collection
      'attributeType': @attributeType
    @newView.render()
