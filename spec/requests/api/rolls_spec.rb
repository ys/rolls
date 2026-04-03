require "rails_helper"

RSpec.describe "Rolls API", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/rolls" do
    let!(:roll1) { create(:roll, user: user) }
    let!(:roll2) { create(:roll, user: user) }
    let!(:other_roll) { create(:roll) }

    it "returns only current user rolls" do
      get "/api/rolls", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      uuids = json.map { |r| r["uuid"] }
      expect(uuids).to include(roll1.uuid, roll2.uuid)
      expect(uuids).not_to include(other_roll.uuid)
    end

    it "respects limit and offset" do
      get "/api/rolls?limit=1&offset=0", headers: headers
      json = JSON.parse(response.body)
      expect(json.length).to eq(1)
    end

    context "without auth" do
      it "returns 401" do
        get "/api/rolls"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/rolls/home" do
    let!(:active_roll) { create(:roll, :loaded, user: user) }
    let!(:archived_roll) { create(:roll, :archived, user: user) }

    it "returns only active rolls" do
      get "/api/rolls/home", headers: headers
      json = JSON.parse(response.body)
      uuids = json.map { |r| r["uuid"] }
      expect(uuids).to include(active_roll.uuid)
      expect(uuids).not_to include(archived_roll.uuid)
    end

    it "includes camera and film" do
      get "/api/rolls/home", headers: headers
      json = JSON.parse(response.body)
      roll_json = json.find { |r| r["uuid"] == active_roll.uuid }
      expect(roll_json).to have_key("camera")
      expect(roll_json).to have_key("film")
    end
  end

  describe "GET /api/rolls/archive" do
    let!(:active_roll) { create(:roll, user: user) }
    let!(:archived_roll) { create(:roll, :archived, user: user) }

    it "returns only archived rolls" do
      get "/api/rolls/archive", headers: headers
      json = JSON.parse(response.body)
      uuids = json.map { |r| r["uuid"] }
      expect(uuids).to include(archived_roll.uuid)
      expect(uuids).not_to include(active_roll.uuid)
    end
  end

  describe "GET /api/rolls/next" do
    it "returns next roll number in YYxx format" do
      get "/api/rolls/next", headers: headers
      json = JSON.parse(response.body)
      year_prefix = Time.current.year.to_s[-2..]
      expect(json["roll_number"]).to start_with(year_prefix)
    end

    it "increments based on existing rolls" do
      create(:roll, user: user, roll_number: "#{Time.current.year.to_s[-2..]}x05")
      get "/api/rolls/next", headers: headers
      json = JSON.parse(response.body)
      expect(json["roll_number"]).to eq("#{Time.current.year.to_s[-2..]}x06")
    end
  end

  describe "GET /api/rolls/:id" do
    let!(:roll) { create(:roll, :loaded, user: user) }

    it "returns the roll with associations" do
      get "/api/rolls/#{roll.uuid}", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["uuid"]).to eq(roll.uuid)
      expect(json["status"]).to eq("loaded")
      expect(json).to have_key("camera")
      expect(json).to have_key("film")
    end

    it "returns 404 for another user roll" do
      other_roll = create(:roll)
      get "/api/rolls/#{other_roll.uuid}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/rolls" do
    let(:camera) { create(:camera, user: user) }
    let(:film) { create(:film, user: user) }

    it "creates a roll" do
      post "/api/rolls", params: {
        roll_number: "2601",
        camera_uuid: camera.uuid,
        film_uuid: film.uuid,
        loaded_at: 1.day.ago.iso8601
      }, headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["roll_number"]).to eq("2601")
      expect(json["uuid"]).to be_present
    end
  end

  describe "PATCH /api/rolls/:id" do
    let!(:roll) { create(:roll, user: user) }

    it "updates a roll" do
      patch "/api/rolls/#{roll.uuid}",
        params: {notes: "Updated notes", lab_name: "Film Lab"},
        headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["notes"]).to eq("Updated notes")
      expect(json["lab_name"]).to eq("Film Lab")
    end
  end

  describe "DELETE /api/rolls/:id" do
    let!(:roll) { create(:roll, user: user) }

    it "deletes a roll" do
      delete "/api/rolls/#{roll.uuid}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Roll.find_by(uuid: roll.uuid)).to be_nil
    end
  end

  describe "POST /api/rolls/bulk-update" do
    let!(:roll1) { create(:roll, user: user, roll_number: "2601") }
    let!(:roll2) { create(:roll, user: user, roll_number: "2602") }

    it "updates multiple rolls" do
      post "/api/rolls/bulk-update", params: {
        roll_numbers: ["2601", "2602"],
        field: "lab_name",
        value: "The Lab"
      }, headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["updated"]).to eq(2)
      expect(Roll.find_by(uuid: roll1.uuid).lab_name).to eq("The Lab")
    end

    it "rejects non-allowed fields" do
      post "/api/rolls/bulk-update", params: {
        roll_numbers: ["2601"],
        field: "user_id",
        value: "other_user"
      }, headers: headers

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
