FactoryBot.define do
  factory :invite do
    id { SecureRandom.uuid }
    association :creator, factory: :user
    code { SecureRandom.hex(8) }
    max_uses { 1 }
    used_count { 0 }
    created_at { Time.current }

    trait :expired do
      expires_at { 1.day.ago }
    end

    trait :used_up do
      used_count { 1 }
      max_uses { 1 }
    end
  end
end
