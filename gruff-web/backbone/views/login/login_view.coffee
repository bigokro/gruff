Gruff.Views.Login ||= {}

class Gruff.Views.Login.LoginView extends Gruff.Views.ModalView
  initialize: (options) ->
    super options
    @template = _.template $('#login-template').text()
    @model = new Gruff.Models.Login

    @model.bind("change:errors", () =>
      this.render()
    )

  events:
    "submit #login": "submit"
    "click #login-cancel": "close"

  render: ->
    super
    json = @model.toJSON()
    $(@el).append(@template( json ))
    Backbone.ModelBinding.bind @
    $(@el).find('#login').focus()
    @center()
    @

  submit: ->
    @model.save(null,
      success: ->
        @close()
      error: (jqXHR) ->
        @handleRemoteError jqXHR
    )