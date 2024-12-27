# app/graphql/types/player_type.rb
module Types
  class PlayerType < Types::BaseObject
    description "A player participating in a game session."

    field :id, ID, null: false
    field :name, String, null: false
    field :ready, Boolean, null: false
    field :score, Integer, null: false
    field :game_session, GameSessionType, null: false, description: "The game session the player belongs to."
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
