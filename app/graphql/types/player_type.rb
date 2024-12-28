# app/graphql/types/player_type.rb
module Types
  class PlayerType < Types::BaseObject
    description "A player in the game session."

    field :id, ID, null: false
    field :name, String, null: false
    field :ready, Boolean, null: false
    field :score, Integer, null: false
    field :is_host, Boolean, null: false
    field :game_session_id, Integer, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
