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

      begin
        # Start the game - this will now handle everything including broadcasting
        game_session.update!(max_questions: max_questions)
        game_session.set_first_question!

        {
          game_session: game_session,
          errors: []
        }
      rescue StandardError => e
        {
          game_session: nil,
          errors: [e.message]
        }
      end
    end
  end
end
