# app/graphql/types/question_type.rb
module Types
  class QuestionType < Types::BaseObject
    description "A question in the game."

    field :id, ID, null: false
    field :prompt, String, null: false
    field :image_url, String, null: true
    field :choices, [Types::ChoiceType], null: false
  end
end
