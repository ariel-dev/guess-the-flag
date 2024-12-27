# app/graphql/mutations/join_game_session.rb
module Mutations
  class JoinGameSession < BaseMutation
    description "Allows a player to join a game session by providing session code and player name."

    # Define arguments
    argument :session_code, String, required: true, description: "The session code of the game session to join."
    argument :player_name, String, required: true, description: "The name of the player joining the session."
    argument :existing_player_id, ID, required: false

    # Define the return field
    field :player, Types::PlayerType, null: true, description: "The newly created player."

    def resolve(session_code:, player_name:, existing_player_id: nil)
      game_session = GameSession.find_by(session_code: session_code)
      
      if game_session.nil?
        raise GraphQL::ExecutionError, "Game session not found"
      end

      # Try to find existing player if ID provided
      player = if existing_player_id
                game_session.players.find_by(id: existing_player_id)
              end

      # Create new player if no existing player found
      if player.nil?
        player = game_session.players.create!(
          name: player_name,
          ready: false,
          score: 0
        )
      else
        # Update existing player's name if it changed
        player.update!(name: player_name) if player.name != player_name
      end

      {
        player: player
      }
    rescue ActiveRecord::RecordInvalid => e
      raise GraphQL::ExecutionError, e.record.errors.full_messages.join(", ")
    end
  end
end
