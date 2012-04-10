Gruff.Views.References ||= {}

class Gruff.Views.References.IndexView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#references-index-template').text()
    @collection.bind('add', @add);
    @collection.bind('remove', @remove);
    @parentView = options.parentView
    @parentModel = @collection.parent

  render: ->
    json = {}
    json.id = @parentModel.id
    json.user = Gruff.User.fullJSON()
    $(@el).html(@template json)
    @showFormEl = @.$(".new-reference-link")
    @formEl = $('#'+@parentModel.id+'-new-reference-div')
    @views = []
    @collection.each (reference) =>
      @add reference
    @initializeForm()
    @setUpEvents()
    @hideForm()
    @

  initializeForm: ->
    @model = new @collection.model()
    @model.collection = @collection
    @model.parent = @parentModel

  setUpEvents: ->
    @showFormEl.bind 'click', @showForm

  showForm: =>
    @showFormEl.hide()
    @formEl.show()
    @formView = new Gruff.Views.References.NewView
      'el': @formEl
      'collection': @collection
    @formView.render()
    false

  hideForm: =>
    @formView?.close()
    @showFormEl.show()
    false

  close: =>
    _.each @views, (view) ->
      view.close()
    $(@el).html('')
    @unbind()

  add: (reference) =>
    reference.collection = @collection
    referenceView = new Gruff.Views.References.ListItemView
      'parentEl': @el
      'model': reference
      'parentView': @
    @views.push referenceView
    referenceView.render()

  remove: (reference) =>
    viewToRemove = _.select(@views, (view) =>
      view.model?.name == reference.name
    )[0]
    @views = _.without(@views, viewToRemove)
    viewToRemove.close()

