module Api
  module Auth
    class BaseController < ApplicationController
      skip_before_action :verify_authenticity_token, raise: false

      private

      def render_not_found
        render json: {error: "Not found"}, status: :not_found
      end

      def render_error(message, status: :unprocessable_entity)
        render json: {error: message}, status: status
      end
    end
  end
end
