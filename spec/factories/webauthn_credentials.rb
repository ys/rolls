FactoryBot.define do
  factory :webauthn_credential do
    id { SecureRandom.uuid }
    association :user
    sequence(:credential_id) { |n| Base64.urlsafe_encode64("credential_#{n}") }
    public_key { Base64.urlsafe_encode64("public_key_data") }
    counter { 0 }
    device_name { "iPhone" }
    created_at { Time.current }
  end
end
