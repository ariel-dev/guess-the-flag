# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2024_12_28_050305) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "choices", force: :cascade do |t|
    t.string "label", null: false
    t.boolean "correct", default: false, null: false
    t.bigint "question_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["question_id"], name: "index_choices_on_question_id"
  end

  create_table "flags", force: :cascade do |t|
    t.string "name", null: false
    t.string "image_url", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "game_session_questions", force: :cascade do |t|
    t.bigint "game_session_id", null: false
    t.bigint "question_id", null: false
    t.integer "order", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_session_id", "order"], name: "index_game_session_questions_on_game_session_id_and_order", unique: true
    t.index ["game_session_id"], name: "index_game_session_questions_on_game_session_id"
    t.index ["question_id"], name: "index_game_session_questions_on_question_id"
  end

  create_table "game_sessions", force: :cascade do |t|
    t.string "session_code"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "current_question_id"
    t.integer "questions_count", default: 0, null: false
    t.integer "max_questions", default: 10, null: false
    t.index ["current_question_id"], name: "index_game_sessions_on_current_question_id"
    t.index ["session_code"], name: "index_game_sessions_on_session_code", unique: true
  end

  create_table "players", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "ready", default: false, null: false
    t.integer "score", default: 0, null: false
    t.bigint "game_session_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "has_answered", default: false, null: false
    t.boolean "is_host", default: false, null: false
    t.index ["game_session_id"], name: "index_players_on_game_session_id"
  end

  create_table "questions", force: :cascade do |t|
    t.string "prompt", null: false
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "flag_id", null: false
    t.index ["flag_id"], name: "index_questions_on_flag_id"
  end

  add_foreign_key "choices", "questions"
  add_foreign_key "game_session_questions", "game_sessions"
  add_foreign_key "game_session_questions", "questions"
  add_foreign_key "game_sessions", "questions", column: "current_question_id"
  add_foreign_key "players", "game_sessions"
  add_foreign_key "questions", "flags"
end
