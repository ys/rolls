module Api
  module Auth
    class AppleController < BaseController
      before_action :require_api_auth!, only: [:link, :unlink]

      # POST /api/auth/apple
      def create
        apple_user_id = params[:apple_user_id]
        return render_error('apple_user_id required') if apple_user_id.blank?

        user = User.find_by(apple_user_id: apple_user_id)

        if user
          token = set_session_cookie!(user)
          render json: { success: true, user: serialize_user(user), token: token }
        else
          # Create new user if name/email provided
          username = params[:username]&.downcase&.strip
          if username.blank?
            return render_error('Username required for new account')
          end

          user = User.create!(
            id: SecureRandom.uuid,
            username: username,
            name: params[:full_name],
            email: params[:email],
            apple_user_id: apple_user_id,
            created_at: Time.current
          )
          token = set_session_cookie!(user)
          render json: { success: true, user: serialize_user(user), token: token }, status: :created
        end
      rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid => e
        render_error(e.message)
      end

      # POST /api/auth/apple/link
      def link
        apple_user_id = params[:apple_user_id]
        return render_error('apple_user_id required') if apple_user_id.blank?

        if User.exists?(apple_user_id: apple_user_id)
          return render_error('Apple ID already linked to another account')
        end

        current_user.update!(apple_user_id: apple_user_id)
        render json: { success: true }
      end

      # DELETE /api/auth/apple/link
      def unlink
        current_user.update!(apple_user_id: nil)
        render json: { success: true }
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
          role: user.role
        }
      end
    end
  end
end
