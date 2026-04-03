require 'rails_helper'

RSpec.describe 'GET /api/catalog/films', type: :request do
  let!(:film1) { create(:catalog_film, brand: 'Kodak', name: 'Portra 400') }
  let!(:film2) { create(:catalog_film, brand: 'Fujifilm', name: 'Superia 400') }

  it 'returns all catalog films without auth' do
    get '/api/catalog/films'
    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)
    brands = json.map { |f| f['brand'] }
    expect(brands).to include('Kodak', 'Fujifilm')
  end

  it 'includes expected fields' do
    get '/api/catalog/films'
    json = JSON.parse(response.body)
    film = json.first
    expect(film).to have_key('slug')
    expect(film).to have_key('brand')
    expect(film).to have_key('name')
    expect(film).to have_key('iso')
  end
end
