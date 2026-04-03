require 'rails_helper'

RSpec.describe 'API Keys', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/auth/api-keys' do
    let!(:key1) { create(:api_key, user: user, label: 'Key 1') }
    let!(:key2) { create(:api_key, user: user, label: 'Key 2') }

    it 'returns all user api keys' do
      get '/api/auth/api-keys', headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      labels = json.map { |k| k['label'] }
      expect(labels).to include('Key 1', 'Key 2')
    end

    it 'does not expose key_hash' do
      get '/api/auth/api-keys', headers: headers
      json = JSON.parse(response.body)
      json.each { |k| expect(k).not_to have_key('key_hash') }
    end
  end

  describe 'POST /api/auth/api-keys' do
    it 'creates a new api key and returns raw_key' do
      post '/api/auth/api-keys', params: { label: 'My App' }, headers: headers
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['raw_key']).to start_with('rk_')
      expect(json['api_key']['label']).to eq('My App')
    end
  end

  describe 'DELETE /api/auth/api-keys/:id' do
    let!(:key) { create(:api_key, user: user) }

    it 'revokes the api key' do
      delete "/api/auth/api-keys/#{key.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(ApiKey.find_by(id: key.id)).to be_nil
    end

    it 'cannot delete another user key' do
      other_key = create(:api_key)
      delete "/api/auth/api-keys/#{other_key.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
