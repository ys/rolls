require "rails_helper"

RSpec.describe "Invites", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /api/auth/invites" do
    let!(:own_invite) { create(:invite, creator: user) }
    let!(:other_invite) { create(:invite) }

    it "returns invites created by the current user" do
      get "/api/auth/invites", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      ids = json.map { |i| i["id"] }
      expect(ids).to include(own_invite.id)
      expect(ids).not_to include(other_invite.id)
    end

    it "includes expected invite fields" do
      get "/api/auth/invites", headers: headers
      json = JSON.parse(response.body)
      invite_json = json.find { |i| i["id"] == own_invite.id }
      expect(invite_json).to have_key("code")
      expect(invite_json).to have_key("max_uses")
      expect(invite_json).to have_key("used_count")
    end

    it "returns 401 without auth" do
      get "/api/auth/invites"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/auth/invites" do
    it "creates an invite with defaults" do
      post "/api/auth/invites", headers: headers
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["id"]).to be_present
      expect(json["code"]).to be_present
    end

    it "creates an invite with custom max_uses" do
      post "/api/auth/invites", params: {max_uses: 5}, headers: headers
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["max_uses"]).to eq(5)
    end

    it "creates an invite with custom expires_at" do
      expires = 7.days.from_now.iso8601
      post "/api/auth/invites", params: {expires_at: expires}, headers: headers
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["expires_at"]).to be_present
    end

    it "returns 401 without auth" do
      post "/api/auth/invites"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/auth/invites/:id" do
    let!(:invite) { create(:invite, creator: user) }

    it "destroys the invite" do
      delete "/api/auth/invites/#{invite.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Invite.find_by(id: invite.id)).to be_nil
    end

    it "returns 404 for another user's invite" do
      other_invite = create(:invite)
      delete "/api/auth/invites/#{other_invite.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without auth" do
      delete "/api/auth/invites/#{invite.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/auth/invites/validate" do
    it "returns valid true for a valid invite" do
      invite = create(:invite)
      get "/api/auth/invites/validate", params: {code: invite.code}
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["valid"]).to eq(true)
    end

    it "returns valid false for an unknown code" do
      get "/api/auth/invites/validate", params: {code: "nonexistent"}
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["valid"]).to eq(false)
      expect(json["error"]).to be_present
    end

    it "returns valid false for an expired invite" do
      invite = create(:invite, :expired)
      get "/api/auth/invites/validate", params: {code: invite.code}
      json = JSON.parse(response.body)
      expect(json["valid"]).to eq(false)
      expect(json["error"]).to match(/expired/i)
    end

    it "returns valid false for a fully used invite" do
      invite = create(:invite, :used_up)
      get "/api/auth/invites/validate", params: {code: invite.code}
      json = JSON.parse(response.body)
      expect(json["valid"]).to eq(false)
    end

    it "does not require auth" do
      invite = create(:invite)
      get "/api/auth/invites/validate", params: {code: invite.code}
      expect(response).not_to have_http_status(:unauthorized)
    end
  end
end
