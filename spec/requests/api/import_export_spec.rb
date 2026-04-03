require 'rails_helper'

RSpec.describe 'Import/Export API', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/export' do
    let!(:camera) { create(:camera, user: user) }
    let!(:film) { create(:film, user: user) }
    let!(:roll) { create(:roll, user: user, camera: camera, film: film) }

    it 'returns full user data' do
      get '/api/export', headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['cameras'].map { |c| c['uuid'] }).to include(camera.uuid)
      expect(json['films'].map { |f| f['uuid'] }).to include(film.uuid)
      expect(json['rolls'].map { |r| r['uuid'] }).to include(roll.uuid)
    end
  end

  describe 'POST /api/import' do
    it 'imports cameras, films, and rolls' do
      camera_uuid = SecureRandom.uuid
      film_uuid = SecureRandom.uuid
      roll_uuid = SecureRandom.uuid

      post '/api/import', params: {
        cameras: [{ uuid: camera_uuid, brand: 'Nikon', model: 'FM2', slug: 'nikon-fm2', format: 135 }],
        films: [{ uuid: film_uuid, brand: 'Fuji', name: 'Velvia 50', slug: 'fuji-velvia-50', iso: 50, color: true }],
        rolls: [{ uuid: roll_uuid, roll_number: '2699', camera_uuid: camera_uuid, film_uuid: film_uuid }]
      }, headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['imported']['cameras']).to eq(1)
      expect(json['imported']['films']).to eq(1)
      expect(json['imported']['rolls']).to eq(1)

      expect(Camera.find_by(uuid: camera_uuid)).to be_present
      expect(Film.find_by(uuid: film_uuid)).to be_present
      expect(Roll.find_by(uuid: roll_uuid)).to be_present
    end

    it 'upserts existing records' do
      camera = create(:camera, user: user)
      post '/api/import', params: {
        cameras: [{ uuid: camera.uuid, slug: camera.slug, brand: camera.brand, model: camera.model, nickname: 'Updated' }],
        films: [],
        rolls: []
      }, headers: headers

      expect(Camera.find_by(uuid: camera.uuid).nickname).to eq('Updated')
    end
  end
end
