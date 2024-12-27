module Mutations
  class CreateGameSession < BaseMutation
    description "Creates a new game session and returns it."

    # Define the return field
    field :game_session, Types::GameSessionType, null: false,
      description: "The created game session."

    # No arguments needed for this mutation
    # Remove any input arguments if present

    def resolve
      # Generate a unique session code, e.g., a random 6-character alphanumeric string
      session_code = SecureRandom.alphanumeric(6).upcase

      # Ensure uniqueness
      while GameSession.exists?(session_code: session_code)
        session_code = SecureRandom.alphanumeric(6).upcase
      end

      # Create the GameSession
      game_session = GameSession.create!(session_code: session_code, active: true)

      {
        game_session: game_session
      }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to create GameSession: #{e.record.errors.full_messages.join(', ')}")
    rescue => e
      GraphQL::ExecutionError.new("An unexpected error occurred: #{e.message}")
    end
  end
end