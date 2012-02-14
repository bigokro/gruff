Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.SubdebateView extends Gruff.Views.Debates.ShowView
  initialize: (options) ->
    super options
    @parentView = options.parentView

  render: ->
    super
    $(@el).show()
    offset = $(@el).offset()
    offset.left = $(window).width() / 10
    $(@el).css('position', 'absolute')
    $(@el).offset(offset)
    $(@el).width($(window).width() * .8)
    @enableKeys()
    @modal = $('.modal-bg')
    @modal.show()
    @modal.width($(document).width())
    @modal.height($(document).height())
    @modal.offset({ top: 0, left: 0 })
    @raise()
    @

  enableKeys: ->
    $(document).bind('keydown', @handleKeys);

  handleKeys: (e) =>
    if e.keyCode == 27
      @close()
      false
    else
      true

  close: =>
    $(document).unbind('keydown')
    @parentView.modalView = null
    @parentView.enableDragDrop()
    @lower()
    $(@el).html("")
    $(@el).hide()
    @modal.hide()
    @unbind()

  raise: =>
    target = $(@el).parent()
    newZIndex = $(target).parents('.debate-list-item').css('z-index')
    newZIndex = $(target).css('z-index') unless newZIndex?
    newZIndex = parseInt(newZIndex) + 5
    alert("z-index: " + newZIndex)
    $(target).css('z-index', newZIndex)
    $(@el).css('z-index', newZIndex)
    $(@el).find('.debate-list-item').css('z-index', newZIndex)
    $(@modal).css('z-index', newZIndex-1)

  lower: =>
    target = $(@el).parent()
    newIndex = 'auto'
    newZIndex = parseInt($(target).css('z-index')) - 5 unless $(target).css('z-index') == 'auto'
    $(target).css('z-index', newZIndex)
    $(@modal).css('z-index', -1)
