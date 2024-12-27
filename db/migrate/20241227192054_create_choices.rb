class CreateChoices < ActiveRecord::Migration[7.0]
  def change
    create_table :choices do |t|
      t.string :label, null: false
      t.boolean :correct, null: false, default: false
      t.references :question, null: false, foreign_key: true

      t.timestamps
    end
  end
end