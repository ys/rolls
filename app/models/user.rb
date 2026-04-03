class User < ApplicationRecord
  self.primary_key = 'id'

  has_many :rolls, foreign_key: :user_id, primary_key: :id
  has_many :cameras, foreign_key: :user_id, primary_key: :id
  has_many :films, foreign_key: :user_id, primary_key: :id
  has_many :api_keys, foreign_key: :user_id, primary_key: :id
  has_many :webauthn_credentials, foreign_key: :user_id, primary_key: :id
  has_many :invites, foreign_key: :created_by, primary_key: :id

  validates :username, presence: true, uniqueness: { case_sensitive: false }
  validates :email, uniqueness: { allow_blank: true, case_sensitive: false }

  before_create :set_defaults
  before_create :generate_id

  def self.find_or_initialize_for_webauthn(username:)
    find_or_initialize_by(username: username.downcase.strip)
  end

  private

  def generate_id
    self.id ||= SecureRandom.uuid
  end

  def set_defaults
    self.email_notifications = true if email_notifications.nil?
    self.role ||= 'user'
    self.invites_sent ||= 0
  end
end
