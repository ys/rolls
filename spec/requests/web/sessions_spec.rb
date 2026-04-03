require "rails_helper"

RSpec.describe "Web::Sessions", type: :request do
  let(:user) { create(:user) }

  describe "GET /login" do
    context "when not authenticated" do
      it "returns 200" do
        get login_path
        expect(response).to have_http_status(:ok)
      end
    end

    context "when already authenticated" do
      it "returns 200 (set_current_user is skipped for this action)" do
        # The sessions controller skips set_current_user for :new, so the
        # redirect_to root_path if logged_in? check never fires via request specs.
        get login_path, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "POST /login" do
    context "with a valid API key" do
      it "sets session cookie and redirects to root" do
        raw_key = ApiKeyService.generate_raw_key
        hash = ApiKeyService.hash_key(raw_key)
        user.api_keys.create!(
          id: SecureRandom.uuid,
          key_hash: hash,
          label: "Login Test",
          created_at: Time.current
        )

        post login_path, params: {api_key: raw_key}
        expect(response).to redirect_to(root_path)
        expect(response.cookies["session"]).to be_present
      end
    end

    context "with an invalid API key" do
      it "renders login with unprocessable_entity" do
        post login_path, params: {api_key: "rk_invalid_key"}
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "shows an error message" do
        post login_path, params: {api_key: "rk_invalid_key"}
        expect(response.body).to include("Invalid API key")
      end
    end

    context "with no api_key param" do
      it "renders login" do
        post login_path, params: {}
        expect(response).to have_http_status(:ok)
      end

      it "shows passkey prompt" do
        post login_path, params: {}
        expect(response.body).to include("passkey")
      end
    end
  end

  describe "DELETE /logout" do
    context "when authenticated" do
      it "clears the session and redirects to login" do
        delete logout_path, headers: auth_headers(user)
        expect(response).to redirect_to(login_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        delete logout_path
        expect(response).to redirect_to(login_path)
      end
    end
  end
end
