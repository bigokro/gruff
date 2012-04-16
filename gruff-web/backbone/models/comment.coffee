Gruff.Models.Comments ||= {}

class Gruff.Models.Comment extends Backbone.Model
  paramRoot: ''

  defaults:
    user: null
    date: null
    comment: null

  initialize: (options) ->
    @debate = options.debate || @collection?.parent
    @updateUrl()
    @bind "change", @updateUrl

  updateUrl: (e) ->
    @url = "/rest/debates/" + @debate?.id + "/comments"

  save: ->
    @updateUrl()
    super

  voteUp: (options) =>
    $.ajax
      type: "POST"
      url: "/rest/debates/"+@debate.id+"/comments/"+@id+"/vote/up"
      success: options.success
      error: options.error

  voteDown: (options) =>
    $.ajax
      type: "POST"
      url: "/rest/debates/"+@debate.id+"/comments/"+@id+"/vote/down"
      success: options.success
      error: options.error

  cancelVote: (options) =>
    $.ajax
      type: "DELETE"
      url: "/rest/debates/"+@debate.id+"/comments/"+@id+"/vote"
      success: options.success
      error: options.error

  fullJSON: () ->
    json = @toJSON()
    json.curruser = Gruff.User.fullJSON()
    json.score = @score()
    json

class Gruff.Collections.Comments extends Backbone.Collection
  model: Gruff.Models.Comment

  initialize: (options) ->
    @parent = options.parent
    @url = "/rest/debates/" + @parent?.id + "/comments"

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Comment, exports.Comment
