class CatalogFilm < ApplicationRecord
  self.primary_key = 'slug'

  validates :slug, presence: true, uniqueness: true

  def display_name
    nickname.presence || [brand, name].compact.join(' ')
  end
end
