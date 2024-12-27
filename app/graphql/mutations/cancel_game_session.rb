module Mutations
  class CancelGameSession < BaseMutation
    argument :session_code, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve(session_code:)
      game_session = GameSession.find_by(session_code: session_code)
      
      if game_session.nil?
        return {
          success: false,
          errors: ["Game session not found"]
        }
      end

      # Broadcast game cancellation to all players
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          event: "game_cancelled",
          data: {
            message: "Game has been cancelled by the host"
          }
        }
      )

      # Delete the game session and all associated players
      game_session.destroy!

      {
        success: true,
        errors: []
      }
    end
  end
end 