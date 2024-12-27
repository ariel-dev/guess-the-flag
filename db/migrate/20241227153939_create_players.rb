class CreatePlayers < ActiveRecord::Migration[7.0]
  def change
    create_table :players do |t|
      t.string :name, null: false
      t.boolean :ready, default: false, null: false
      t.integer :score, default: 0, null: false
      t.references :game_session, null: false, foreign_key: true

      t.timestamps
    end
  end
end
