module Api
  module Auth
    class EmailPreferencesController < BaseController
      before_action :require_api_auth!

      def update
        current_user.update!(email_notifications: params[:email_notifications])
        render json: {email_notifications: current_user.email_notifications}
      end
    end
  end
end
