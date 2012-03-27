Gruff.Views.References ||= {}

class Gruff.Views.References.ListItemView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#references-list-item-template').text()
    @parentEl = options.parentEl
    @parentView = options.parentView
    @parentModel = options.parentModel
    @parentModel ||= @parentView?.parentModel

  render: ->
    json = @model.fullJSON()
    json.loggedIn = true
    $(@parentEl).find('h3').after(@template json)
    @el = $(@parentEl).find('#'+@model.id.replace(" ", "\\ ")+'-reference')
    @deleteEl = @.$("> a.delete-reference")
    @setUpEvents()
    @

  setUpEvents: =>
    @deleteEl.bind("click", @removeReference)

  showDelete: =>
    @deleteEl.show()

  hideDelete: =>
    @deleteEl.hide()

  removeReference: =>
    @model.destroy(
      success: (reference) =>
        @close()
      error: (reference, jqXHR) =>
        @handleRemoteError jqXHR, reference
    )

  close: =>
    @el.remove()
    @unbind()
