module Web
  class SettingsController < BaseController
    def index
      @api_keys = current_user.api_keys.order(created_at: :desc)
      @webauthn_credentials = current_user.webauthn_credentials.order(created_at: :desc)
      @invites = Invite.where(created_by: current_user.id).order(created_at: :desc)
    end
  end
end
