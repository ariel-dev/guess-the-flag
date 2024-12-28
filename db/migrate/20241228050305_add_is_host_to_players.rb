class AddIsHostToPlayers < ActiveRecord::Migration[7.0]
  def change
    add_column :players, :is_host, :boolean, null: false, default: false
  end
end
