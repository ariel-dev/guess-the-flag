# app/graphql/types/player_type.rb
module Types
  class PlayerType < Types::BaseObject
    description "A player in the game session."

    field :id, ID, null: false
    field :name, String, null: false
    field :ready, Boolean, null: false
    field :score, Integer, null: false
    field :game_session, Types::GameSessionType, null: false
  end
end
