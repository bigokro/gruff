Gruff.Models.Comments ||= {}

class Gruff.Models.Comment extends Backbone.Model
  paramRoot: ''

  defaults:
    user: null
    date: null
    comment: null

  initialize: (options) ->
    @updateUrl()
    @bind "change", @updateUrl

  updateUrl: (e) ->
    @url = "/rest/debates/" + @collection?.parent?.id + "/comments/" + @get("date")

  save: ->
    @updateUrl()
    super

class Gruff.Collections.Comments extends Backbone.Collection
  model: Gruff.Models.Comment

  initialize: (options) ->
    @parent = options.parent
    @url = "/rest/debates/" + @parent?.id + "/comments"

classHelper = new exports.ClassHelper()
classHelper.augmentClass Gruff.Models.Comment, exports.Comment
