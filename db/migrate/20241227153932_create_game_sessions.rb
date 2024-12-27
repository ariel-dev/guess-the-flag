class CreateGameSessions < ActiveRecord::Migration[7.0]
  def change
    create_table :game_sessions do |t|
      t.string :session_code
      t.boolean :active, default: true, null: false

      t.timestamps
    end
    add_index :game_sessions, :session_code, unique: true
  end
end
