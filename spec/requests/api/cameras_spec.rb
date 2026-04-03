require 'rails_helper'

RSpec.describe 'Cameras API', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/cameras' do
    let!(:cam1) { create(:camera, user: user) }
    let!(:cam2) { create(:camera, user: user) }
    let!(:other_cam) { create(:camera) }

    it 'returns only current user cameras' do
      get '/api/cameras', headers: headers
      json = JSON.parse(response.body)
      slugs = json.map { |c| c['slug'] }
      expect(slugs).to include(cam1.slug, cam2.slug)
      expect(slugs).not_to include(other_cam.slug)
    end
  end

  describe 'POST /api/cameras' do
    it 'creates a camera' do
      post '/api/cameras', params: {
        brand: 'Canon',
        model: 'AE-1 Program',
        format: 135
      }, headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['slug']).to eq('canon-ae-1-program')
      expect(json['brand']).to eq('Canon')
    end

    it 'upserts existing camera by slug' do
      existing = create(:camera, user: user, slug: 'canon-ae-1-program', brand: 'Canon', model: 'AE-1 Program')
      post '/api/cameras', params: {
        brand: 'Canon',
        model: 'AE-1 Program',
        nickname: 'My Canon'
      }, headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['nickname']).to eq('My Canon')
      expect(Camera.where(user: user, slug: 'canon-ae-1-program').count).to eq(1)
    end
  end

  describe 'GET /api/cameras/:slug' do
    let!(:camera) { create(:camera, user: user) }

    it 'returns the camera' do
      get "/api/cameras/#{camera.slug}", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['uuid']).to eq(camera.uuid)
    end

    it 'returns 404 for unknown slug' do
      get '/api/cameras/nonexistent', headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH /api/cameras/:slug' do
    let!(:camera) { create(:camera, user: user) }

    it 'updates camera' do
      patch "/api/cameras/#{camera.slug}", params: { nickname: 'My Fave' }, headers: headers
      json = JSON.parse(response.body)
      expect(json['nickname']).to eq('My Fave')
    end
  end

  describe 'DELETE /api/cameras/:slug' do
    let!(:camera) { create(:camera, user: user) }

    it 'deletes camera' do
      delete "/api/cameras/#{camera.slug}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Camera.find_by(uuid: camera.uuid)).to be_nil
    end
  end

  describe 'POST /api/cameras/merge' do
    let!(:target) { create(:camera, user: user) }
    let!(:source) { create(:camera, user: user) }
    let!(:roll) { create(:roll, user: user, camera: source) }

    it 'reassigns rolls and deletes source cameras' do
      post '/api/cameras/merge', params: {
        target_id: target.uuid,
        source_ids: [source.uuid]
      }, headers: headers

      expect(response).to have_http_status(:ok)
      roll.reload
      expect(roll.camera_uuid).to eq(target.uuid)
      expect(Camera.find_by(uuid: source.uuid)).to be_nil
    end
  end
end
