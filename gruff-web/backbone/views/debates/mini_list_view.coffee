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
    _this = @
    $(@el).parent().droppable(
      accept: '.subdebate, .argument, .debate, .answer'
      greedy: true
      drop: ( event, ui ) ->
        dragged = ui.draggable[0]
        $(this).removeClass('over')
        unless $(dragged).parent().parent()[0] == this
          _this.moveDebate dragged, $(this)
          ui.helper.hide()
      over: ( event, ui ) ->
        dragged = ui.draggable[0]
        unless $(dragged).parent().parent()[0] == this
          $(this).addClass('over')
      out: ( event, ui ) ->
        $(this).removeClass('over')
    )

  showNewDebateForm: (e) =>
    @linkEl.hide()
    @newView = new Gruff.Views.Debates.SimpleNewView
      'el': @el
      'parentView': @
      'collection': @collection
      'attributeType': @attributeType
    @newView.render()
