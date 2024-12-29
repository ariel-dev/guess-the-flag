class QuestionTimerJob
  include Sidekiq::Job

  def perform(game_session_id, question_number)
    # Find the game session
    game_session = GameSession.find_by(id: game_session_id)
    return unless game_session&.active && game_session.questions_count == question_number

    # Broadcast time's up event
    ActionCable.server.broadcast(
      "game_session_#{game_session.session_code}",
      {
        event: "question_time_up",
        data: {}
      }
    )

    # Give players 2 seconds to see their results
    sleep(2)

    # Move to next question if the game is still active and we're still on the same question
    game_session.reload
    if game_session.active && game_session.questions_count == question_number
      game_session.next_question!
    end
  end
end 