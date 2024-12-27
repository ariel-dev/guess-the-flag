# app/graphql/types/game_session_type.rb
module Types
  class GameSessionType < Types::BaseObject
    description "A game session where players can join and play the game."

    field :id, ID, null: false
    field :session_code, String, null: false
    field :active, Boolean, null: false
    field :players, [PlayerType], null: true, description: "List of players in the game session."
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
