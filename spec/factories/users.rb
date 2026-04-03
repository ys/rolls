FactoryBot.define do
  factory :user do
    id { SecureRandom.uuid }
    username { Faker::Internet.unique.username(specifier: 5..10) }
    name { Faker::Name.name }
    email { Faker::Internet.unique.email }
    email_notifications { true }
    role { "user" }
    invites_sent { 0 }
    created_at { Time.current }
  end

  trait :admin do
    role { "admin" }
  end
end
