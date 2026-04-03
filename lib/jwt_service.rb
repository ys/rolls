require 'jwt'

class JwtService
  ALGORITHM = 'HS256'.freeze
  EXPIRY = 1.year

  def self.secret
    ENV.fetch('JWT_SECRET') { raise 'JWT_SECRET not set' }
  end

  def self.encode(payload)
    payload = payload.merge(exp: EXPIRY.from_now.to_i)
    JWT.encode(payload, secret, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, secret, true, algorithm: ALGORITHM)
    decoded.first.with_indifferent_access
  rescue JWT::ExpiredSignature
    raise JwtService::ExpiredToken
  rescue JWT::DecodeError
    raise JwtService::InvalidToken
  end

  class ExpiredToken < StandardError; end
  class InvalidToken < StandardError; end
end
