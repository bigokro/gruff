Gruff.Views.Comments ||= {}

class Gruff.Views.Comments.NewSubcommentView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#comment-new-subcomment-template').text()
    @segment = options.segment
    @parentEl = options.parentEl
    @parentView = options.parentView
    @debate = options.debate

  render: =>
    json = {}
    $(@parentEl).append(@template( json ))
    @el = $(@parentEl).find('#new-subcomment-form')
    @formEl = @.$('#subcomment')
    @setUpEvents()
    @formEl.focus()
    @

  setUpEvents: =>
    $(document).bind "keydown", @handleKeys
    @.$("input[type='submit']:visible").bind 'click', @save
    @.$('.cancel_button:visible').bind 'click', @cancel

  cancelEvents: =>
    $(document).unbind("keydown", @handleKeys)

  save: (e) =>
    e.preventDefault()
    e.stopPropagation()

    $.ajax
      type: "POST"
      url: "/rest/debates/"+@debate.id+"/comments/"+@model.id+"/"+@parentView.textIndex()
      data:
        comment: @formEl.val()
      success: (data) =>
        @close()
        comment = new Gruff.Models.Comment(data)
        commentView = new Gruff.Views.Comments.ListItemView
          'parentEl': @parentView.el
          'debate': @debate
          'model': comment
          'parentView': @parentView
        commentView.render()
      error: (jqXHR, data) =>
        @handleRemoteError jqXHR, data

  cancel: =>
    @close()
    @parentView.mergeBack()

  close: =>
    $(@el).remove()
    @cancelEvents()
    @unbind()

  handleKeys: (e) =>
    if e.keyCode == 27
      @cancel()
      false
    else
      true
