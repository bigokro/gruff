
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
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
        alert jqXHR.responseText
    )
    if oldCollection.parent != newCollection.parent
      debate.save(
        error: (debate, jqXHR) =>
          @model.set({errors: $.parseJSON(jqXHR.responseText)})
          alert jqXHR.responseText
      )
      newCollection.parent.save(
        error: (debate, jqXHR) =>
          @model.set({errors: $.parseJSON(jqXHR.responseText)})
          alert jqXHR.responseText
      )

)
