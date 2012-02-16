Gruff.Views.Login ||= {}

class Gruff.Views.Login.LoginView extends Gruff.Views.ModalView
  initialize: (options) ->
    super options
    @template = _.template $('#login-template').text()
    @model = new Gruff.Models.Login

    @model.bind("change:errors", () =>
      this.render()
    )

  render: ->
    super
    json = @model.toJSON()
    $(@el).append(@template( json ))
    Backbone.ModelBinding.bind @
    @center()
    $('#login-form').bind('submit', @submit)
    $('#login-cancel').bind('click', @cancel)
    $(@el).find('#login').focus()
    @

  submit: (e) =>
    e.preventDefault()
    e.stopPropagation()
    @model.save(null,
      success: =>
        @close()
      error: (data, jqXHR) =>
        if jqXHR.responseText.indexOf('Login failed') > 0
          alert "Login failed. Please try again."
        else
          @close()
    )