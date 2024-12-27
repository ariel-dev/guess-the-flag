class Question < ApplicationRecord
    belongs_to :flag
    has_many :choices
    has_many :game_sessions, foreign_key: 'current_question_id'
  end