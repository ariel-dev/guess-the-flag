module Mutations
  class CreateGameSession < BaseMutation
    description "Creates a new game session and returns it."

    argument :host_name, String, required: true, description: "The name of the host player"

    # Define the return field
    field :game_session, Types::GameSessionType, null: false,
      description: "The created game session."
    field :host_player, Types::PlayerType, null: false,
      description: "The host player."

    def resolve(host_name:)
      # Generate a unique session code
      session_code = SecureRandom.alphanumeric(6).upcase

      # Ensure uniqueness
      while GameSession.exists?(session_code: session_code)
        session_code = SecureRandom.alphanumeric(6).upcase
      end

      # Create the GameSession and host player in a transaction
      ActiveRecord::Base.transaction do
        game_session = GameSession.create!(
          session_code: session_code,
          active: false
        )

        host_player = game_session.players.create!(
          name: host_name,
          is_host: true,
          ready: true  # Host is always ready
        )

        {
          game_session: game_session,
          host_player: host_player
        }
      end
    rescue ActiveRecord::RecordInvalid => e
      raise GraphQL::ExecutionError.new("Failed to create GameSession: #{e.record.errors.full_messages.join(', ')}")
    rescue => e
      raise GraphQL::ExecutionError.new("An unexpected error occurred: #{e.message}")
    end
  end
end