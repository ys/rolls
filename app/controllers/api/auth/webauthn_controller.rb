module Api
  module Auth
    class WebauthnController < BaseController
      # Register options
      def register_options
        username = params[:username]&.downcase&.strip
        return render_error("Username required") if username.blank?

        user = User.find_or_initialize_by(username: username)

        options = WebAuthn::Credential.options_for_create(
          user: {
            id: user.persisted? ? user.id : SecureRandom.uuid,
            name: username,
            display_name: user.name.presence || username
          },
          exclude: user.persisted? ? user.webauthn_credentials.pluck(:credential_id) : []
        )

        session[:webauthn_register_challenge] = options.challenge
        session[:webauthn_register_username] = username
        session[:webauthn_invite_code] = params[:invite_code] if params[:invite_code].present?
        session[:webauthn_register_email] = params[:email] if params[:email].present?

        options_hash = options.as_json
        render json: options_hash.merge(options: options_hash, challenge: options.challenge)
      end

      # Register verify
      def register_verify
        username = session[:webauthn_register_username]
        challenge = session[:webauthn_register_challenge]

        return render_error("Session expired") if username.blank? || challenge.blank?

        begin
          cred_params = params[:id].present? ? params : params.require(:response)
          credential = WebAuthn::Credential.from_create(cred_params)
          credential.verify(challenge)

          user = User.find_or_initialize_by(username: username)
          unless user.persisted?
            user.id = SecureRandom.uuid
            user.email = session[:webauthn_register_email]
            user.created_at = Time.current

            invite_code = session[:webauthn_invite_code]
            if invite_code.present?
              invite = Invite.find_by(code: invite_code)
              return render_error("Invalid invite code") unless invite&.valid_invite?
            end

            user.save!
            invite&.use!(user)
          end

          user.webauthn_credentials.create!(
            id: SecureRandom.uuid,
            credential_id: credential.id,
            public_key: credential.public_key,
            counter: credential.sign_count,
            transports: credential.response.transports,
            created_at: Time.current
          )

          token = set_session_cookie!(user)
          session.delete(:webauthn_register_challenge)
          session.delete(:webauthn_register_username)

          render json: {
            verified: true,
            user: serialize_user(user),
            token: token
          }
        rescue WebAuthn::Error => e
          render_error(e.message)
        end
      end

      # Login options
      def login_options
        identifier = params[:identifier]&.downcase&.strip

        if identifier.present?
          user = User.find_by(username: identifier) || User.find_by(email: identifier)
          return render_error("User not found", status: :not_found) unless user

          options = WebAuthn::Credential.options_for_get(
            allow: user.webauthn_credentials.pluck(:credential_id)
          )
        else
          options = WebAuthn::Credential.options_for_get
        end

        session[:webauthn_login_challenge] = options.challenge
        options_hash = options.as_json
        render json: options_hash.merge(options: options_hash, challenge: options.challenge, user_id: user&.id)
      end

      # Login verify
      def login_verify
        challenge = session[:webauthn_login_challenge]
        return render_error("Session expired") if challenge.blank?

        begin
          cred_params = params[:id].present? ? params : params.require(:response)
          credential = WebAuthn::Credential.from_get(cred_params)

          stored_cred = WebauthnCredential.find_by(credential_id: credential.id)
          return render_error("Credential not found") unless stored_cred

          credential.verify(
            challenge,
            public_key: stored_cred.public_key,
            sign_count: stored_cred.counter
          )

          stored_cred.update!(
            counter: credential.sign_count,
            last_used_at: Time.current
          )

          user = stored_cred.user
          token = set_session_cookie!(user)
          session.delete(:webauthn_login_challenge)

          render json: {
            success: true,
            user: serialize_user(user),
            token: token
          }
        rescue WebAuthn::Error => e
          render_error(e.message)
        end
      end

      # Autofill (discoverable credentials)
      def autofill_options
        options = WebAuthn::Credential.options_for_get
        session[:webauthn_login_challenge] = options.challenge
        options_hash = options.as_json
        render json: options_hash.merge(options: options_hash, challenge: options.challenge)
      end
    end
  end
end
