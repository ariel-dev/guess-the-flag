# app/graphql/mutations/join_game_session.rb
module Mutations
  class JoinGameSession < BaseMutation
    description "Allows a player to join a game session by providing session code and player name."

    # Define arguments
    argument :session_code, String, required: true, description: "The session code of the game session to join."
    argument :player_name, String, required: true, description: "The name of the player joining the session."

    # Define the return field
    field :player, Types::PlayerType, null: false, description: "The newly created player."

    def resolve(session_code:, player_name:)
      # Find the GameSession by session_code
      game_session = GameSession.find_by(session_code: session_code)

      unless game_session
        raise GraphQL::ExecutionError, "GameSession with session_code '#{session_code}' not found."
      end

      # Check if the session is active
      unless game_session.active
        raise GraphQL::ExecutionError, "GameSession with session_code '#{session_code}' is not active."
      end

      # Create a new Player associated with the GameSession
      player = game_session.players.create!(name: player_name, ready: false, score: 0)

      {
        player: player
      }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to join GameSession: #{e.message}")
    end
  end
end
