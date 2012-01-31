class Gruff.Routers.DebatesRouter extends Backbone.Router
  initialize: (options) ->
    @model = new Gruff.Models.Debate {"_id": options.id}
    @model.fetch
      success: (model, response) =>
        @view = new Gruff.Views.Debates.ShowView 'el': $('#main-debate'), 'model': model
        @view.render()

  routes:
    "/new"      : "newDebate"
    "/index"    : "index"
    "/:id/edit" : "edit"
    "/:id"      : "show"
    ".*"        : "index"

  newDebate: ->
    @view = new Gruff.Views.Debates.NewView(collection: @debates)
    $("#debates").html(@view.render().el)

  index: ->
    @view = new Gruff.Views.Debates.IndexView(debates: @debates)
    $("#debates").html(@view.render().el)

  show: (id) ->
    debate = @debates.get(id)

    @view = new Gruff.Views.Debates.ShowView(model: debate)
    $("#debates").html(@view.render().el)

  edit: (id) ->
    debate = @debates.get(id)

    @view = new Gruff.Views.Debates.EditView(model: debate)
    $("#debates").html(@view.render().el)



