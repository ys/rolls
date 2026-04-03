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
        render json: { success: true }
      end

      def bootstrap
        render json: { needsInvite: User.count.zero? }
      end

      def check_username
        username = params[:username]&.downcase&.strip
        invite_code = params[:invite_code]

        if username.blank?
          return render json: { available: false }
        end

        available = !User.exists?(username: username)

        # If invite is required (no users exist or system requires invites) and code provided, validate it
        if invite_code.present?
          invite = Invite.find_by(code: invite_code)
          if invite.nil? || !invite.valid_invite?
            return render json: { available: false, error: 'Invalid invite code' }
          end
        end

        render json: { available: available }
      end

      private

      def require_api_auth!
        unless logged_in?
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end

      def serialize_user(user)
        {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          email_notifications: user.email_notifications,
          role: user.role,
          invite_quota: user.invite_quota,
          invites_sent: user.invites_sent,
          created_at: user.created_at,
          last_seen_at: user.last_seen_at,
          apple_user_id: user.apple_user_id
        }
      end

      def serialize_credential(cred)
        {
          id: cred.id,
          credential_id: cred.credential_id,
          device_name: cred.device_name,
          created_at: cred.created_at,
          last_used_at: cred.last_used_at,
          transports: cred.transports
        }
      end
    end
  end
end
