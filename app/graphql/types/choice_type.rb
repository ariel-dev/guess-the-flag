# app/graphql/types/choice_type.rb
module Types
  class ChoiceType < Types::BaseObject
    description "A possible answer choice for a question."

    field :id, ID, null: false
    field :label, String, null: false
    field :is_correct, Boolean, null: false, method: :correct_choice?
  end
end
