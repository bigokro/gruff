Gruff.Views.Comments ||= {}

class Gruff.Views.Comments.IndexView extends Backbone.View
  initialize: (options) ->
    @template = _.template $('#comments-index-template').text()
    @collection.bind('add', @add);
    @collection.bind('remove', @remove);
    @parentView = options.parentView
    @parentModel = @collection.parent
    @debate = options.debate

  render: ->
    json = {}
    json.id = @parentModel.id
    json.loggedIn = true
    $(@el).html(@template json)
    @showFormEl = @.$(".new-comment-link")
    @listEl = @.$('.comments-list')
    @formEl = $('#'+@parentModel.id+'-new-comment-div')
    @views = []
    @collection.each (comment) =>
      @add comment
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
    @formView = new Gruff.Views.Comments.NewView
      'el': @formEl
      'collection': @collection
      'debate': @debate
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

  add: (comment) =>
    comment.collection = @collection
    commentView = new Gruff.Views.Comments.ListItemView
      'parentEl': @listEl
      'debate': @debate
      'model': comment
      'parentView': @
    @views.push commentView
    commentView.render()

  remove: (comment) =>
    viewToRemove = _.select(@views, (view) =>
      view.model?.name == comment.name
    )[0]
    @views = _.without(@views, viewToRemove)
    viewToRemove.close()

