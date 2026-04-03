require "rails_helper"

RSpec.describe "WebAuthn", type: :request do
  def fake_creation_options(challenge: "test-challenge-register")
    double("creation_options",
      challenge: challenge,
      as_json: {"challenge" => challenge, "rp" => {"id" => "localhost"}},
      to_json: {"challenge" => challenge}.to_json)
  end

  def fake_get_options(challenge: "test-challenge-login")
    double("get_options",
      challenge: challenge,
      as_json: {"challenge" => challenge},
      to_json: {"challenge" => challenge}.to_json)
  end

  describe "POST /api/auth/webauthn/register-options" do
    it "returns options for a valid username" do
      allow(WebAuthn::Credential).to receive(:options_for_create).and_return(fake_creation_options)

      post "/api/auth/webauthn/register-options", params: {username: "alice"}
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json).to be_present
    end

    it "returns error when username is missing" do
      post "/api/auth/webauthn/register-options", params: {}
      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["error"]).to be_present
    end

    it "does not require auth" do
      allow(WebAuthn::Credential).to receive(:options_for_create).and_return(fake_creation_options)
      post "/api/auth/webauthn/register-options", params: {username: "alice"}
      expect(response).not_to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/auth/webauthn/register-verify" do
    context "when session is missing" do
      it "returns an error" do
        post "/api/auth/webauthn/register-verify", params: {}
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["error"]).to match(/session expired/i)
      end
    end

    context "when WebAuthn verification fails" do
      it "returns an error" do
        allow(WebAuthn::Credential).to receive(:options_for_create).and_return(fake_creation_options)
        post "/api/auth/webauthn/register-options", params: {username: "newuser"}

        credential_double = double("credential")
        allow(WebAuthn::Credential).to receive(:from_create).and_return(credential_double)
        allow(credential_double).to receive(:verify).and_raise(WebAuthn::Error, "Verification failed")

        post "/api/auth/webauthn/register-verify", params: {id: "cred", response: {}}
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["error"]).to be_present
      end
    end

    context "when verification succeeds for a new user" do
      let(:invite) { create(:invite) }

      it "creates user, credential, and returns token" do
        allow(WebAuthn::Credential).to receive(:options_for_create).and_return(fake_creation_options)
        post "/api/auth/webauthn/register-options", params: {
          username: "brandnewuser",
          invite_code: invite.code
        }

        credential_double = double(
          "credential",
          id: Base64.urlsafe_encode64("new-cred-id"),
          public_key: Base64.urlsafe_encode64("pub-key"),
          sign_count: 0,
          response: double(transports: ["internal"])
        )
        allow(WebAuthn::Credential).to receive(:from_create).and_return(credential_double)
        allow(credential_double).to receive(:verify)

        post "/api/auth/webauthn/register-verify", params: {id: credential_double.id, response: {}}

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to eq(true)
        expect(json["token"]).to be_present
        expect(json["user"]["username"]).to eq("brandnewuser")
      end
    end
  end

  describe "POST /api/auth/webauthn/login-options" do
    it "returns options without identifier (discoverable)" do
      allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)
      post "/api/auth/webauthn/login-options", params: {}
      expect(response).to have_http_status(:ok)
    end

    it "returns options for a known user identifier" do
      user = create(:user)
      create(:webauthn_credential, user: user)
      allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)

      post "/api/auth/webauthn/login-options", params: {identifier: user.username}
      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for unknown identifier" do
      post "/api/auth/webauthn/login-options", params: {identifier: "nobody"}
      expect(response).to have_http_status(:not_found)
    end

    it "does not require auth" do
      allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)
      post "/api/auth/webauthn/login-options", params: {}
      expect(response).not_to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/auth/webauthn/login-verify" do
    context "when session challenge is missing" do
      it "returns an error" do
        post "/api/auth/webauthn/login-verify", params: {}
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["error"]).to match(/session expired/i)
      end
    end

    context "when credential is not found" do
      it "returns an error" do
        allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)
        post "/api/auth/webauthn/login-options", params: {}

        credential_double = double("credential", id: "unknown-cred-id")
        allow(WebAuthn::Credential).to receive(:from_get).and_return(credential_double)

        post "/api/auth/webauthn/login-verify", params: {id: "unknown-cred-id", response: {}}
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["error"]).to be_present
      end
    end

    context "when verification succeeds" do
      it "returns token and user" do
        user = create(:user)
        stored_cred = create(:webauthn_credential, user: user)

        allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)
        post "/api/auth/webauthn/login-options", params: {}

        credential_double = double(
          "credential",
          id: stored_cred.credential_id,
          sign_count: 1
        )
        allow(WebAuthn::Credential).to receive(:from_get).and_return(credential_double)
        allow(credential_double).to receive(:verify)

        post "/api/auth/webauthn/login-verify", params: {id: stored_cred.credential_id, response: {}}

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["success"]).to eq(true)
        expect(json["token"]).to be_present
        expect(json["user"]["id"]).to eq(user.id)
      end
    end
  end

  describe "POST /api/auth/webauthn/autofill-options" do
    it "returns discoverable credential options" do
      allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)
      post "/api/auth/webauthn/autofill-options"
      expect(response).to have_http_status(:ok)
    end

    it "does not require auth" do
      allow(WebAuthn::Credential).to receive(:options_for_get).and_return(fake_get_options)
      post "/api/auth/webauthn/autofill-options"
      expect(response).not_to have_http_status(:unauthorized)
    end
  end
end
