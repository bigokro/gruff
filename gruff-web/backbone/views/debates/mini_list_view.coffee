Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.MiniListView extends Gruff.Views.Debates.ListView

  render: ->
    super
    $(@el).bind "dblclick", @showNewDebateForm
    @

  close: ->
    super

  showNewDebateForm: (e) =>
    @newView = new Gruff.Views.Debates.SimpleNewView
      'el': @el
      'collection': @collection
      'attributeType': @attributeType
    @newView.render()
