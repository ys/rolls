module AuthHelpers
  def sign_in(user)
    token = JwtService.encode({userId: user.id})
    {"Authorization" => "Bearer #{token}"}
  end

  def auth_headers(user)
    sign_in(user)
  end

  def api_key_headers(user, label: "Test")
    raw = ApiKeyService.generate_raw_key
    hash = ApiKeyService.hash_key(raw)
    user.api_keys.create!(
      id: SecureRandom.uuid,
      key_hash: hash,
      label: label,
      created_at: Time.current
    )
    {"Authorization" => "Bearer #{raw}"}
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
