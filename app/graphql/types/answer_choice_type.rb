# app/graphql/types/answer_choice_type.rb
module Types
  class AnswerChoiceType < Types::BaseObject
    field :id, ID, null: false
    field :text, String, null: false
  end
end
