Gruff.Views.Comments ||= {}

class Gruff.Views.Comments.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#comments-list-item-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @parentModel = options.parentModel
    @parentModel ||= @parentView?.parentModel

  render: ->
    json = @model.toJSON()
    json.loggedIn = true
    $(@parentEl).find('h3').after(@template json)
    @el = $(@parentEl).find('#'+@model.id.replace(" ", "\\ ")+'-comment')
    @deleteEl = @.$("> a.delete-comment")
    @setUpEvents()
    @

  setUpEvents: =>
    @deleteEl.bind("click", @removeComment)

  showDelete: =>
    @deleteEl.show()

  hideDelete: =>
    @deleteEl.hide()

  removeComment: =>
    @model.destroy(
      success: (comment) =>
        @close()
      error: (comment, jqXHR) =>
        @handleRemoteError jqXHR, comment
    )

  close: =>
    @el.remove()
    @unbind()
