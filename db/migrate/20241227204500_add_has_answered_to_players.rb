class AddHasAnsweredToPlayers < ActiveRecord::Migration[7.0]
  def change
    add_column :players, :has_answered, :boolean, default: false, null: false
  end
end 