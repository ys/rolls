require "rails_helper"

RSpec.describe Roll, type: :model do
  describe "associations" do
    it { should belong_to(:user).with_foreign_key(:user_id) }
    it { should belong_to(:camera).with_foreign_key(:camera_uuid).optional }
    it { should belong_to(:film).with_foreign_key(:film_uuid).optional }
  end

  describe "validations" do
    subject { build(:roll) }
    it { should validate_presence_of(:user_id) }
  end

  describe "scopes" do
    let(:user) { create(:user) }
    let!(:active_roll) { create(:roll, user: user) }
    let!(:archived_roll) { create(:roll, :archived, user: user) }

    it "returns only active rolls" do
      expect(Roll.active).to include(active_roll)
      expect(Roll.active).not_to include(archived_roll)
    end

    it "returns only archived rolls" do
      expect(Roll.archived).to include(archived_roll)
      expect(Roll.archived).not_to include(active_roll)
    end
  end

  describe "#status" do
    let(:roll) { build(:roll) }

    it "returns loaded when no timestamps set" do
      expect(roll.status).to eq("loaded")
    end

    it "returns loaded when only loaded_at is set" do
      roll.loaded_at = 1.week.ago
      expect(roll.status).to eq("loaded")
    end

    it "returns fridge when fridge_at is set" do
      roll.loaded_at = 1.month.ago
      roll.fridge_at = 1.week.ago
      expect(roll.status).to eq("fridge")
    end

    it "returns lab when lab_at is set" do
      roll.loaded_at = 2.months.ago
      roll.fridge_at = 1.month.ago
      roll.lab_at = 1.week.ago
      expect(roll.status).to eq("lab")
    end

    it "returns scanned when scanned_at is set" do
      roll.loaded_at = 3.months.ago
      roll.lab_at = 2.months.ago
      roll.scanned_at = 1.month.ago
      expect(roll.status).to eq("scanned")
    end

    it "returns processed when processed_at is set" do
      roll.loaded_at = 3.months.ago
      roll.scanned_at = 2.months.ago
      roll.processed_at = 1.week.ago
      expect(roll.status).to eq("processed")
    end

    it "returns uploaded when uploaded_at is set" do
      roll.loaded_at = 3.months.ago
      roll.processed_at = 2.weeks.ago
      roll.uploaded_at = 1.week.ago
      expect(roll.status).to eq("uploaded")
    end

    it "returns archived when archived_at is set" do
      roll.archived_at = 1.month.ago
      expect(roll.status).to eq("archived")
    end

    it "archived takes priority over uploaded" do
      roll.uploaded_at = 1.week.ago
      roll.archived_at = 1.day.ago
      expect(roll.status).to eq("archived")
    end
  end

  describe "#archived?" do
    it "returns true when archived_at is set" do
      roll = build(:roll, :archived)
      expect(roll.archived?).to be true
    end

    it "returns false when archived_at is nil" do
      roll = build(:roll)
      expect(roll.archived?).to be false
    end
  end
end
