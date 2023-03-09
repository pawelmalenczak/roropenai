class CreateQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :questions do |t|
      t.string :question, null: false
      t.string :context, null: false
      t.string :answer, null: false
      t.integer :ask_count, default: 0
      t.string :audio_src_url, null: false

      t.timestamps
    end
  end
end
