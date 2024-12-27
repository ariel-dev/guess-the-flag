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
    return unless active
    
    # Check if we've reached max questions before proceeding
    if questions_count >= max_questions
      update!(active: false)
      broadcast_game_finished
      return
    end
    
    transaction do
      players.update_all(has_answered: false)
      
      used_question_ids = Question.joins(:game_sessions)
                                 .where(game_sessions: { id: id })
                                 .pluck(:id)
      
      next_question = Question.where.not(id: used_question_ids).order("RANDOM()").first
      
      if next_question
        update!(
          current_question: next_question,
          questions_count: questions_count + 1
        )
        
        # Broadcast the next question with complete data
        ActionCable.server.broadcast(
          "game_session_#{session_code}",
          {
            event: "next_question",
            data: {
              questions_remaining: max_questions - questions_count,
              current_question: {
                id: next_question.id,
                prompt: next_question.prompt,
                flag: {
                  imageUrl: next_question.flag.image_url
                },
                choices: next_question.choices.map { |c| 
                  { id: c.id, label: c.label }
                }
              }
            }
          }
        )
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
    
    if players.where(has_answered: false).count.zero?
      # All players have answered, move to next question after delay
      next_question!
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
end
