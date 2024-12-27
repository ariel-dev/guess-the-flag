module Mutations
  class RemovePlayer < BaseMutation
    argument :player_id, ID, required: true
    argument :session_code, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(player_id:, session_code:)
      game_session = GameSession.find_by(session_code: session_code)
      
      if game_session.nil?
        return {
          success: false,
          errors: ["Game session not found"]
        }
      end

      player = game_session.players.find_by(id: player_id)
      
      if player.nil?
        return {
          success: false,
          errors: ["Player not found"]
        }
      end

      # Broadcast player removal to all clients
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          event: "player_removed",
          data: {
            player_id: player_id
          }
        }
      )

      player.destroy!

      {
        success: true,
        errors: []
      }
    end
  end
end 