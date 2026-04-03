class ApplicationController < ActionController::Base
  before_action :set_current_user

  helper_method :current_user, :logged_in?

  private

  def current_user
    @current_user
  end

  def logged_in?
    @current_user.present?
  end

  def set_current_user
    @current_user = authenticate_from_bearer_token || authenticate_from_session_cookie
    @current_user&.update_column(:last_seen_at, Time.current) if @current_user
  end

  def authenticate_from_bearer_token
    auth_header = request.headers['Authorization']
    return nil unless auth_header&.start_with?('Bearer ')

    token = auth_header.sub('Bearer ', '')
    return nil if token.blank?

    # Try API key first (raw key starting with rk_)
    if token.start_with?('rk_')
      api_key = ApiKeyService.find_by_raw_key(token)
      if api_key
        api_key.touch_last_used!
        return api_key.user
      end
    end

    # Try JWT
    begin
      payload = JwtService.decode(token)
      User.find_by(id: payload[:userId] || payload['userId'])
    rescue JwtService::ExpiredToken, JwtService::InvalidToken
      nil
    end
  end

  def authenticate_from_session_cookie
    session_token = cookies[:session]
    return nil unless session_token.present?

    begin
      payload = JwtService.decode(session_token)
      User.find_by(id: payload[:userId] || payload['userId'])
    rescue JwtService::ExpiredToken, JwtService::InvalidToken
      nil
    end
  end

  def require_auth!
    unless logged_in?
      respond_to do |format|
        format.json { render json: { error: 'Unauthorized' }, status: :unauthorized }
        format.html { redirect_to login_path }
      end
    end
  end

  def set_session_cookie!(user)
    token = JwtService.encode({ userId: user.id })
    cookies[:session] = {
      value: token,
      expires: 1.year.from_now,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax
    }
    token
  end
end
