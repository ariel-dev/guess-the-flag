# app/graphql/types/flag_type.rb
module Types
  class FlagType < Types::BaseObject
    description "A flag representing a country with an associated image."

    field :id, ID, null: false
    field :name, String, null: false
    field :image_url, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
