require "rails_helper"

RSpec.describe Film, type: :model do
  describe "associations" do
    it { should belong_to(:user).with_foreign_key(:user_id) }
    it { should have_many(:rolls).with_foreign_key(:film_uuid) }
  end

  describe "validations" do
    subject { build(:film) }
    # slug is auto-generated via before_validation
    it { should validate_presence_of(:user_id) }
    it { should validate_uniqueness_of(:slug).scoped_to(:user_id) }

    it "requires slug (when brand and name are blank)" do
      film = build(:film, brand: "", name: "", slug: nil)
      expect(film).not_to be_valid
      expect(film.errors[:slug]).to be_present
    end
  end

  describe "slug generation" do
    let(:user) { create(:user) }

    it "generates slug from brand and name" do
      film = build(:film, user: user, brand: "Kodak", name: "Portra 400", slug: nil)
      film.valid?
      expect(film.slug).to eq("kodak-portra-400")
    end
  end

  describe "#display_name" do
    it "returns nickname when present" do
      film = build(:film, brand: "Kodak", name: "Portra 400", nickname: "My Go-To")
      expect(film.display_name).to eq("My Go-To")
    end

    it "returns brand + name when no nickname" do
      film = build(:film, brand: "Kodak", name: "Portra 400", nickname: nil)
      expect(film.display_name).to eq("Kodak Portra 400")
    end
  end
end
