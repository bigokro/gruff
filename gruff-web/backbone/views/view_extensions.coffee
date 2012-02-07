
_.extend(Backbone.View.prototype, 

  moveDebate: (dragged, dropped, view) ->
    droppedParent = $(dropped).parents('.debate')[0]
    droppedDebateId = droppedParent.id
    droppedDebate = @model.findDebate droppedDebateId
    newCollection = droppedDebate.getCollectionByName dropped.className

    debate = @model.findDebate dragged.id
    oldCollection = debate.parentCollection

    oldCollection.remove debate
    newCollection.add debate

    oldCollection.parent.save(
      error: (debate, jqXHR) =>
        @handleRemoteError(debate, jqXHR)
    )
    if oldCollection.parent != newCollection.parent
      debate.save(
        error: (debate, jqXHR) =>
          @handleRemoteError(debate, jqXHR)
      )
      newCollection.parent.save(
        error: (debate, jqXHR) =>
          @handleRemoteError(debate, jqXHR)
      )

  handleRemoteError: (data, jqXHR) ->
    alert jqXHR.responseText
    @model.set({errors: $.parseJSON(jqXHR.responseText)})

)
