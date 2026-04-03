require "rails_helper"

RSpec.describe "GET /api/cache/timestamps", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  it "returns latest updated_at timestamps" do
    create(:camera, user: user)
    create(:film, user: user)
    create(:roll, user: user)

    get "/api/cache/timestamps", headers: headers
    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)
    expect(json).to have_key("rolls")
    expect(json).to have_key("cameras")
    expect(json).to have_key("films")
  end

  it "returns nulls when no data" do
    get "/api/cache/timestamps", headers: headers
    json = JSON.parse(response.body)
    expect(json["rolls"]).to be_nil
    expect(json["cameras"]).to be_nil
    expect(json["films"]).to be_nil
  end
end
