require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_many(:rolls).with_foreign_key(:user_id) }
    it { should have_many(:cameras).with_foreign_key(:user_id) }
    it { should have_many(:films).with_foreign_key(:user_id) }
    it { should have_many(:api_keys).with_foreign_key(:user_id) }
    it { should have_many(:webauthn_credentials).with_foreign_key(:user_id) }
    it { should have_many(:invites).with_foreign_key(:created_by) }
  end

  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:username) }
    it { should validate_uniqueness_of(:username).case_insensitive }
  end

  describe 'callbacks' do
    it 'generates an id before create' do
      user = build(:user, id: nil)
      user.save!
      expect(user.id).to be_present
    end

    it 'sets default email_notifications to true' do
      user = build(:user, email_notifications: nil)
      user.save!
      expect(user.email_notifications).to eq(true)
    end

    it 'sets default role to user' do
      user = build(:user, role: nil)
      user.save!
      expect(user.role).to eq('user')
    end
  end
end
