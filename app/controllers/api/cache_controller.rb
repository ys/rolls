module Api
  class CacheController < BaseController
    def timestamps
      rolls_ts = current_user.rolls.maximum(:updated_at)
      cameras_ts = current_user.cameras.maximum(:updated_at)
      films_ts = current_user.films.maximum(:updated_at)

      render json: {
        rolls: rolls_ts,
        cameras: cameras_ts,
        films: films_ts
      }
    end
  end
end
