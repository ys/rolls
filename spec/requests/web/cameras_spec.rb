require "rails_helper"

RSpec.describe "Web::Cameras", type: :request do
  let(:user) { create(:user) }
  let(:camera) { create(:camera, user: user) }

  describe "GET /cameras" do
    context "when authenticated" do
      it "returns 200" do
        get cameras_path, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end

      it "shows the user's cameras" do
        camera
        get cameras_path, headers: auth_headers(user)
        expect(response.body).to include(camera.brand)
      end

      it "does not show other users' cameras" do
        other_user = create(:user)
        other_camera = create(:camera, user: other_user)
        get cameras_path, headers: auth_headers(user)
        expect(response.body).not_to include(other_camera.slug)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get cameras_path
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /cameras/new" do
    context "when authenticated" do
      it "returns 200" do
        get new_camera_path, headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get new_camera_path
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "POST /cameras" do
    let(:valid_params) do
      {
        camera: {
          brand: "Nikon",
          model: "FM2",
          nickname: "FM2",
          format: 135,
          slug: "nikon-fm2"
        }
      }
    end

    context "when authenticated" do
      it "creates a camera and redirects" do
        expect {
          post cameras_path, params: valid_params, headers: auth_headers(user)
        }.to change(Camera, :count).by(1)
        expect(response).to redirect_to(camera_path(Camera.last))
      end

      it "scopes camera to current user" do
        post cameras_path, params: valid_params, headers: auth_headers(user)
        expect(Camera.last.user).to eq(user)
      end

      it "renders new with unprocessable_entity on invalid params" do
        post cameras_path, params: {camera: {brand: "", model: ""}}, headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        post cameras_path, params: valid_params
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /cameras/:slug" do
    context "when authenticated" do
      it "returns 200" do
        get camera_path(camera), headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end

      it "shows the camera" do
        get camera_path(camera), headers: auth_headers(user)
        expect(response.body).to include(camera.brand)
      end

      it "redirects for another user's camera" do
        other_user = create(:user)
        other_camera = create(:camera, user: other_user)
        get camera_path(other_camera), headers: auth_headers(user)
        expect(response).to redirect_to(cameras_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get camera_path(camera)
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "GET /cameras/:slug/edit" do
    context "when authenticated" do
      it "returns 200" do
        get edit_camera_path(camera), headers: auth_headers(user)
        expect(response).to have_http_status(:ok)
      end

      it "redirects for another user's camera" do
        other_user = create(:user)
        other_camera = create(:camera, user: other_user)
        get edit_camera_path(other_camera), headers: auth_headers(user)
        expect(response).to redirect_to(cameras_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        get edit_camera_path(camera)
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "PATCH /cameras/:slug" do
    let(:update_params) { {camera: {nickname: "My FM2"}} }

    context "when authenticated" do
      it "updates the camera and redirects" do
        patch camera_path(camera), params: update_params, headers: auth_headers(user)
        expect(response).to redirect_to(camera_path(camera))
        expect(camera.reload.nickname).to eq("My FM2")
      end

      it "cannot update another user's camera" do
        other_user = create(:user)
        other_camera = create(:camera, user: other_user)
        patch camera_path(other_camera), params: update_params, headers: auth_headers(user)
        expect(response).to redirect_to(cameras_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        patch camera_path(camera), params: update_params
        expect(response).to redirect_to(login_path)
      end
    end
  end

  describe "DELETE /cameras/:slug" do
    context "when authenticated" do
      it "deletes the camera and redirects to cameras" do
        camera_to_delete = create(:camera, user: user)
        expect {
          delete camera_path(camera_to_delete), headers: auth_headers(user)
        }.to change(Camera, :count).by(-1)
        expect(response).to redirect_to(cameras_path)
      end

      it "cannot delete another user's camera" do
        other_user = create(:user)
        other_camera = create(:camera, user: other_user)
        expect {
          delete camera_path(other_camera), headers: auth_headers(user)
        }.not_to change(Camera, :count)
        expect(response).to redirect_to(cameras_path)
      end
    end

    context "when not authenticated" do
      it "redirects to login" do
        delete camera_path(camera)
        expect(response).to redirect_to(login_path)
      end
    end
  end
end
