require "rails_helper"

RSpec.describe "Web::Films", type: :request do
  let(:user) { create(:user) }
  let(:film) { create(:film, user: user) }

  describe "GET /films" do
    context "when authenticated" do
      it "returns 200" do
        get films_path, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end

      it "shows the user's films" do
        film
        get films_path, headers: auth_headers(user)
        expect(response.body).to include(film.brand)
      end

      it "does not show other users' films" do
        other_user = create(:user)
        other_film = create(:film, user: other_user)
        get films_path, headers: auth_headers(user)
        expect(response.body).not_to include(other_film.slug)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get films_path
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /films/new" do
    context "when authenticated" do
      it "returns 200" do
        get new_film_path, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get new_film_path
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "POST /films" do
    let(:valid_params) do
      {
        film: {
          brand: "Fuji",
          name: "Superia 400",
          slug: "fuji-superia-400",
          iso: 400,
          color: true,
          slide: false
        }
      }
    end

    context "when authenticated" do
      it "creates a film and redirects" do
        expect {
          post films_path, params: valid_params, headers: auth_headers(user)
        }.to change(Film, :count).by(1)
        expect(response).to redirect_to(film_path(Film.last))
      end

      it "scopes film to current user" do
        post films_path, params: valid_params, headers: auth_headers(user)
        expect(Film.last.user).to eq(user)
      end

      it "renders new with unprocessable_entity on invalid params" do
        post films_path, params: {film: {brand: "", name: ""}}, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        post films_path, params: valid_params
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /films/:slug" do
    context "when authenticated" do
      it "returns 200" do
        get film_path(film), headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end

      it "shows the film" do
        get film_path(film), headers: auth_headers(user)
        expect(response.body).to include(film.brand)
      end

      it "redirects for another user's film" do
        other_user = create(:user)
        other_film = create(:film, user: other_user)
        get film_path(other_film), headers: auth_headers(user)
        expect(response).to redirect_to(films_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get film_path(film)
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /films/:slug/edit" do
    context "when authenticated" do
      it "returns 200" do
        get edit_film_path(film), headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end

      it "redirects for another user's film" do
        other_user = create(:user)
        other_film = create(:film, user: other_user)
        get edit_film_path(other_film), headers: auth_headers(user)
        expect(response).to redirect_to(films_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get edit_film_path(film)
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "PATCH /films/:slug" do
    let(:update_params) { {film: {nickname: "Superia"}} }

    context "when authenticated" do
      it "updates the film and redirects" do
        patch film_path(film), params: update_params, headers: auth_headers(user)
        expect(response).to redirect_to(film_path(film))
        expect(film.reload.nickname).to eq("Superia")
      end

      it "cannot update another user's film" do
        other_user = create(:user)
        other_film = create(:film, user: other_user)
        patch film_path(other_film), params: update_params, headers: auth_headers(user)
        expect(response).to redirect_to(films_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        patch film_path(film), params: update_params
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "DELETE /films/:slug" do
    context "when authenticated" do
      it "deletes the film and redirects to films" do
        film_to_delete = create(:film, user: user)
        expect {
          delete film_path(film_to_delete), headers: auth_headers(user)
        }.to change(Film, :count).by(-1)
        expect(response).to redirect_to(films_path)
      end

      it "cannot delete another user's film" do
        other_user = create(:user)
        other_film = create(:film, user: other_user)
        expect {
          delete film_path(other_film), headers: auth_headers(user)
        }.not_to change(Film, :count)
        expect(response).to redirect_to(films_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        delete film_path(film)
        expect(response).to redirect_to(login_path)
      end
    end
  end
end
