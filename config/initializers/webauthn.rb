WebAuthn.configure do |config|
  config.allowed_origins = ENV.fetch("WEBAUTHN_ORIGIN", "https://rolls.yannick.computer").split(",").map(&:strip)
  config.rp_name = ENV.fetch("WEBAUTHN_RP_NAME", "Rolls")
  config.rp_id = ENV.fetch("WEBAUTHN_RP_ID", "rolls.yannick.computer")
end
