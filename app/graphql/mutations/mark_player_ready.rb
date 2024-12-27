# app/graphql/mutations/mark_player_ready.rb
module Mutations
  class MarkPlayerReady < BaseMutation
    description "Toggles the 'ready' status of a player by their ID."

    # Define argument
    argument :player_id, ID, required: true, description: "The ID of the player to toggle readiness."

    # Define the return field
    field :player, Types::PlayerType, null: false, description: "The updated player."

    def resolve(player_id:)
      # Find the Player by ID
      player = Player.find_by(id: player_id)

      unless player
        raise GraphQL::ExecutionError, "Player with ID '#{player_id}' not found."
      end

      # Toggle the 'ready' status
      player.ready = !player.ready
      player.save!

      {
        player: player
      }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to update Player: #{e.message}")
    end
  end
end
