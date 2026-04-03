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
    existing_suffixes = user.rolls
      .where("roll_number ~ ?", "^#{year_prefix}[a-z]+$")
      .pluck(:roll_number)
      .map { |n| n.sub(year_prefix, "") }
    max_index = existing_suffixes.map { |s| letters_to_index(s) }.max || 0
    "#{year_prefix}#{index_to_letters(max_index + 1)}"
  end

  # Convert a 1-based index to a letter suffix (1→"a", 26→"z", 27→"aa", …)
  def self.index_to_letters(n)
    result = ""
    while n > 0
      n -= 1
      result.prepend(("a".ord + (n % 26)).chr)
      n /= 26
    end
    result
  end

  # Convert a letter suffix back to a 1-based index ("a"→1, "z"→26, "aa"→27, …)
  def self.letters_to_index(s)
    s.chars.reduce(0) { |acc, c| acc * 26 + (c.ord - "a".ord + 1) }
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
