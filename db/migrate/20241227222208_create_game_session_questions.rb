# db/migrate/YYYYMMDDHHMMSS_create_game_session_questions.rb
class CreateGameSessionQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :game_session_questions do |t|
      t.references :game_session, null: false, foreign_key: true
      t.references :question, null: false, foreign_key: true
      t.integer :order, null: false
      t.timestamps
    end
    
    add_index :game_session_questions, [:game_session_id, :order], unique: true
  end
end