Gruff.Views ||= {}

class Gruff.Views.ModalView extends Backbone.View
  initialize: (options) ->
    super options

  render: ->
    super
    @addDialog()
    @addBg()
    @enableCloseOnEscape()
    @

  addDialog: ->
    $("body").append('<div class="modal-dialog card" id="modal-dialog"></div>')
    @el = $('#modal-dialog')

  addBg: ->
    $("body").append('<div class="modal-bg" id="modal-bg"></div>')
    @bg = $("#modal-bg")
    @bg.width($(document).width())
    @bg.height($(document).height())
    @bg.offset({ top: 0, left: 0 })
    zIndex = $(@el).css('z-index')
    $(@bg).css('z-index', zIndex-1)

  close: =>
    @bg.remove()
    $(document).unbind('keydown', @handleCloseOnEscape)
    @el.remove()

  enableCloseOnEscape: ->
    $(document).bind('keydown', @handleCloseOnEscape);

  handleCloseOnEscape: (e) =>
    if e.keyCode == 27
      @close()
      false
    else
      true

  center: () ->
    left = (($(window).width() - $(@el).width()) / 2) + $(window).scrollLeft()
    top = (($(window).height() - $(@el).height()) / 2) + $(window).scrollTop()
    $(@el).offset({ top: top, left: left })
