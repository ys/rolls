require 'babosa'

class Slugifier
  # Generate a slug from brand + model/name
  # e.g. "Canon", "AE-1 Program" => "canon-ae-1-program"
  def self.generate(brand, name)
    parts = [brand, name].compact.reject(&:empty?)
    return '' if parts.empty?

    combined = parts.join(' ')
    combined.to_slug.normalize(transliterations: :latin).to_s
  end
end
