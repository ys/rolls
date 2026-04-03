FactoryBot.define do
  factory :api_key do
    id { SecureRandom.uuid }
    association :user
    sequence(:key_hash) { |n| Digest::SHA256.hexdigest("rk_test_key_#{n}") }
    label { "Test Key" }
    created_at { Time.current }
  end
end
