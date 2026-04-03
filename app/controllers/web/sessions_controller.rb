module Web
  class SessionsController < ApplicationController
    skip_before_action :set_current_user, only: [:new]

    def new
      redirect_to root_path if logged_in?
    end

    def create
      # Web login is handled via WebAuthn JS — this is the fallback API key login for dev
      api_key_raw = params[:api_key]
      if api_key_raw.present?
        api_key = ApiKeyService.find_by_raw_key(api_key_raw)
        if api_key
          set_session_cookie!(api_key.user)
          redirect_to root_path, notice: 'Signed in'
        else
          flash[:alert] = 'Invalid API key'
          render :new, status: :unprocessable_entity
        end
      else
        flash[:alert] = 'Sign in via passkey'
        render :new
      end
    end

    def destroy
      cookies.delete(:session)
      redirect_to login_path, notice: 'Signed out'
    end
  end
end
