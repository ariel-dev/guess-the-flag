# app/graphql/types/game_session_type.rb
module Types
  class GameSessionType < Types::BaseObject
    description "A game session where players can join and play the game."

    field :id, ID, null: false
    field :session_code, String, null: false
    field :active, Boolean, null: false
    field :players, [Types::PlayerType], null: false, description: "List of players in the game session."
    field :current_question, Types::QuestionType, null: true, description: "The current question being asked."

    def current_question
      object.current_question
    end
  end
end
