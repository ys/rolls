require 'digest'
require 'securerandom'

class ApiKeyService
  PREFIX = 'rk_'.freeze

  # Generate a new raw API key (not stored)
  def self.generate_raw_key
    "#{PREFIX}#{SecureRandom.hex(32)}"
  end

  # Hash a raw key for storage
  def self.hash_key(raw_key)
    Digest::SHA256.hexdigest(raw_key)
  end

  # Find an ApiKey record by the raw key
  def self.find_by_raw_key(raw_key)
    return nil if raw_key.blank?
    hashed = hash_key(raw_key)
    ApiKey.find_by(key_hash: hashed)
  end
end
