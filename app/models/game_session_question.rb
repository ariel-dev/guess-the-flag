# app/models/game_session_question.rb
class GameSessionQuestion < ApplicationRecord
  belongs_to :game_session
  belongs_to :question
  
  validates :order, presence: true, 
                   numericality: { only_integer: true, greater_than: 0 },
                   uniqueness: { scope: :game_session_id }
end