# app/graphql/mutations/submit_answer.rb
module Mutations
  class SubmitAnswer < BaseMutation
    description "Submit an answer to the current question."

    argument :question_id, ID, required: true, description: "The ID of the current question."
    argument :answer_id, ID, required: true, description: "The ID of the chosen answer."

    field :success, Boolean, null: false
    field :correct, Boolean, null: true
    field :updated_score, Integer, null: true

    def resolve(question_id:, answer_id:)
      # 1. Find the question and answer
      question = Question.find_by(id: question_id)
      raise GraphQL::ExecutionError, "Question not found." unless question

      answer = question.choices.find_by(id: answer_id)
      raise GraphQL::ExecutionError, "Answer not found." unless answer

      # 2. Identify the current player from context
      player = context[:current_player]
      raise GraphQL::ExecutionError, "Player not authenticated." unless player

      # 3. Ensure the player is part of the game session
      game_session = player.game_session
      raise GraphQL::ExecutionError, "Player not in a game session." unless game_session

      # 4. Check if the answer is correct
      is_correct = answer.is_correct

      # 5. Update the player's score if correct
      player.increment!(:score, 10) if is_correct

      # 6. Optionally, track player's answers
      # e.g., player.answers.create!(question: question, choice: answer)

      # 7. Broadcast the answer submission
      ActionCable.server.broadcast(
        "game_session_#{game_session.session_code}",
        {
          event: "player_answered",
          data: {
            player_id: player.id,
            name: player.name,
            correct: is_correct,
            updated_score: player.score
          }
        }
      )

      # 8. Check if all players have submitted their answers
      all_answered = game_session.players.all? { |p| p.answer_submitted? }

      if all_answered
        proceed_to_next_question(game_session)
      else
        # Optionally, handle partial answers or wait for more
      end

      # 9. Return response
      {
        success: true,
        correct: is_correct,
        updated_score: player.score
      }
    rescue ActiveRecord::RecordInvalid => e
      GraphQL::ExecutionError.new("Failed to submit answer: #{e.message}")
    end

    private

    def proceed_to_next_question(game_session)
      # Example logic to move to the next question
      next_question = Question.where.not(id: game_session.current_question_id).sample
      if next_question
        game_session.update!(current_question: next_question)

        ActionCable.server.broadcast(
          "game_session_#{game_session.session_code}",
          {
            event: "next_question",
            data: {
              question_id: next_question.id,
              prompt: next_question.prompt,
              image_url: next_question.image_url,
              choices: next_question.choices.map { |c| { id: c.id, label: c.label } },
              time_limit: 10 # seconds
            }
          }
        )
      else
        # No more questions, end the game
        ActionCable.server.broadcast(
          "game_session_#{game_session.session_code}",
          {
            event: "game_finished",
            data: {
              scoreboard: game_session.players.order(score: :desc).map do |p|
                { name: p.name, score: p.score }
              end
            }
          }
        )
        game_session.update!(active: false)
      end

      # Reset players' answer submission status
      game_session.players.update_all(answer_submitted: false)
    end
  end
end
