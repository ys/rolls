module Web
  module Admin
    class DashboardController < BaseController
      def index
        @total_users = User.count
        @rolls_this_week = Roll.where("created_at >= ?", 1.week.ago).count
        @rolls_this_month = Roll.where("created_at >= ?", 1.month.ago).count
        @rolls_all_time = Roll.count
        @active_users_30d = User.where("last_seen_at >= ?", 30.days.ago).count
      end
    end
  end
end
