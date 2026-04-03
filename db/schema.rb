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

ActiveRecord::Schema[7.1].define(version: 2026_04_03_114057) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_stat_statements"
  enable_extension "plpgsql"

  create_table "api_keys", id: :text, default: -> { "(gen_random_uuid())::text" }, force: :cascade do |t|
    t.text "user_id", null: false
    t.text "key_hash", null: false
    t.text "label"
    t.timestamptz "last_used_at"
    t.timestamptz "created_at", default: -> { "now()" }
    t.index ["key_hash"], name: "api_keys_key_hash_idx"
    t.unique_constraint ["key_hash"], name: "api_keys_key_hash_key"
  end

  create_table "cameras", primary_key: "uuid", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "slug", null: false
    t.text "brand", null: false
    t.text "model", null: false
    t.text "nickname"
    t.integer "format", default: 135
    t.timestamptz "updated_at", default: -> { "now()" }
    t.text "user_id", null: false
    t.index ["slug"], name: "cameras_slug_idx"
    t.index ["user_id"], name: "cameras_user_id_idx"
    t.unique_constraint ["user_id", "slug"], name: "cameras_user_id_slug_uniq"
  end

  create_table "catalog_films", primary_key: "slug", id: :text, force: :cascade do |t|
    t.text "brand", null: false
    t.text "name", null: false
    t.text "nickname"
    t.integer "iso"
    t.boolean "color", default: true
    t.boolean "show_iso", default: false
    t.text "gradient_from"
    t.text "gradient_to"
  end

  create_table "films", primary_key: "uuid", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "slug", null: false
    t.text "brand", null: false
    t.text "name", null: false
    t.text "nickname"
    t.integer "iso"
    t.boolean "color", default: true
    t.boolean "show_iso", default: false
    t.timestamptz "updated_at", default: -> { "now()" }
    t.text "user_id", null: false
    t.index ["slug"], name: "films_slug_idx"
    t.index ["user_id"], name: "films_user_id_idx"
    t.unique_constraint ["user_id", "slug"], name: "films_user_id_slug_uniq"
  end

  create_table "invites", id: :text, default: -> { "(gen_random_uuid())::text" }, force: :cascade do |t|
    t.text "code", null: false
    t.text "created_by", null: false
    t.text "used_by"
    t.integer "max_uses", default: 1
    t.integer "used_count", default: 0
    t.timestamptz "expires_at"
    t.timestamptz "created_at", default: -> { "now()" }
    t.timestamptz "used_at"
    t.index ["code"], name: "invites_code_idx"
    t.index ["created_by"], name: "invites_created_by_idx"
    t.unique_constraint ["code"], name: "invites_code_key"
  end

  create_table "rolls", primary_key: "uuid", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "roll_number", null: false
    t.date "shot_at"
    t.timestamptz "fridge_at"
    t.timestamptz "lab_at"
    t.text "lab_name"
    t.date "scanned_at"
    t.timestamptz "processed_at"
    t.timestamptz "uploaded_at"
    t.timestamptz "archived_at"
    t.text "album_name"
    t.text "tags", array: true
    t.text "notes"
    t.text "contact_sheet_url"
    t.timestamptz "updated_at", default: -> { "now()" }
    t.text "user_id", null: false
    t.uuid "camera_uuid"
    t.uuid "film_uuid"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.decimal "push_pull", precision: 4, scale: 1
    t.integer "frame_count"
    t.timestamptz "loaded_at"
    t.index ["roll_number"], name: "rolls_roll_number_idx"
    t.index ["user_id"], name: "rolls_user_id_idx"
    t.unique_constraint ["user_id", "roll_number"], name: "rolls_user_id_slug_uniq"
  end

  create_table "schema_migrations", id: :serial, force: :cascade do |t|
    t.text "name", null: false
    t.timestamptz "applied_at", default: -> { "now()" }

    t.unique_constraint ["name"], name: "schema_migrations_name_key"
  end

  create_table "users", id: :text, default: -> { "(gen_random_uuid())::text" }, force: :cascade do |t|
    t.text "username", null: false
    t.text "name"
    t.text "email", null: false
    t.boolean "email_notifications", default: true
    t.timestamptz "created_at", default: -> { "now()" }
    t.text "role", default: "user", null: false
    t.timestamptz "last_seen_at"
    t.integer "invite_quota", default: 3
    t.integer "invites_sent", default: 0
    t.text "apple_user_id"

    t.unique_constraint ["email"], name: "users_email_key"
    t.unique_constraint ["username"], name: "users_username_key"
  end

  create_table "webauthn_credentials", id: :text, default: -> { "(gen_random_uuid())::text" }, force: :cascade do |t|
    t.text "user_id", null: false
    t.text "credential_id", null: false
    t.text "public_key", null: false
    t.bigint "counter", default: 0, null: false
    t.text "transports", array: true
    t.text "device_name"
    t.timestamptz "last_used_at"
    t.timestamptz "created_at", default: -> { "now()" }
    t.index ["credential_id"], name: "webauthn_credentials_credential_id_idx"
    t.index ["user_id"], name: "webauthn_credentials_user_id_idx"
    t.unique_constraint ["credential_id"], name: "webauthn_credentials_credential_id_key"
  end

  add_foreign_key "api_keys", "users", name: "api_keys_user_id_fkey", on_delete: :cascade
  add_foreign_key "cameras", "users", name: "cameras_user_id_fkey", on_delete: :cascade
  add_foreign_key "films", "users", name: "films_user_id_fkey", on_delete: :cascade
  add_foreign_key "invites", "users", column: "created_by", name: "invites_created_by_fkey", on_delete: :cascade
  add_foreign_key "invites", "users", column: "used_by", name: "invites_used_by_fkey", on_delete: :nullify
  add_foreign_key "rolls", "cameras", column: "camera_uuid", primary_key: "uuid", name: "rolls_camera_uuid_fkey"
  add_foreign_key "rolls", "films", column: "film_uuid", primary_key: "uuid", name: "rolls_film_uuid_fkey"
  add_foreign_key "rolls", "users", name: "rolls_user_id_fkey", on_delete: :cascade
  add_foreign_key "webauthn_credentials", "users", name: "webauthn_credentials_user_id_fkey", on_delete: :cascade
end
