module Api
  module Auth
    class SessionsController < BaseController
      before_action :require_api_auth!, only: [:me, :logout]

      def me
        render json: {
          user: serialize_user(current_user),
          credentials: current_user.webauthn_credentials.map { |c| serialize_credential(c) }
        }
      end

      def logout
        cookies.delete(:session)
        render json: {success: true}
      end

      def bootstrap
        render json: {needsInvite: false}
      end

      def check_username
        username = params[:username]&.downcase&.strip
        invite_code = params[:invite_code]

        if username.blank?
          return render json: {available: false}
        end

        available = !User.exists?(username: username)

        # If invite is required (no users exist or system requires invites) and code provided, validate it
        if invite_code.present?
          invite = Invite.find_by(code: invite_code)
          if invite.nil? || !invite.valid_invite?
            return render json: {available: false, error: "Invalid invite code"}
          end
        end

        render json: {available: available}
      end
    end
  end
end
