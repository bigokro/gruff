Gruff.Views.Comments ||= {}

class Gruff.Views.Comments.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#comments-list-item-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @parentModel = options.parentModel
    @parentModel ||= @parentView?.parentModel

  render: ->
    @model.set({ id: @model.nextId()}) unless @model.id
    json = @model.toJSON()
    json.loggedIn = true
    $(@parentEl).find('h3').after(@template json)
    @el = $(@parentEl).find('#'+@model.id+'-comment')
    @bodyEl = @.$('> .comment')
    @deleteEl = @.$("> a.delete-comment")
    @body = @model.get("body")
    @segmentViews = []
    _.each @body, (segment, index) =>
      @addNewSegment segment, index
    @setUpEvents()
    @

  setUpEvents: =>
    @deleteEl.bind("click", @removeComment)

  showDelete: =>
    @deleteEl.show()

  hideDelete: =>
    @deleteEl.hide()

  addNewSegment: (segment, index) =>
    segmentView = new Gruff.Views.Comments.SegmentView
      'parentEl': @bodyEl
      'model': @model
      'segment': segment
      'parentView': @
      'index': index
    segmentView.render()
    if index == @segmentViews.length
      @segmentViews.push segmentView
    else
      @segmentViews = _.first(@segmentViews, index-1).concat(segmentView).concat(_.rest(@segmentViews, index))

  reindex: =>
    _.each @segmentViews, (sv, index) =>
      sv.index = index

  removeComment: =>
    @model.destroy(
      success: (comment) =>
        @close()
      error: (comment, jqXHR) =>
        @handleRemoteError jqXHR, comment
    )

  close: =>
    _.each @segmentViews, (segmentView) =>
      segmentView.close()
    @el.remove()
    @unbind()
