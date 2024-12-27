# app/graphql/types/mutation_type.rb
module Types
  class MutationType < Types::BaseObject
    description "The mutation root of this schema"

    # Registering Mutations
    field :create_game_session, mutation: Mutations::CreateGameSession
    field :join_game_session, mutation: Mutations::JoinGameSession
    field :mark_player_ready, mutation: Mutations::MarkPlayerReady
    field :start_game, mutation: Mutations::StartGame
    field :submit_answer, mutation: Mutations::SubmitAnswer
    field :cancel_game_session, mutation: Mutations::CancelGameSession
    field :remove_player, mutation: Mutations::RemovePlayer
  end
end
