# app/graphql/types/question_type.rb
module Types
  class QuestionType < Types::BaseObject
    description "A question in the game."

    field :id, ID, null: false
    field :prompt, String, null: false
    field :flag, Types::FlagType, null: false
    field :choices, [Types::ChoiceType], null: false
    field :image_url, String, null: false

    def image_url
      object.flag.image_url
    end
  end
end
