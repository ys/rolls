FactoryBot.define do
  factory :camera do
    uuid { SecureRandom.uuid }
    association :user
    brand { "Canon" }
    sequence(:model) { |n| "AE-1 #{n}" }
    sequence(:slug) { |n| "canon-ae-1-#{n}" }
    format { 135 }
    updated_at { Time.current }
  end
end
