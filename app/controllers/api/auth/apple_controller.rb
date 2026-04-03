module Api
  module Auth
    class AppleController < BaseController
      before_action :require_auth!, only: [:link, :unlink]

      # POST /api/auth/apple
      # Body: { identity_token, full_name?, username?, invite_code? }
      def create
        identity_token = params[:identity_token]
        return render_error("identity_token required") if identity_token.blank?

        payload = AppleIdService.verify(identity_token)
        apple_user_id = payload["sub"]
        email = payload["email"]

        user = User.find_by(apple_user_id: apple_user_id)
        user ||= User.find_by(email: email) if email.present?

        if user
          user.update_column(:apple_user_id, apple_user_id) if user.apple_user_id.blank?
          token = set_session_cookie!(user)
          render json: {success: true, user: serialize_user(user), token: token}
        else
          username = params[:username]&.downcase&.strip
          if username.blank?
            return render json: {
              error: "new_account_required",
              email: email
            }, status: :not_found
          end

          invite_code = params[:invite_code]
          if invite_code.present?
            invite = Invite.find_by(code: invite_code)
            return render_error("Invalid invite code") unless invite&.valid_invite?
          end

          user = User.create!(
            id: SecureRandom.uuid,
            username: username,
            name: params[:full_name],
            email: email,
            apple_user_id: apple_user_id,
            created_at: Time.current
          )
          invite&.use!(user)
          token = set_session_cookie!(user)
          render json: {success: true, user: serialize_user(user), token: token}, status: :created
        end
      rescue AppleIdService::InvalidToken => e
        render_error("Invalid Apple token: #{e.message}", status: :unauthorized)
      rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
        render_error(e.message)
      end

      # POST /api/auth/apple/link
      # Body: { identity_token }
      def link
        identity_token = params[:identity_token]
        return render_error("identity_token required") if identity_token.blank?

        payload = AppleIdService.verify(identity_token)
        apple_user_id = payload["sub"]

        if User.where.not(id: current_user.id).exists?(apple_user_id: apple_user_id)
          return render_error("Apple ID already linked to another account")
        end

        current_user.update!(apple_user_id: apple_user_id)
        render json: {success: true}
      rescue AppleIdService::InvalidToken => e
        render_error("Invalid Apple token: #{e.message}", status: :unauthorized)
      end

      # DELETE /api/auth/apple/link
      def unlink
        current_user.update!(apple_user_id: nil)
        render json: {success: true}
      end
    end
  end
end
