Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.NewView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-new-template').text()
    @attributeType = options.attributeType
    @showView = options.showView
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  events:
    "submit #new-debate": "save"
    "click .cancel_button": "close"

  save: (e) =>
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @model.url = @collection.url
    @model.save(null,
      success: (debate) =>
        @collection.add(@model)
        @close()
      error: (debate, jqXHR) =>
        @handleRemoteError jqXHR, debate
    )

  render: ->
    json = @model.fullJSON()
    json.attributeType = @attributeType
    json.DebateTypes = exports.Debate.prototype.DebateTypes
    json.chooseType = @attributeType == "answers" || @attributeType == "subdebates"
    $(@el).html(@template( json ))
    $(@el).show()
    Backbone.ModelBinding.bind @
    @setUpEvents()
    $(@el).parent().find('.new-debate-link').hide();
    $(@el).find('#title').focus()
    @

  setUpEvents: ->
    $(document).bind("keydown", @handleKeys)

  cancelEvents: ->
    $(document).unbind("keydown", @handleKeys)
    $('#new-debate').unbind "submit", @save

  close: ->
    @cancelEvents()
    @unbind()
    Backbone.ModelBinding.unbind @
    $(@el).parent().find('.new-debate-link').show();
    $(@el).children().remove()
    @showView.closeNewDebateForm @

  handleKeys: (e) =>
    if e.keyCode == 27
      @close()
      false
    else
      true
