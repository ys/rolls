require "rails_helper"

RSpec.describe Camera, type: :model do
  describe "associations" do
    it { should belong_to(:user).with_foreign_key(:user_id) }
    it { should have_many(:rolls).with_foreign_key(:camera_uuid) }
  end

  describe "validations" do
    subject { build(:camera) }
    # slug is auto-generated via before_validation, so we test user_id presence and uniqueness
    it { should validate_presence_of(:user_id) }
    it { should validate_uniqueness_of(:slug).scoped_to(:user_id) }

    it "requires slug (when brand and model are blank)" do
      camera = build(:camera, brand: "", model: "", slug: nil)
      expect(camera).not_to be_valid
      expect(camera.errors[:slug]).to be_present
    end
  end

  describe "slug generation" do
    let(:user) { create(:user) }

    it "generates slug from brand and model" do
      camera = build(:camera, user: user, brand: "Canon", model: "AE-1 Program", slug: nil)
      camera.valid?
      expect(camera.slug).to eq("canon-ae-1-program")
    end

    it "does not overwrite an existing slug" do
      camera = build(:camera, user: user, brand: "Canon", model: "AE-1", slug: "my-custom-slug")
      camera.valid?
      expect(camera.slug).to eq("my-custom-slug")
    end
  end

  describe "#display_name" do
    it "returns nickname when present" do
      camera = build(:camera, brand: "Canon", model: "AE-1", nickname: "My Fave")
      expect(camera.display_name).to eq("My Fave")
    end

    it "returns brand + model when no nickname" do
      camera = build(:camera, brand: "Canon", model: "AE-1", nickname: nil)
      expect(camera.display_name).to eq("Canon AE-1")
    end
  end
end
