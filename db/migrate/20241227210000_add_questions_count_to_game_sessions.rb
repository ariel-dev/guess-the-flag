class AddQuestionsCountToGameSessions < ActiveRecord::Migration[7.0]
  def change
    add_column :game_sessions, :questions_count, :integer, default: 0, null: false
    add_column :game_sessions, :max_questions, :integer, default: 10, null: false
  end
end 