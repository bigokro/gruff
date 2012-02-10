
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
    dkfjasd()
    @model.set({errors: $.parseJSON(jqXHR.responseText)})

)
