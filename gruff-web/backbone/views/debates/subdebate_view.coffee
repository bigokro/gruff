Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.SubdebateView extends Gruff.Views.Debates.ShowView
  initialize: (options) ->
    super options
    @parentView = options.parentView

  render: ->
    @model.bind("fetched-subdebates", () =>
      $(@el).show()
      @linkDiv = $(@el).parents('.debate-list-item')[0]
      offset = $(@linkDiv).offset()
      offset.top = offset.top + $(@linkDiv).height()
      offset.left = $(window).width() / 10
      $(@el).css('position', 'absolute')
      $(@el).offset(offset)
      $(@el).width($(window).width() * .8)
      @enableKeys()
      @addModal()
      @raise()
    )
    super
    @

  enableKeys: ->
    $(document).bind('keydown', @handleKeys);

  handleKeys: (e) =>
    if e.keyCode == 27
      @close()
      false
    else
      true

  addModal: ->
    $(@el).parents('.debates-list').first().append('<div class="modal-bg"></div>')
    @modal = $(@el).parents('.debates-list').first().find('.modal-bg')
    @modal.width($(document).width())
    @modal.height($(document).height())
    @modal.offset({ top: 0, left: 0 })

  close: =>
    $(document).unbind('keydown')
    @model.unbind "fetched-subdebates"
    @modal?.remove()
    @parentView.modalView = null
    @parentView.enableDragDrop()
    @lower()
    $(@el).html("")
    $(@el).hide()
    @unbind()

  raise: =>
    target = $(@el).parent()
    oldZIndex = $(@linkDiv).css('z-index')
    oldZIndex = $(target).css('z-index') unless oldZIndex?
    newZIndex = parseInt(oldZIndex) + 5
    $(target).css('z-index', newZIndex)
    $(@el).css('z-index', newZIndex)
    $(@el).find('.debate-list-item').css('z-index', newZIndex)
    $(@modal).css('z-index', newZIndex-1)

  lower: =>
    target = $(@el).parent()
    newIndex = 'auto'
    newZIndex = parseInt($(target).css('z-index')) - 5 unless $(target).css('z-index') == 'auto'
    $(target).css('z-index', newZIndex)
