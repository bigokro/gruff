Gruff.Views.Debates ||= {}

class Gruff.Views.Debates.NewView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#debate-new-template').text()
    @attributeType = options.attributeType
    @collection = options.collection
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

  events:
    "submit #new-debate": "save"
    "click .cancel_button": "close"

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (debate) =>
        @model = debate
        @close()
        alert JSON.stringify(debate.fullJSON())

      error: (debate, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
        alert jqXHR.responseText
    )

  render: ->
    json = @model.fullJSON()
    json.attributeType = @attributeType
    json.DebateTypes = exports.Debate.prototype.DebateTypes
    json.chooseType = @attributeType == "answers" || @attributeType == "subdebates"
    $(@el).html(@template( json ))
    $(@el).show()
    Backbone.ModelBinding.bind @
    $(@el).find('#title').focus()
    @

  close: ->
    $(@el).parent().find('.new-debate-link').show();
    $(@el).children().remove()
    @unbind()
    Backbone.ModelBinding.unbind @
