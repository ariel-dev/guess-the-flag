# app/graphql/mutations/submit_answer.rb
module Mutations
  class SubmitAnswer < BaseMutation
    description "Submit an answer to the current question."

    argument :question_id, ID, required: true, description: "The ID of the current question."
    argument :answer_id, ID, required: true, description: "The ID of the chosen answer."
    argument :player_id, ID, required: true, description: "The ID of the player submitting the answer."

    field :success, Boolean, null: false
    field :correct, Boolean, null: false
    field :updated_score, Integer, null: false

    def resolve(question_id:, answer_id:, player_id:)
      # Find the choice and question
      choice = Choice.find(answer_id)
      question = Question.find(question_id)
      player = Player.find(player_id)
      
      # Find the game session
      game_session = GameSession.find_by(current_question_id: question_id)
      raise GraphQL::ExecutionError, "Game session not found" unless game_session
      
      # Update player's score if answer is correct
      is_correct = choice.correct
      if is_correct
        player.increment!(:score, 10) # Award 10 points for correct answer
      end

      # Mark player as having answered
      player.update!(has_answered: true)

      # Broadcast the result to all players
      ActionCable.server.broadcast(
        "game_session_#{game_session.session_code}",
        {
          event: "answer_submitted",
          data: {
            player_id: player_id,
            correct: is_correct
          }
        }
      )

      # Check if all players have answered and move to next question if they have
      game_session.check_all_players_answered

      {
        success: true,
        correct: is_correct,
        updated_score: player.score
      }
    rescue ActiveRecord::RecordNotFound => e
      GraphQL::ExecutionError.new("Record not found: #{e.message}")
    end
  end
end
