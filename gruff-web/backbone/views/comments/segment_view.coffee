Gruff.Views.Comments ||= {}

class Gruff.Views.Comments.SegmentView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#comments-segment-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @debate = options.debate
    @segment = options.segment
    @index = options.index

  render: ->
    json = {}
    json.text = @segment.text
    json.curruser = Gruff.User.fullJSON()
    if $(@parentEl).children().length == 0 || @index == 0
      $(@parentEl).prepend(@template json)
    else
      $($(@parentEl).children()[@index-1]).after(@template json)
    @el = $($(@parentEl).children()[@index])
    @commentViews = []
    _.each @segment.comments, (comment) =>
      c = new Gruff.Models.Comment comment
      c.debate = @debate
      commentView = new Gruff.Views.Comments.ListItemView
        'parentEl': @el
        'debate': @debate
        'model': c
        'parentView': @
      commentView.render()
      @commentViews.push commentView
    @setUpEvents()
    @

  setUpEvents: =>
    @.$('> .text').click @showNewCommentForm
    @setUpTooltipEvents()

  setUpTooltipEvents: =>
    @.$('> .text').mouseover @showTooltip
    @.$('> .text').unbind "mousemove", @moveTooltip
    @.$('> .text').unbind "mouseout", @closeTooltip

  setUpMouseOverEvents: =>
    @.$('> .text').unbind "mouseover", @showTooltip
    @.$('> .text').mousemove @moveTooltip
    @.$('> .text').mouseout @closeTooltip

  showNewCommentForm: (e) =>
    idx = @getClickIdx(e)
    newSegment = 
      text: @segment.text.substring(0, idx),
      comments: []
    @previousView = @parentView.addNewSegment newSegment, @index
    @parentView.reindex()
    @segment.text = @segment.text.substring(idx)
    @updateText()
    @previousView.renderForm()
    false

  updateText: =>
    @.$('> .text').html @segment.text

  renderForm: =>
    @newView = new Gruff.Views.Comments.NewSubcommentView
      'parentEl': @.$('> .comments')
      'debate': @debate
      'model': @model
      'segment': @segment
      'parentView': @
    @newView.render()

  getClickIdx: (e) =>
    clicked = null
    if window.getSelection
      clicked = window.getSelection()
    else if document.getSelection
      clicked = document.getSelection()
    else if document.selection
      clicked = document.selection.createRange()
    idx = clicked.focusOffset
    idx
  
  showTooltip: (e) =>
    $('body').append '<div class="tooltip" id="add-comment-tooltip">Click to respond right here</div>'
    @tooltip = $('#add-comment-tooltip')
    @setUpMouseOverEvents()

  moveTooltip: (e) =>
    @tooltip.css 'left', (e.pageX + 8)
    @tooltip.css 'top', (e.pageY - 17)

  closeTooltip: (e) =>
    @tooltip.remove()
    @setUpTooltipEvents()

  mergeBack: =>
    @parentView.mergeSegments @index

  textIndex: =>
    @parentView.textIndex @index

  close: =>
    _.each @commentViews, (commentView) =>
      commentView.close()
    @el.remove()
    @unbind()
