class Choice < ApplicationRecord
    belongs_to :question
    
    validates :label, presence: true
    validates :correct, inclusion: { in: [true, false] }
  end