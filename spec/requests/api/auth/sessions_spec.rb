require 'rails_helper'

RSpec.describe 'GET /api/auth/me', type: :request do
  let(:user) { create(:user) }

  context 'with valid JWT auth' do
    it 'returns current user and credentials' do
      get '/api/auth/me', headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['user']['id']).to eq(user.id)
      expect(json['user']['username']).to eq(user.username)
      expect(json['credentials']).to be_an(Array)
    end
  end

  context 'with API key auth' do
    it 'returns current user' do
      headers = api_key_headers(user)
      get '/api/auth/me', headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['user']['id']).to eq(user.id)
    end
  end

  context 'without auth' do
    it 'returns 401' do
      get '/api/auth/me'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

RSpec.describe 'GET /api/auth/bootstrap', type: :request do
  context 'when no users exist' do
    it 'returns needsInvite true' do
      User.delete_all
      get '/api/auth/bootstrap'
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['needsInvite']).to eq(true)
    end
  end

  context 'when users exist' do
    it 'returns needsInvite false' do
      create(:user)
      get '/api/auth/bootstrap'
      json = JSON.parse(response.body)
      expect(json['needsInvite']).to eq(false)
    end
  end
end

RSpec.describe 'POST /api/auth/check-username', type: :request do
  let!(:user) { create(:user, username: 'taken') }

  it 'returns available false for taken username' do
    post '/api/auth/check-username', params: { username: 'taken' }
    json = JSON.parse(response.body)
    expect(json['available']).to eq(false)
  end

  it 'returns available true for free username' do
    post '/api/auth/check-username', params: { username: 'freename99' }
    json = JSON.parse(response.body)
    expect(json['available']).to eq(true)
  end
end

RSpec.describe 'POST /api/auth/logout', type: :request do
  let(:user) { create(:user) }

  it 'returns success' do
    post '/api/auth/logout', headers: auth_headers(user)
    expect(response).to have_http_status(:ok)
  end
end
