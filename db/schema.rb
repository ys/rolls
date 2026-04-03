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

ActiveRecord::Schema[7.1].define(version: 2026_04_03_114614) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "api_keys", id: :text, force: :cascade do |t|
    t.text "user_id"
    t.text "key_hash", null: false
    t.text "label"
    t.timestamptz "last_used_at"
    t.timestamptz "created_at"

    t.unique_constraint ["key_hash"], name: "api_keys_key_hash_key"
  end

  create_table "cameras", primary_key: "uuid", id: :text, force: :cascade do |t|
    t.text "slug", null: false
    t.text "user_id"
    t.text "brand"
    t.text "model"
    t.text "nickname"
    t.integer "format", default: 135
    t.timestamptz "updated_at"

    t.unique_constraint ["user_id", "slug"], name: "cameras_user_id_slug_key"
  end

  create_table "catalog_films", primary_key: "slug", id: :text, force: :cascade do |t|
    t.text "brand"
    t.text "name"
    t.text "nickname"
    t.integer "iso"
    t.boolean "color", default: true
    t.boolean "slide", default: false
    t.boolean "show_iso", default: false
    t.text "gradient_from"
    t.text "gradient_to"
  end

  create_table "films", primary_key: "uuid", id: :text, force: :cascade do |t|
    t.text "slug", null: false
    t.text "user_id"
    t.text "brand"
    t.text "name"
    t.text "nickname"
    t.integer "iso"
    t.boolean "color", default: true
    t.boolean "slide", default: false
    t.boolean "show_iso", default: false
    t.text "gradient_from"
    t.text "gradient_to"
    t.timestamptz "updated_at"

    t.unique_constraint ["user_id", "slug"], name: "films_user_id_slug_key"
  end

  create_table "invites", id: :text, force: :cascade do |t|
    t.text "code", null: false
    t.text "created_by"
    t.text "used_by"
    t.integer "max_uses", default: 1
    t.integer "used_count", default: 0
    t.timestamptz "expires_at"
    t.timestamptz "created_at"
    t.timestamptz "used_at"

    t.unique_constraint ["code"], name: "invites_code_key"
  end

  create_table "rolls", primary_key: "uuid", id: :text, force: :cascade do |t|
    t.text "roll_number"
    t.text "user_id"
    t.text "camera_uuid"
    t.text "film_uuid"
    t.timestamptz "loaded_at"
    t.date "shot_at"
    t.timestamptz "fridge_at"
    t.timestamptz "lab_at"
    t.text "lab_name"
    t.text "lab_id"
    t.date "scanned_at"
    t.timestamptz "processed_at"
    t.timestamptz "uploaded_at"
    t.timestamptz "archived_at"
    t.text "album_name"
    t.text "tags", array: true
    t.text "notes"
    t.text "contact_sheet_url"
    t.integer "push_pull"
    t.timestamptz "created_at"
    t.timestamptz "updated_at"

    t.unique_constraint ["user_id", "roll_number"], name: "rolls_user_id_roll_number_key"
  end

  create_table "schema_migrations", primary_key: "version", id: :string, force: :cascade do |t|
  end

  create_table "users", id: :text, force: :cascade do |t|
    t.text "username", null: false
    t.text "name"
    t.text "email"
    t.boolean "email_notifications", default: true
    t.text "role", default: "user"
    t.integer "invite_quota"
    t.integer "invites_sent", default: 0
    t.timestamptz "created_at"
    t.timestamptz "last_seen_at"
    t.text "apple_user_id"

    t.unique_constraint ["email"], name: "users_email_key"
    t.unique_constraint ["username"], name: "users_username_key"
  end

  create_table "webauthn_credentials", id: :text, force: :cascade do |t|
    t.text "user_id"
    t.text "credential_id", null: false
    t.text "public_key", null: false
    t.bigint "counter", default: 0
    t.text "transports", array: true
    t.text "device_name"
    t.timestamptz "last_used_at"
    t.timestamptz "created_at"

    t.unique_constraint ["credential_id"], name: "webauthn_credentials_credential_id_key"
  end

  add_foreign_key "api_keys", "users", name: "api_keys_user_id_fkey"
  add_foreign_key "cameras", "users", name: "cameras_user_id_fkey"
  add_foreign_key "films", "users", name: "films_user_id_fkey"
  add_foreign_key "invites", "users", column: "created_by", name: "invites_created_by_fkey"
  add_foreign_key "invites", "users", column: "used_by", name: "invites_used_by_fkey"
  add_foreign_key "rolls", "cameras", column: "camera_uuid", primary_key: "uuid", name: "rolls_camera_uuid_fkey"
  add_foreign_key "rolls", "films", column: "film_uuid", primary_key: "uuid", name: "rolls_film_uuid_fkey"
  add_foreign_key "rolls", "users", name: "rolls_user_id_fkey"
  add_foreign_key "webauthn_credentials", "users", name: "webauthn_credentials_user_id_fkey"
end
