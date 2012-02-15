
_.extend(Backbone.View.prototype, 

  moveDebate: (dragged, target, view) ->
    targetParent = $(target).parents('.debate-list-item, .debate')[0]
    targetDebateId = targetParent.id
    targetDebate = @model.findDebate targetDebateId
    newCollection = targetDebate.getCollectionByName target.className

    debate = @model.findDebate dragged.id
    oldCollection = debate.parentCollection

    oldCollection.remove debate
    newCollection.add debate

    oldCollection.parent.save(null,
      wait: true
      error: (debate, jqXHR) =>
        @handleRemoteError(jqXHR)
      success: =>
        if oldCollection.parent != newCollection.parent
          debate.save(null,
            wait: true
            error: (debate, jqXHR) =>
              @handleRemoteError(jqXHR)
            success: =>
              newCollection.parent.save(null,
                wait: true
                error: (debate, jqXHR) =>
                  @handleRemoteError(jqXHR)
              )
          )
    )

  handleRemoteError: (jqXHR, data) ->
    message = $.parseJSON(jqXHR.responseText)
    message = message[0].message if message[0]?.message?
    alert message
    @model.set({errors: $.parseJSON(jqXHR.responseText)})

)
