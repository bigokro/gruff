Gruff.Views.Tags ||= {}

class Gruff.Views.Tags.ShowView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#tags-show-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @parentModel = options.parentModel
    @parentModel ||= @parentView?.parentModel

  render: ->
    json = @model.toJSON()
    json.loggedIn = true
    $(@parentEl).find('.label').after(@template json)
    @el = $(@parentEl).find('#'+@model.get("name").replace(" ", "\\ ")+'-tag')
    @deleteEl = @.$("> a.delete-tag")
    @setUpEvents()
    @

  setUpEvents: =>
    $(@el).bind "mouseover", @showDelete
    $(@el).bind "mouseout", @hideDelete
    @deleteEl.bind("click", @removeTag)

  showDelete: =>
    @deleteEl.show()
    $(@el).removeClass('spacer')

  hideDelete: =>
    @deleteEl.hide()
    $(@el).addClass('spacer')

  removeTag: =>
    @model.destroy(
      success: (tag) =>
        @close()
      error: (tag, jqXHR) =>
        @handleRemoteError jqXHR, tag
    )

  close: =>
    @el.remove()
    @unbind()
