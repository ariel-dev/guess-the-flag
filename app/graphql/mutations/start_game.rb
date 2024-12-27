# app/graphql/mutations/start_game.rb
module Mutations
  class StartGame < BaseMutation
    description "Host starts the game, sets the first question."

    argument :session_code, String, required: true, description: "The session code of the game session to start."

    field :game_session, Types::GameSessionType, null: true, description: "The updated game session."
    field :success, Boolean, null: false

    def resolve(session_code:)
      game_session = GameSession.find_by(session_code: session_code)
      raise GraphQL::ExecutionError, "GameSession with code #{session_code} not found." unless game_session

      # Ensure the host is starting the game
      # This might involve checking player roles; omitted for brevity

      # Select the first question (or implement your question selection logic)
      question = Question.first
      raise GraphQL::ExecutionError, "No questions available." unless question

      # Update the game session with the current question
      game_session.update!(current_question: question, active: true)

      # Broadcast the game start and the first question to all players
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          event: "game_started",
          data: {
            question_id: question.id,
            prompt: question.prompt,
            image_url: question.image_url,
            choices: question.choices.map { |c| { id: c.id, label: c.label } },
            time_limit: 10 # seconds, adjust as needed
          }
        }
      )

      {
        game_session: game_session,
        success: true
      }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to start game: #{e.message}")
    end
  end
end
