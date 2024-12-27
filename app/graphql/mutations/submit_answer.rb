# app/graphql/mutations/submit_answer.rb
module Mutations
  class SubmitAnswer < BaseMutation
    argument :question_id, ID, required: true
    argument :answer_id, ID, required: true
    argument :player_id, ID, required: true

    field :success, Boolean, null: false
    field :correct, Boolean, null: true
    field :updated_score, Integer, null: true
    field :errors, [String], null: false

    def resolve(question_id:, answer_id:, player_id:)
      # Find the game session
      game_session = GameSession.find_by(current_question_id: question_id)
      
      if game_session.nil?
        return {
          success: false,
          correct: nil,
          updated_score: nil,
          errors: ["Game session not found"]
        }
      end

      # Verify player exists and belongs to this game session
      player = game_session.players.find_by(id: player_id)
      
      if player.nil?
        return {
          success: false,
          correct: nil,
          updated_score: nil,
          errors: ["Player not found in this game session"]
        }
      end

      # Handle no answer case
      is_correct = false
      if answer_id != '0'
        # Find the choice and verify it belongs to the current question
        choice = Choice.find_by(id: answer_id, question_id: question_id)
        is_correct = choice&.correct || false
      end
      
      # Record the answer using the game session method
      game_session.record_answer(
        player_id: player.id,
        is_correct: is_correct
      )

      {
        success: true,
        correct: is_correct,
        updated_score: player.reload.score,
        errors: []
      }
    rescue StandardError => e
      Rails.logger.error "Error submitting answer: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      {
        success: false,
        correct: nil,
        updated_score: nil,
        errors: ["Error submitting answer: #{e.message}"]
      }
    end
  end
end
