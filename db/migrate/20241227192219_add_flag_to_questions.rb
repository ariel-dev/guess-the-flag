class AddFlagToQuestions < ActiveRecord::Migration[7.0]
  def change
    add_reference :questions, :flag, null: false, foreign_key: true
  end
end