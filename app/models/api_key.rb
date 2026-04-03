class ApiKey < ApplicationRecord
  self.primary_key = 'id'

  belongs_to :user, foreign_key: :user_id, primary_key: :id

  validates :key_hash, presence: true, uniqueness: true
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
