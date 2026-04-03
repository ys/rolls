module Web
  module Admin
    class UsersController < BaseController
      PER_PAGE = 20

      def index
        page = (params[:page] || 0).to_i
        @users = User
          .order(created_at: :desc)
          .limit(PER_PAGE)
          .offset(page * PER_PAGE)
        @page = page
        @total_users = User.count
        @total_pages = (@total_users / PER_PAGE.to_f).ceil
      end
    end
  end
end
