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

  cloneLink: =>
    h4 = @el.siblings('h4')
    @cloneEl = h4.clone(true)
    @cloneEl.css('position', 'absolute')
    @cloneEl.offset(h4.find('a.title-link').offset())
    @cloneEl.css('z-index', @el.css('z-index'))
    @cloneEl.css('margin', 0)
    @cloneEl.css('padding', 0)
    @el.parent().append(@cloneEl)

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
    _.each($(@el).parents('.debate-list-item'), (parent) =>
      zindex = $(parent).css('z-index')
      if zindex == 'auto'
        zindex = 10 
      else
        zindex = parseInt(zindex)
      $(parent).css('z-index', zindex + 5)
      $(@el).css('z-index', zindex + 5)
      $(@modal).css('z-index', zindex + 4)
    )
    @cloneLink()

  lower: =>
    _.each($(@el).parents('.debate-list-item'), (parent) =>
      zindex = parseInt($(parent).css('z-index'))
      $(parent).css('z-index', zindex - 5)
      $(@el).css('z-index', zindex - 5)
    )
    @cloneEl.remove()
