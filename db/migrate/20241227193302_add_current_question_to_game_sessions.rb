class AddCurrentQuestionToGameSessions < ActiveRecord::Migration[7.0]
  def change
    add_reference :game_sessions, :current_question, foreign_key: { to_table: :questions }, null: true
  end
end