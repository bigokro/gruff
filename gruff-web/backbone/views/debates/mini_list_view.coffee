Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.MiniListView extends Gruff.Views.Debates.ListView
  initialize: (options) ->
    super options

  render: ->
    super
    @linkEl = $(@el).next()
    @linkEl.bind "click", @showNewDebateForm
    @

  close: ->
    super

  showNewDebateForm: (e) =>
    @linkEl.hide()
    @newView = new Gruff.Views.Debates.SimpleNewView
      'el': @el
      'parentView': @
      'collection': @collection
      'attributeType': @attributeType
    @newView.render()
