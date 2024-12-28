module Mutations
  class CancelGameSession < BaseMutation
    argument :session_code, String, required: true

    field :success, Boolean, null: false
    field :errors, [String], null: false
    field :new_session_code, String, null: true

    def resolve(session_code:)
      game_session = GameSession.find_by(code: session_code)

      if game_session.nil?
        return {
          success: false,
          errors: ["Game session not found"],
          new_session_code: nil
        }
      end

      # Create a new game session
      new_session = GameSession.create!

      # Copy players to the new session, preserving host status
      game_session.players.each do |player|
        new_session.players.create!(
          name: player.name,
          is_host: player.is_host
        )
      end

      # Broadcast game cancelled event with new session code
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          type: 'game_cancelled',
          new_session_code: new_session.code
        }
      )

      # Delete the old session
      game_session.destroy

      {
        success: true,
        errors: [],
        new_session_code: new_session.code
      }
    end
  end
end 