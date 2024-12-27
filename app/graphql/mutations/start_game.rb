module Mutations
  class StartGame < BaseMutation
    description "Host starts the game, sets the first question"

    argument :session_code, String, required: true
    field :success, Boolean, null: false

    def resolve(session_code:)
      game_session = GameSession.find_by(session_code: session_code)
      return { success: false } unless game_session

      # Pick a question to start with
      question = Question.first # or random
      game_session.update!(current_question_id: question.id)

      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        event: "next_question"
      )

      { success: true }
    end
  end
end
