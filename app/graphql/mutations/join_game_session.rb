# app/graphql/mutations/join_game_session.rb
module Mutations
  class JoinGameSession < BaseMutation
    description "Allows a player to join a game session by providing session code and player name."

    # Define arguments
    argument :session_code, String, required: true, description: "The session code of the game session to join."
    argument :name, String, required: true, description: "The name of the player joining the session."

    # Define the return field
    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :player, Types::PlayerType, null: true, description: "The newly created player."

    def resolve(session_code:, name:)
      game_session = GameSession.find_by(session_code: session_code)
      
      if game_session.nil?
        return {
          success: false,
          errors: ["Game session not found"],
          player: nil
        }
      end

      # Check if this is the first player joining
      is_first_player = game_session.players.count == 0

      player = game_session.players.create(
        name: name,
        is_host: is_first_player
      )

      if player.persisted?
        # Broadcast to all players that a new player has joined
        ActionCable.server.broadcast(
          "game_session_#{session_code}",
          {
            type: 'player_joined',
            player: {
              id: player.id,
              name: player.name,
              score: player.score,
              is_host: player.is_host
            }
          }
        )

        {
          success: true,
          errors: [],
          player: player
        }
      else
        {
          success: false,
          errors: player.errors.full_messages,
          player: nil
        }
      end
    end
  end
end
