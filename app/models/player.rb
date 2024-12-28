class Player < ApplicationRecord
  # Associations
  belongs_to :game_session

  # Validations
  validates :name, presence: true
  validates :ready, inclusion: { in: [true, false] }
  validates :score, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :is_host, inclusion: { in: [true, false] }

  # Set default values
  after_initialize :set_defaults, if: :new_record?

  private

  def set_defaults
    self.ready ||= false
    self.score ||= 0
    self.is_host ||= false
    self.has_answered ||= false
  end
end
