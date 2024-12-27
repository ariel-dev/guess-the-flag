class GameSession < ApplicationRecord
  # Associations
  has_many :players, dependent: :destroy

  # Validations
  validates :session_code, presence: true, uniqueness: true
  validates :active, inclusion: { in: [true, false] }
end
