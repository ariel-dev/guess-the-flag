class CreateQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :questions do |t|
      t.string :prompt, null: false
      t.string :image_url

      t.timestamps
    end
  end
end