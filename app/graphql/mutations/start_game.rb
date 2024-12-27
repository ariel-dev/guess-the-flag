# app/graphql/mutations/start_game.rb
module Mutations
  class StartGame < BaseMutation
    argument :session_code, String, required: true
    argument :max_questions, Integer, required: false, default_value: 10

    field :game_session, Types::GameSessionType, null: true
    field :errors, [String], null: false

    def resolve(session_code:, max_questions:)
      game_session = GameSession.find_by(session_code: session_code)
      
      if game_session.nil?
        return {
          game_session: nil,
          errors: ["Game session not found"]
        }
      end

      # Start the game
      game_session.update!(active: true, max_questions: max_questions)
      game_session.set_first_question!

      # Broadcast to all players that the game has started
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          event: "game_started",
          data: {
            active: true,
            current_question: game_session.current_question
          }
        }
      )

      {
        game_session: game_session,
        errors: []
      }
    end
  end
end
