Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.SimpleNewView extends Gruff.Views.Debates.NewView
  initialize: (options) ->
    super options
    @parentView = options.parentView
    @model.set
      type: @model.DebateTypes.DIALECTIC
    @template = _.template $('#debate-simple-new-template').text()

  save: (e) ->
    super e

  render: ->
    json = @model.fullJSON()
    json.attributeType = @attributeType
    $(@el).append(@template( json ))
    Backbone.ModelBinding.bind @
    @formEl = $(@el).find('> #simple-new-debate')
    @titleEl = $(@formEl).find('> #title')
    @formEl.bind("submit", @save)
    @formEl.bind("blur", @close)
    @setUpEvents()
    @titleEl.focus()
    @

  close: ->
    $(@formEl).remove()
    @parentView.linkEl.show()
    @cancelEvents()
    @unbind()
    Backbone.ModelBinding.unbind @

  setUpEvents: ->
    $(@titleEl).bind("keydown", @handleKeys)

  cancelEvents: ->
    $(@titleEl).unbind("keydown", @handleKeys)

