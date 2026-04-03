module Web
  class BaseController < ApplicationController
    before_action :require_web_auth!
    layout "application"

    private

    def require_web_auth!
      unless logged_in?
        redirect_to login_path, alert: "Please sign in to continue"
      end
    end
  end
end
