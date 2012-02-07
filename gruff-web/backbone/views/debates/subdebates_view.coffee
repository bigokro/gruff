Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.SubdebatesView extends Backbone.View
  initialize: (options) ->
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
    newZIndex = 5
    newZIndex = parseInt($(@el).css('z-index')) + 5 unless $(@el).css('z-index') == 'auto'
    $(@el).css('z-index', newZIndex)
    $(@subdebatesDiv).css('z-index', newZIndex)
    @enableDragDrop()
    $('.modal-bg').show()
    $('.modal-bg').css('z-index', newZIndex-1)
    $('.modal-bg').width($(document).width())
    $('.modal-bg').height($(document).height())
    $('.modal-bg').offset({ top: 0, left: 0 })
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

