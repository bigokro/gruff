Gruff.Views.References ||= {}

class Gruff.Views.References.NewView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#reference-new-template').text()
    @attributeType = options.attributeType
    @model = new @collection.model()
    @model.collection = @collection
    @parentModel = @collection.parent

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) =>
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @model.save(null,
      success: (reference) =>
        @collection.add(reference)
        @close()
      error: (reference, jqXHR) =>
        @handleRemoteError jqXHR, reference
    )

  render: ->
    json = @model.fullJSON()
    $(@el).html(@template( json ))
    $(@el).show()
    Backbone.ModelBinding.bind @
    @setUpEvents()
    $(@el).parent().find('.new-reference-link').hide();
    $(@el).find('input').first().focus()
    @

  setUpEvents: ->
    $(document).bind "keydown", @handleKeys
    @.$("input[type='submit']:visible").bind 'click', @save
    @.$('.cancel_button:visible').bind 'click', @close

  cancelEvents: ->
    $(document).unbind("keydown", @handleKeys)

  close: ->
    $(@el).parent().find('.new-reference-link').show();
    $(@el).children().remove()
    @cancelEvents()
    @unbind()
    Backbone.ModelBinding.unbind @

  handleKeys: (e) =>
    if e.keyCode == 27
      @close()
      false
    else
      true
