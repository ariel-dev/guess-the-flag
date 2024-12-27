class Player < ApplicationRecord
  # Associations
  belongs_to :game_session

  # Validations
  validates :name, presence: true
  validates :ready, inclusion: { in: [true, false] }
  validates :score, numericality: { greater_than_or_equal_to: 0 }
end
