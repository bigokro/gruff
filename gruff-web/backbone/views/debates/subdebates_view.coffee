Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.SubdebatesView extends Backbone.View
  initialize: (options) ->
    @parentView = options.parentView
    @template = _.template $('#debate-subdebates-template').text()

  render: ->
    json = @model.fullJSON()
    $(@el).append(@template json)
    @subdebatesDiv = $(@el).find('.debate-list-item-subdebates')
    offset = $(@el).offset()
    offset.top = offset.top + 20
    offset.left = $(window).width() / 10
    $(@subdebatesDiv).offset(offset)
    $(@subdebatesDiv).width($(window).width() * .8)
    @enableDragDrop()
    @enableKeys()
    @modal = $('.modal-bg')
    @modal.show()
    @modal.width($(document).width())
    @modal.height($(document).height())
    @modal.offset({ top: 0, left: 0 })
    @raise $(@el)
    @

  enableDragDrop: =>
    $(@el).find( ".for, .against, .subdebates, .answers" ).droppable(
      accept: '.subdebate, .argument, .debate, .answer'
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

  enableKeys: ->
    _.bindAll(@, 'handleKeys');
    $(document).bind('keydown', @handleKeys);

  handleKeys: (e) =>
    if e.keyCode == 27
      @close()
      false
    else
      true

  close: =>
    $(document).unbind('keypress', 'handleKeys'); 
    @modal.remove()
    @subdebatesDiv.remove()
    @lower $(@el)
    @unbind()

  raise: (el) =>
    newIndex = 'auto'
    newZIndex = parseInt($(el).css('z-index')) + 5 unless $(el).css('z-index') == 'auto'
    $(el).css('z-index', newZIndex)

  lower: (el) =>
    newIndex = 'auto'
    newZIndex = parseInt($(el).css('z-index')) - 5 unless $(el).css('z-index') == 'auto'
    $(el).css('z-index', newZIndex)
