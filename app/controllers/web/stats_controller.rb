module Web
  class StatsController < BaseController
    def index
      @total_rolls = current_user.rolls.count
      @archived_rolls = current_user.rolls.archived.count
      @active_rolls = current_user.rolls.active.count
      @total_cameras = current_user.cameras.count
      @total_films = current_user.films.count

      # Status breakdown
      all_rolls = current_user.rolls.select(:uuid, :loaded_at, :fridge_at, :lab_at,
                                             :scanned_at, :processed_at, :uploaded_at, :archived_at)
      @status_counts = all_rolls.group_by(&:status).transform_values(&:count)

      # Most used cameras
      @top_cameras = current_user.cameras
        .joins(:rolls)
        .where(rolls: { user_id: current_user.id })
        .group('cameras.uuid', 'cameras.brand', 'cameras.model', 'cameras.nickname')
        .select('cameras.uuid, cameras.brand, cameras.model, cameras.nickname, COUNT(rolls.uuid) as roll_count')
        .order('roll_count DESC')
        .limit(5)

      # Most used films
      @top_films = current_user.films
        .joins(:rolls)
        .where(rolls: { user_id: current_user.id })
        .group('films.uuid', 'films.brand', 'films.name', 'films.nickname')
        .select('films.uuid, films.brand, films.name, films.nickname, COUNT(rolls.uuid) as roll_count')
        .order('roll_count DESC')
        .limit(5)
    end
  end
end
