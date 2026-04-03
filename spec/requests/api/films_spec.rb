require "rails_helper"

RSpec.describe "Films API", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/films" do
    let!(:film1) { create(:film, user: user) }
    let!(:other_film) { create(:film) }

    it "returns only current user films" do
      get "/api/films", headers: headers
      json = JSON.parse(response.body)
      slugs = json.map { |f| f["slug"] }
      expect(slugs).to include(film1.slug)
      expect(slugs).not_to include(other_film.slug)
    end
  end

  describe "POST /api/films" do
    it "creates a film" do
      post "/api/films", params: {
        brand: "Kodak",
        name: "Portra 400",
        iso: 400,
        color: true
      }, headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["slug"]).to eq("kodak-portra-400")
      expect(json["iso"]).to eq(400)
    end

    it "upserts by slug" do
      create(:film, user: user, slug: "kodak-portra-400", brand: "Kodak", name: "Portra 400")
      post "/api/films", params: {
        brand: "Kodak",
        name: "Portra 400",
        nickname: "My Fave"
      }, headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["nickname"]).to eq("My Fave")
      expect(Film.where(user: user, slug: "kodak-portra-400").count).to eq(1)
    end
  end

  describe "GET /api/films/:slug" do
    let!(:film) { create(:film, user: user) }

    it "returns the film" do
      get "/api/films/#{film.slug}", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["uuid"]).to eq(film.uuid)
    end
  end

  describe "PATCH /api/films/:slug" do
    let!(:film) { create(:film, user: user) }

    it "updates film" do
      patch "/api/films/#{film.slug}", params: {nickname: "Portra", iso: 400}, headers: headers
      json = JSON.parse(response.body)
      expect(json["nickname"]).to eq("Portra")
    end
  end

  describe "DELETE /api/films/:slug" do
    let!(:film) { create(:film, user: user) }

    it "deletes film" do
      delete "/api/films/#{film.slug}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Film.find_by(uuid: film.uuid)).to be_nil
    end
  end

  describe "POST /api/films/merge" do
    let!(:target) { create(:film, user: user) }
    let!(:source) { create(:film, user: user) }
    let!(:roll) { create(:roll, user: user, film: source) }

    it "reassigns rolls and deletes source films" do
      post "/api/films/merge", params: {
        target_id: target.uuid,
        source_ids: [source.uuid]
      }, headers: headers

      expect(response).to have_http_status(:ok)
      roll.reload
      expect(roll.film_uuid).to eq(target.uuid)
      expect(Film.find_by(uuid: source.uuid)).to be_nil
    end
  end
end
