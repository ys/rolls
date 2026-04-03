class WellKnownController < ApplicationController
  skip_before_action :set_current_user
  skip_before_action :verify_authenticity_token, raise: false

  def apple_app_site_association
    render json: {
      applinks: {
        apps: [],
        details: [
          {
            appID: "#{ENV.fetch('APPLE_TEAM_ID', 'XXXXXXXXXX')}.computer.yannick.rolls",
            paths: ["*"]
          }
        ]
      },
      webcredentials: {
        apps: ["#{ENV.fetch('APPLE_TEAM_ID', 'XXXXXXXXXX')}.computer.yannick.rolls"]
      }
    }
  end
end
