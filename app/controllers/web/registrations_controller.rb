module Web
  class RegistrationsController < ApplicationController
    def new
      redirect_to root_path if logged_in?
    end
  end
end
