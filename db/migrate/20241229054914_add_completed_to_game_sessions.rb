class AddCompletedToGameSessions < ActiveRecord::Migration[7.0]
  def change
    add_column :game_sessions, :completed, :boolean, null: false, default: false
  end
end
