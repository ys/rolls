FactoryBot.define do
  factory :catalog_film do
    sequence(:slug) { |n| "kodak-portra-#{n}" }
    brand { 'Kodak' }
    sequence(:name) { |n| "Portra #{n}" }
    iso { 400 }
    color { true }
    slide { false }
  end
end
