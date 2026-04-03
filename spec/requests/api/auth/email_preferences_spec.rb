require "rails_helper"

RSpec.describe "Email Preferences", type: :request do
  let(:user) { create(:user, email_notifications: true) }
  let(:headers) { auth_headers(user) }

  describe "PATCH /api/auth/email-preferences" do
    it "disables email notifications" do
      patch "/api/auth/email-preferences", params: {email_notifications: false}, headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["email_notifications"]).to eq(false)
      expect(user.reload.email_notifications).to eq(false)
    end

    it "enables email notifications" do
      user.update!(email_notifications: false)
      patch "/api/auth/email-preferences", params: {email_notifications: true}, headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["email_notifications"]).to eq(true)
      expect(user.reload.email_notifications).to eq(true)
    end

    it "returns 401 without auth" do
      patch "/api/auth/email-preferences", params: {email_notifications: false}
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
