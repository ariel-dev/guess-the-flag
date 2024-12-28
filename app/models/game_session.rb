class GameSession < ApplicationRecord
  # Associations
  has_many :players, dependent: :destroy
  has_many :game_session_questions, dependent: :destroy
  has_many :questions, through: :game_session_questions
  belongs_to :current_question, class_name: 'Question', optional: true

  # Validations
  validates :session_code, presence: true, uniqueness: true
  validates :active, inclusion: { in: [true, false] }
  validates :max_questions, presence: true, numericality: { only_integer: true, greater_than: 0 }
  
  # Default value for max_questions if you want one
  after_initialize :set_default_max_questions, if: :new_record?

  def set_first_question!
    # Load and shuffle questions for the game
    available_questions = Question.order("RANDOM()").limit(max_questions)
    
    if available_questions.empty?
      raise StandardError.new("No questions available in the database")
    end

    # Create ordered game questions
    available_questions.each_with_index do |question, index|
      game_session_questions.create!(
        question: question,
        order: index + 1
      )
    end

    # Set first question
    first_question = questions.first
    update!(
      current_question: first_question,
      questions_count: 1,
      active: true
    )
    players.update_all(has_answered: false)
    
    broadcast_current_question(first_question)
  end

  def next_question!
    return unless active
    
    if questions_count >= max_questions
      update!(active: false)
      broadcast_game_finished
      return
    end
    
    transaction do
      players.update_all(has_answered: false)
      
      next_question = game_session_questions
        .where('order > ?', questions_count)
        .order(:order)
        .first&.question
      
      if next_question
        update!(
          current_question: next_question,
          questions_count: questions_count + 1
        )
        
        broadcast_current_question(next_question)
      else
        update!(active: false)
        broadcast_game_finished
      end
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
    
    # Use with_lock to prevent race conditions
    with_lock do
      # Check again inside the lock as conditions might have changed
      return unless active && current_question
      
      if all_players_answered?
        # All players have answered, move to next question after delay
        handle_all_answers_received
      end
    end
  end

  def record_answer(player_id:, is_correct:)
    # Find player scoped to this game session
    player = players.find_by(id: player_id)
    
    if player.nil?
      Rails.logger.error "Player #{player_id} not found in game session #{id}"
      raise GraphQL::ExecutionError, "Player not found in this game session"
    end

    # Lock the player record to prevent race conditions
    Player.transaction do
      player.reload.lock!
      
      # Update player's status and score
      player.update!(
        has_answered: true,
        score: is_correct ? player.score + 1 : player.score
      )

      # Broadcast the answer result
      broadcast_answer_result(player.id, is_correct, player.score)
      
      # Broadcast answer progress to all players
      broadcast_answer_progress
      
      # Check if all players have answered
      if all_players_answered?
        handle_all_answers_received
      end
    end
  end

  private

  def all_players_answered?
    players.where(has_answered: false).count.zero?
  end

  def handle_all_answers_received
    # Wait briefly before moving to next question
    sleep(3)
    next_question!
  end

  def broadcast_answer_result(player_id, is_correct, score)
    ActionCable.server.broadcast(
      "game_session_#{session_code}",
      {
        event: "answer_submitted",
        data: {
          player_id: player_id,
          correct: is_correct,
          score: score
        }
      }
    )
  end

  def broadcast_answer_progress
    total_players = players.count
    answered_players = players.where(has_answered: true).count
    
    ActionCable.server.broadcast(
      "game_session_#{session_code}",
      {
        event: "answer_progress",
        data: {
          total: total_players,
          answered: answered_players
        }
      }
    )
  end

  def set_default_max_questions
    self.max_questions ||= 10  # Set default to 10 questions per game
  end

  def broadcast_current_question(question)
    ActionCable.server.broadcast(
      "game_session_#{session_code}",
      {
        event: questions_count == 1 ? "game_started" : "next_question",
        data: {
          active: true,
          questions_remaining: max_questions - questions_count,
          current_question: {
            id: question.id,
            prompt: question.prompt,
            flag: {
              imageUrl: question.flag.image_url
            },
            choices: question.choices.map { |c| 
              { id: c.id, label: c.label }
            }
          }
        }
      }
    )
  end
end
