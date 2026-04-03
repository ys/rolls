class Invite < ApplicationRecord
  self.primary_key = "id"

  belongs_to :creator, class_name: "User", foreign_key: :created_by, primary_key: :id, optional: true
  belongs_to :used_by_user, class_name: "User", foreign_key: :used_by, primary_key: :id, optional: true

  validates :code, presence: true, uniqueness: true

  before_validation :generate_id, on: :create
  before_validation :generate_code, on: :create

  scope :valid, -> { where("expires_at IS NULL OR expires_at > ?", Time.current).where("used_count < COALESCE(max_uses, 1)") }

  def valid_invite?
    (expires_at.nil? || expires_at > Time.current) &&
      used_count < (max_uses || 1)
  end

  def use!(user)
    increment!(:used_count)
    update!(used_by: user.id, used_at: Time.current)
  end

  private

  def generate_id
    self.id ||= SecureRandom.uuid
  end

  def generate_code
    self.code ||= SecureRandom.hex(8)
  end
end
