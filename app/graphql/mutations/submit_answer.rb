module Mutations
  class SubmitAnswer < BaseMutation
    description "Player submits an answer to the current question"

    argument :question_id, ID, required: true
    argument :answer_id, ID, required: true

    field :success, Boolean, null: false
    field :message, String, null: false

    def resolve(question_id:, answer_id:)
      # 1. Validate question + answer
      question = Question.find_by(id: question_id)
      return { success: false, message: "Question not found" } unless question

      choice = Choice.find_by(id: answer_id)
      return { success: false, message: "Choice not found" } unless choice

      # 2. Mark player's answer in DB
      # (assume current_player is found from context or a token)
      player = context[:current_player] 
      return { success: false, message: "Not authenticated" } unless player

      # Example: store player's answer in a PlayerAnswer model
      PlayerAnswer.create!(
        player: player,
        question: question,
        choice: choice
      )

      # 3. Optionally do scoring or immediate feedback
      # 4. Possibly broadcast an update if you want to show "X players answered"
      #    or if the question ends early when all players answered

      ActionCable.server.broadcast(
        "game_session_#{player.game_session.session_code}",
        {event: "player_answered",
        data: {
          playerId: player.id,
          questionId: question.id
          # possibly other details
        }}
      )

      { success: true, message: "Answer submitted" }
    end
  end
end
