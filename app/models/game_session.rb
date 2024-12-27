class GameSession < ApplicationRecord
  # Associations
  has_many :players, dependent: :destroy
  belongs_to :current_question, class_name: 'Question', optional: true

  # Validations
  validates :session_code, presence: true, uniqueness: true
  validates :active, inclusion: { in: [true, false] }

  def set_first_question!
    first_question = Question.order("RANDOM()").first
    
    if first_question
      # Reset counters when starting a new game
      update!(
        current_question: first_question,
        questions_count: 1,
        active: true
      )
      players.update_all(has_answered: false)
      
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          event: "game_started",
          data: {
            active: true,
            current_question: {
              id: first_question.id,
              prompt: first_question.prompt,
              flag: {
                imageUrl: first_question.flag.image_url
              },
              choices: first_question.choices.map { |c| 
                { id: c.id, label: c.label }
              }
            },
            questions_remaining: max_questions - 1
          }
        }
      )
    else
      raise StandardError.new("No questions available in the database")
    end
  end

  def next_question!
    return if questions_count >= max_questions

    next_question = Question.where.not(id: current_question_id).sample

    if next_question
      self.questions_count += 1
      update!(current_question: next_question, questions_count: questions_count)
      players.update_all(has_answered: false)
      
      if questions_count >= max_questions
        # This is the last question
        update!(active: false)
      end
      
      ActionCable.server.broadcast(
        "game_session_#{session_code}",
        {
          event: "next_question",
          data: {
            current_question: {
              id: next_question.id,
              prompt: next_question.prompt,
              flag: {
                imageUrl: next_question.flag.image_url
              },
              choices: next_question.choices.map { |c| 
                { id: c.id, label: c.label }
              }
            },
            questions_remaining: max_questions - questions_count
          }
        }
      )
    else
      # No more questions available, end the game
      update!(active: false)
      broadcast_game_finished
    end
  end

  def broadcast_game_finished
    ActionCable.server.broadcast(
      "game_session_#{session_code}",
      {
        event: "game_finished",
        data: {
          final_scores: players.order(score: :desc).map { |p| 
            { id: p.id, name: p.name, score: p.score }
          }
        }
      }
    )
  end

  def check_all_players_answered
    return unless active && current_question
    
    if players.where(has_answered: false).count.zero?
      # All players have answered, move to next question after delay
      next_question!
    end
  end
end
