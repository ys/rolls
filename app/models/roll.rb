class Roll < ApplicationRecord
  self.primary_key = "uuid"

  belongs_to :user, foreign_key: :user_id, primary_key: :id
  belongs_to :camera, foreign_key: :camera_uuid, primary_key: :uuid, optional: true
  belongs_to :film, foreign_key: :film_uuid, primary_key: :uuid, optional: true

  validates :user_id, presence: true
  validates :roll_number, uniqueness: {scope: :user_id}, allow_blank: true

  before_create :generate_uuid

  # Tags stored as Postgres text array
  attribute :tags, :string, array: true, default: []

  scope :active, -> { where(archived_at: nil) }
  scope :archived, -> { where.not(archived_at: nil) }
  scope :by_roll_number, -> { order(roll_number: :desc) }

  def self.next_number_for(user)
    year_prefix = Time.current.year.to_s[-2..]
    existing = user.rolls
      .where("roll_number LIKE ?", "#{year_prefix}%")
      .pluck(:roll_number)
      .map { |n| n.sub(year_prefix, "").to_i }
      .max || 0
    "#{year_prefix}#{(existing + 1).to_s.rjust(2, "0")}"
  end

  # Status logic (priority order)
  def status
    if archived_at.present?
      "archived"
    elsif uploaded_at.present?
      "uploaded"
    elsif processed_at.present?
      "processed"
    elsif scanned_at.present?
      "scanned"
    elsif lab_at.present?
      "lab"
    elsif fridge_at.present?
      "fridge"
    else
      "loaded"
    end
  end

  def archived?
    archived_at.present?
  end

  private

  def generate_uuid
    self.uuid ||= SecureRandom.uuid
  end
end
