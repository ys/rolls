require "rails_helper"

RSpec.describe "Web::Admin::Dashboard", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:regular_user) { create(:user) }

  describe "GET /admin" do
    context "as admin" do
      it "returns 200" do
        get "/admin", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end

      it "shows stats" do
        create(:roll, user: admin)
        get "/admin", headers: auth_headers(admin)
        expect(response.body).to include("ADMIN")
      end
    end

    context "as regular user" do
      it "redirects to root" do
        get "/admin", headers: auth_headers(regular_user)
        expect(response).to redirect_to(root_path)
      end
    end

    context "when not logged in" do
      it "redirects to login" do
        get "/admin"
        expect(response).to redirect_to(login_path)
      end
    end
  end
end
