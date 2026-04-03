require "rails_helper"

RSpec.describe "Credentials", type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "DELETE /api/auth/credentials/:id" do
    let!(:credential) { create(:webauthn_credential, user: user) }

    it "deletes the credential" do
      delete "/api/auth/credentials/#{credential.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(WebauthnCredential.find_by(id: credential.id)).to be_nil
    end

    it "returns 404 for another user's credential" do
      other_credential = create(:webauthn_credential)
      delete "/api/auth/credentials/#{other_credential.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 404 for a nonexistent credential" do
      delete "/api/auth/credentials/#{SecureRandom.uuid}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 without auth" do
      delete "/api/auth/credentials/#{credential.id}"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
