require "rails_helper"

RSpec.describe "Web::Admin::Users", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:regular_user) { create(:user) }

  describe "GET /admin/users" do
    let!(:user1) { create(:user, username: "alice") }
    let!(:user2) { create(:user, username: "bob") }

    context "as admin" do
      it "returns 200" do
        get "/admin/users", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end

      it "lists users" do
        get "/admin/users", headers: auth_headers(admin)
        expect(response.body).to include("alice")
        expect(response.body).to include("bob")
      end

      it "supports pagination via page param" do
        get "/admin/users?page=0", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end
    end

    context "as regular user" do
      it "redirects to root" do
        get "/admin/users", headers: auth_headers(regular_user)
        expect(response).to redirect_to(root_path)
      end
    end

    context "when not logged in" do
      it "redirects to login" do
        get "/admin/users"
        expect(response).to redirect_to(login_path)
      end
    end
  end
end
