
_.extend(Backbone.View.prototype, 

  moveDebate: (dragged, target, view) ->
    targetParent = $(target).parents('.debate-list-item, .debate')[0]
    targetDebateId = targetParent.id
    targetDebate = @model.findDebate targetDebateId
    newCollection = targetDebate.getCollectionByName target.attr('class')
    newCollection = targetDebate.getCollectionByName targetParent.className unless newCollection?

    if dragged.id == newCollection.parent?.id
      alert "Error: the page is attempting to assign the debate to its own sublist!"
      return false

    debate = @model.findDebate dragged.id
    oldCollection = debate.parentCollection

    oldCollection.remove debate
    newCollection.add debate
    debate.parent = newCollection.parent

    oldCollection.parent.save null,
      wait: true
      error: (debate, jqXHR) =>
        @handleRemoteError(jqXHR)
      success: =>
        debate.save null,
          wait: true
          error: (debate, jqXHR) =>
            @handleRemoteError(jqXHR)
          success: =>
            if oldCollection.parent != newCollection.parent
              newCollection.parent.save null,
                wait: true
                error: (debate, jqXHR) =>
                  @handleRemoteError(jqXHR)

  isDragging: ->
    $('.ui-draggable-dragging').length > 0

  handleRemoteError: (jqXHR, data) ->
    message = $.parseJSON(jqXHR.responseText)
    message = message[0].message if message[0]?.message?
    if jqXHR.status == 401
      alert message
      @showLoginForm()
    else
      alert message
      @model.set({errors: $.parseJSON(jqXHR.responseText)})

  showLoginForm: ->
    form = new Gruff.Views.Login.LoginView
    form.render()

  formatText: (text) ->
    return "" unless text && text?
    html = text.replace /\n[*]([^\n]+)/g, "<ul><li>$1</li></ul>"
    html = html.replace /<\/ul><ul>/g, ""
    html = html.replace /\n[#]([^\n]+)/g, "<ol><li>$1</li></ol>"
    html = html.replace /<\/ol><ol>/g, ""
    html = html.replace /\n\w*\n/g, "</p><p>"
    html = html.replace /\n/g, "<br/>"
    html = html.replace /(https?[:]\/\/[^\s)]+)/g, "<a href=\"$1\" target=\"_blank\">$1</a>"
    html = "<p>" + html + "</p>"
    html
)
