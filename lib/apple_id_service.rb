require 'jwt'
require 'net/http'
require 'json'

# Verifies Apple Sign In identity tokens (JWTs signed by Apple).
# Fetches Apple's JWKS, verifies the token, and returns the sub (apple_user_id).
class AppleIdService
  APPLE_JWKS_URI = "https://appleid.apple.com/auth/keys".freeze
  APPLE_ISSUER   = "https://appleid.apple.com".freeze

  class InvalidToken < StandardError; end

  def self.verify(identity_token)
    new.verify(identity_token)
  end

  def verify(identity_token)
    header = decode_header(identity_token)
    key    = find_key(header["kid"])

    payload, _ = JWT.decode(
      identity_token,
      key,
      true,
      algorithms: [header["alg"] || "RS256"],
      iss: APPLE_ISSUER,
      verify_iss: true
    )

    payload
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::InvalidIssuerError => e
    raise InvalidToken, e.message
  end

  private

  def decode_header(token)
    # JWT header is the first segment, base64url-encoded JSON
    header_b64 = token.split(".").first
    JSON.parse(Base64.urlsafe_decode64(header_b64 + "=="))
  rescue
    raise InvalidToken, "Malformed token"
  end

  def find_key(kid)
    jwks.find { |k| k["kid"] == kid }.tap do |key_data|
      raise InvalidToken, "Key not found for kid: #{kid}" unless key_data
    end.then { |key_data| JWT::JWK.import(key_data).public_key }
  end

  def jwks
    @jwks ||= fetch_jwks
  end

  def fetch_jwks
    uri  = URI(APPLE_JWKS_URI)
    resp = Net::HTTP.get_response(uri)
    raise InvalidToken, "Failed to fetch Apple JWKS" unless resp.is_a?(Net::HTTPSuccess)
    JSON.parse(resp.body)["keys"]
  rescue => e
    raise InvalidToken, "JWKS fetch error: #{e.message}"
  end
end
