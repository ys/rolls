FactoryBot.define do
  factory :roll do
    uuid { SecureRandom.uuid }
    association :user
    association :camera
    association :film
    sequence(:roll_number) { |n| "#{Time.current.year.to_s[-2..]}x#{n.to_s.rjust(2, "0")}" }
    created_at { Time.current }
    updated_at { Time.current }

    trait :loaded do
      loaded_at { 1.week.ago }
    end

    trait :in_fridge do
      loaded_at { 1.month.ago }
      fridge_at { 1.week.ago }
    end

    trait :at_lab do
      loaded_at { 2.months.ago }
      fridge_at { 1.month.ago }
      lab_at { 1.week.ago }
      lab_name { "The Lab" }
    end

    trait :scanned do
      loaded_at { 3.months.ago }
      lab_at { 2.months.ago }
      scanned_at { 1.month.ago }
    end

    trait :processed do
      loaded_at { 3.months.ago }
      lab_at { 2.months.ago }
      scanned_at { 1.month.ago }
      processed_at { 1.week.ago }
    end

    trait :uploaded do
      loaded_at { 3.months.ago }
      lab_at { 2.months.ago }
      scanned_at { 1.month.ago }
      processed_at { 2.weeks.ago }
      uploaded_at { 1.week.ago }
    end

    trait :archived do
      loaded_at { 6.months.ago }
      lab_at { 5.months.ago }
      scanned_at { 4.months.ago }
      processed_at { 3.months.ago }
      uploaded_at { 2.months.ago }
      archived_at { 1.month.ago }
    end
  end
end
