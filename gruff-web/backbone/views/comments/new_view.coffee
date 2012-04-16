Gruff.Views.Comments ||= {}

class Gruff.Views.Comments.NewView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#comment-new-template').text()
    @model = new @collection.model()
    @model.collection = @collection
    @model.debate = @collection.parent
    @parentModel = @collection.parent

    @model.bind("change:errors", () =>
      this.render()
    )

  save: (e) =>
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @model.save(null,
      success: (comment) =>
        @collection.add(@model)
        @close()
      error: (comment, jqXHR) =>
        @handleRemoteError jqXHR, comment
    )

  render: ->
    json = @model.toJSON()
    json.id = @parentModel.id
    $(@el).html(@template( json ))
    $(@el).show()
    Backbone.ModelBinding.bind @
    @setUpEvents()
    $(@el).parent().find('.new-comment-link').hide();
    @.$('#comment').focus()
    @

  setUpEvents: ->
    $(document).bind "keydown", @handleKeys
    @.$("input[type='submit']:visible").bind 'click', @save
    @.$('.cancel_button:visible').bind 'click', @close

  cancelEvents: ->
    $(document).unbind("keydown", @handleKeys)

  close: ->
    $(@el).parent().find('.new-comment-link').show();
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
