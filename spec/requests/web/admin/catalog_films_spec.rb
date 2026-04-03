require "rails_helper"

RSpec.describe "Web::Admin::CatalogFilms", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:regular_user) { create(:user) }

  describe "GET /admin/catalog_films" do
    let!(:film) { create(:catalog_film, brand: "Kodak", name: "Portra 400") }

    context "as admin" do
      it "returns 200" do
        get "/admin/catalog_films", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end

      it "lists catalog films" do
        get "/admin/catalog_films", headers: auth_headers(admin)
        expect(response.body).to include("Kodak")
      end
    end

    context "as regular user" do
      it "redirects to root" do
        get "/admin/catalog_films", headers: auth_headers(regular_user)
        expect(response).to redirect_to(root_path)
      end
    end

    context "when not logged in" do
      it "redirects to login" do
        get "/admin/catalog_films"
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /admin/catalog_films/new" do
    context "as admin" do
      it "returns 200" do
        get "/admin/catalog_films/new", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "POST /admin/catalog_films" do
    context "as admin" do
      it "creates a catalog film and redirects" do
        post "/admin/catalog_films", params: {
          catalog_film: {
            slug: "kodak-gold-200",
            brand: "Kodak",
            name: "Gold 200",
            iso: 200,
            color: true,
            slide: false
          }
        }, headers: auth_headers(admin)

        expect(response).to redirect_to(admin_catalog_films_path)
        expect(CatalogFilm.find_by(slug: "kodak-gold-200")).to be_present
      end

      it "renders new on invalid params" do
        post "/admin/catalog_films", params: {
          catalog_film: {slug: "", brand: "Kodak", name: "Gold 200"}
        }, headers: auth_headers(admin)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /admin/catalog_films/:id/edit" do
    let!(:film) { create(:catalog_film) }

    context "as admin" do
      it "returns 200" do
        get "/admin/catalog_films/#{film.slug}/edit", headers: auth_headers(admin)
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "PATCH /admin/catalog_films/:id" do
    let!(:film) { create(:catalog_film, brand: "Kodak", name: "Portra 400", iso: 400) }

    context "as admin" do
      it "updates and redirects" do
        patch "/admin/catalog_films/#{film.slug}", params: {
          catalog_film: {iso: 800}
        }, headers: auth_headers(admin)

        expect(response).to redirect_to(admin_catalog_films_path)
        expect(film.reload.iso).to eq(800)
      end

      it "renders edit on invalid params" do
        patch "/admin/catalog_films/#{film.slug}", params: {
          catalog_film: {slug: ""}
        }, headers: auth_headers(admin)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE /admin/catalog_films/:id" do
    let!(:film) { create(:catalog_film) }

    context "as admin" do
      it "destroys and redirects" do
        delete "/admin/catalog_films/#{film.slug}", headers: auth_headers(admin)

        expect(response).to redirect_to(admin_catalog_films_path)
        expect(CatalogFilm.find_by(slug: film.slug)).to be_nil
      end
    end
  end
end
