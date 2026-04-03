module Api
  module Auth
    class CredentialsController < BaseController
      before_action :require_api_auth!

      def destroy
        credential = current_user.webauthn_credentials.find_by(id: params[:id])
        return render_not_found unless credential

        credential.destroy!
        head :no_content
      end
    end
  end
end
