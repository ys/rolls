class WebauthnCredential < ApplicationRecord
  self.primary_key = "id"
  self.table_name = "webauthn_credentials"

  belongs_to :user, foreign_key: :user_id, primary_key: :id

  validates :credential_id, presence: true, uniqueness: true
  validates :public_key, presence: true
  validates :user_id, presence: true

  before_create :generate_id

  def touch_last_used!
    update_column(:last_used_at, Time.current)
  end

  private

  def generate_id
    self.id ||= SecureRandom.uuid
  end
end
