class ApplicationController < ActionController::Base
  include Serializable

  before_action :set_current_user

  helper_method :current_user, :logged_in?

  private

  attr_reader :current_user

  def logged_in?
    @current_user.present?
  end

  def set_current_user
    @current_user = authenticate_from_bearer_token || authenticate_from_session_cookie
    @current_user&.update_column(:last_seen_at, Time.current)
  end

  def authenticate_from_bearer_token
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")

    token = auth_header.sub("Bearer ", "")
    return nil if token.blank?

    # Try API key first (raw key starting with rk_)
    if token.start_with?("rk_")
      api_key = ApiKeyService.find_by_raw_key(token)
      if api_key
        api_key.touch_last_used!
        return api_key.user
      end
    end

    # Try JWT
    begin
      payload = JwtService.decode(token)
      User.find_by(id: payload[:userId] || payload["userId"])
    rescue JwtService::ExpiredToken, JwtService::InvalidToken
      nil
    end
  end

  def authenticate_from_session_cookie
    session_token = cookies[:session]
    return nil unless session_token.present?

    begin
      payload = JwtService.decode(session_token)
      User.find_by(id: payload[:userId] || payload["userId"])
    rescue JwtService::ExpiredToken, JwtService::InvalidToken
      nil
    end
  end

  def require_auth!
    unless logged_in?
      respond_to do |format|
        format.json { render json: {error: "Unauthorized"}, status: :unauthorized }
        format.html { redirect_to login_path }
      end
    end
  end

  def require_api_auth!
    render json: {error: "Unauthorized"}, status: :unauthorized unless logged_in?
  end

  def render_not_found
    render json: {error: "Not found"}, status: :not_found
  end

  def render_error(message, status: :unprocessable_entity)
    render json: {error: message}, status: status
  end

  def require_admin!
    unless logged_in?
      redirect_to login_path
      return
    end
    unless current_user.role == "admin"
      redirect_to root_path, alert: "Not authorized"
    end
  end

  def set_session_cookie!(user)
    token = JwtService.encode({userId: user.id})
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
