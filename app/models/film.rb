require 'slugifier'

class Film < ApplicationRecord
  self.primary_key = 'uuid'

  belongs_to :user, foreign_key: :user_id, primary_key: :id
  has_many :rolls, foreign_key: :film_uuid, primary_key: :uuid

  validates :slug, presence: true, uniqueness: { scope: :user_id }
  validates :user_id, presence: true

  before_create :generate_uuid
  before_validation :generate_slug, if: -> { slug.blank? && (brand.present? || name.present?) }

  def display_name
    nickname.presence || [brand, name].compact.join(' ')
  end

  private

  def generate_uuid
    self.uuid ||= SecureRandom.uuid
  end

  def generate_slug
    self.slug = Slugifier.generate(brand.to_s, name.to_s)
  end
end
