module Web
  module Admin
    class BaseController < ApplicationController
      before_action :require_admin!
      layout "application"
    end
  end
end
