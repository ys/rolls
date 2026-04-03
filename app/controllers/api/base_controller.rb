module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false
    before_action :require_api_auth!
  end
end
