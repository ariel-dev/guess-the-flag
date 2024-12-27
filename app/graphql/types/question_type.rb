# app/graphql/types/question_type.rb
module Types
  class QuestionType < Types::BaseObject
    field :id, ID, null: false
    field :prompt, String, null: false
    field :image_url, String, null: true
    field :answers, [Types::AnswerChoiceType], null: false
  end
end
