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
      game_session = GameSession.find_by(session_code: session_code)
      raise GraphQL::ExecutionError, "GameSession with code #{session_code} not found." unless game_session
      raise GraphQL::ExecutionError, "GameSession is not active." unless game_session.active

       # Create a new player
       player = game_session.players.create!(
        name:  player_name,
        ready: false,
        score: 0
      )

      # Broadcast to all subscribers of this session_code
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        { event: "player_joined",
          data: {
            id: player.id,
            name: player.name,
            ready: player.ready,
            score: player.score
          }
        }
      )

      { player: player }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to join GameSession: #{e.message}")
    end
  end
end
