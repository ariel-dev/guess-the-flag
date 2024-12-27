class GameSession < ApplicationRecord
  # Associations
  has_many :players, dependent: :destroy
  belongs_to :current_question, class_name: 'Question', optional: true

  # Validations
  validates :session_code, presence: true, uniqueness: true
  validates :active, inclusion: { in: [true, false] }
end
