# app/graphql/mutations/mark_player_ready.rb
module Mutations
  class MarkPlayerReady < BaseMutation
    description "Toggles the 'ready' status of a player by their ID."

    # Define argument
    argument :player_id, ID, required: true, description: "The ID of the player to toggle readiness."

    # Define the return field
    field :player, Types::PlayerType, null: false, description: "The updated player."

    def resolve(player_id:)
      player = Player.find_by(id: player_id)
      raise GraphQL::ExecutionError, "Player with ID #{player_id} not found." unless player

      # Toggle the 'ready' status
      player.ready = !player.ready
      player.save!

       # Broadcast readiness change to everyone in the same game session
       ActionCable.server.broadcast(
        "game_session_#{player.game_session.session_code}",
        {event: "player_ready_toggled",
        data: {
          id:    player.id,
          name:  player.name,
          ready: player.ready,
          score: player.score
        }}
      )

      { player: player }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to update Player: #{e.message}")
    end
  end
end
