Gruff.User = new Gruff.Models.User()
Gruff.User.fetch()

class Gruff.Routers.DebatesRouter extends Backbone.Router

  routes:
    "canvas/new"      : "newDebate"
    "canvas/index"    : "index"
    "canvas/:id/edit" : "edit"
    "canvas/:id"      : "show"
    "canvas/.*"       : "index"

  newDebate: ->
    @view = new Gruff.Views.Debates.NewView(collection: @debates)
    $("#debates").html(@view.render().el)

  index: ->
    @view = new Gruff.Views.Debates.IndexView(collection: @debates)
    $("#debates").html(@view.render().el)

  show: (id) ->
    @model = new Gruff.Models.Debate {"_id": id}
    @model.fetch
      success: (model, response) =>
        @view = new Gruff.Views.Debates.ShowView 'el': $('#'+model.linkableId()), 'model': model
        @view.render()
        @view.maximize()

  edit: (id) ->
    debate = @debates.get(id)

    @view = new Gruff.Views.Debates.EditView(model: debate)
    $("#debates").html(@view.render().el)

