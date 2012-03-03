Gruff.Views.Tags ||= {}

class Gruff.Views.Tags.IndexView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#tags-index-template').text()
    @collection.bind('add', @add);
    @collection.bind('remove', @remove);
    @parentView = options.parentView
    @parentModel = @collection.parent

  render: ->
    json = {}
    json.id = @parentModel.id
    json.loggedIn = true
    $(@el).html(@template json)
    @showFormEl = @.$(".show-add-tag-form")
    @formEl = @.$(".add-tag-form")
    @inputEl = @formEl.find('input')
    @hideFormEl = @formEl.find('a')
    @views = []
    @collection.each (tag) =>
      @add tag
    @initializeForm()
    @setUpEvents()
    @hideForm()
    @

  initializeForm: ->
    @inputEl.val('')
    @model = new @collection.model()
    @model.parent = @parentModel

  setUpEvents: ->
    Backbone.ModelBinding.bind @
    @showFormEl.find('a').bind 'click', @showForm
    @hideFormEl.find('a').bind 'click', @hideForm
    @inputEl.bind 'keypress', @handleKeys
    @inputEl.autocomplete
      source: "/rest/tags",
      autoFocus: true

  handleKeys: (e) =>
    if(e.which == 13)
      @save()

  showForm: =>
    @formEl.show()
    @showFormEl.hide()
    @inputEl.focus()
    false

  hideForm: =>
    @showFormEl.show()
    @formEl.hide()
    false

  close: =>
    _.each @views, (view) ->
      view.close()
    $(@el).html('')
    Backbone.ModelBinding.unbind @
    @unbind()

  save: () =>
    @model.set {name: @inputEl.val()}
    @model.unset("errors")
    @collection.create(@model.toJSON(),
      success: (tag) =>
        @initializeForm()
        @hideForm()
      error: (tag, jqXHR) =>
        @handleRemoteError jqXHR, tag
    )

  add: (tag) =>
    tag.parentCollection = @collection
    tagView = new Gruff.Views.Tags.ShowView
      'parentEl': @el
      'model': tag
      'parentView': @
    @views.push tagView
    tagView.render()

  remove: (tag) =>
    viewToRemove = _.select(@views, (view) =>
      view.model?.name == tag.name
    )[0]
    @views = _.without(@views, viewToRemove)
    viewToRemove.close()

