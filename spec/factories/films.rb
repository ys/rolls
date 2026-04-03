FactoryBot.define do
  factory :film do
    uuid { SecureRandom.uuid }
    association :user
    brand { 'Kodak' }
    sequence(:name) { |n| "Portra #{n}" }
    sequence(:slug) { |n| "kodak-portra-#{n}" }
    iso { 400 }
    color { true }
    slide { false }
    updated_at { Time.current }
  end
end
