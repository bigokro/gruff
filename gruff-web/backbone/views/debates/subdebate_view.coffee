Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.SubdebateView extends Gruff.Views.Debates.ShowView
  initialize: (options) ->
    super options
    @parentView = options.parentView

  render: ->
    super
    $(@el).show()
    offset = $(@el).offset()
    offset.top = offset.top - 20
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
    @raise $(@el).parent()
    @raise @modal
    @

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
    @parentView.enableDragDrop()
    @lower $(@el).parent()
    @lower @modal
    $(@el).html("")
    $(@el).hide()
    @modal.hide()
    @unbind()

  raise: (el) =>
    newIndex = 'auto'
    newZIndex = parseInt($(el).css('z-index')) + 5 unless $(el).css('z-index') == 'auto'
    $(el).css('z-index', newZIndex)

  lower: (el) =>
    newIndex = 'auto'
    newZIndex = parseInt($(el).css('z-index')) - 5 unless $(el).css('z-index') == 'auto'
    $(el).css('z-index', newZIndex)
