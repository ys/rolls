module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false
    before_action :require_api_auth!

    private

    def require_api_auth!
      unless logged_in?
        render json: {error: "Unauthorized"}, status: :unauthorized
      end
    end

    def render_not_found
      render json: {error: "Not found"}, status: :not_found
    end

    def render_error(message, status: :unprocessable_entity)
      render json: {error: message}, status: status
    end
  end
end
