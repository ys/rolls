module Api
  class FilmsController < BaseController
    before_action :set_film, only: [:show, :update, :destroy]

    def index
      films = current_user.films.order(updated_at: :desc)
      render json: films.map { |f| serialize_film(f) }
    end

    def create
      slug = params[:slug].presence || Slugifier.generate(params[:brand].to_s, params[:name].to_s)

      film = current_user.films.find_or_initialize_by(slug: slug)
      film.assign_attributes(film_params)
      film.uuid ||= SecureRandom.uuid
      film.updated_at = Time.current

      if film.save
        render json: serialize_film(film), status: film.previously_new_record? ? :created : :ok
      else
        render_error(film.errors.full_messages.join(", "))
      end
    end

    def show
      render json: serialize_film(@film)
    end

    def update
      @film.updated_at = Time.current
      if @film.update(film_params)
        render json: serialize_film(@film)
      else
        render_error(@film.errors.full_messages.join(", "))
      end
    end

    def destroy
      @film.destroy!
      head :no_content
    end

    def merge
      target = current_user.films.find_by(uuid: params[:target_id])
      return render_not_found unless target

      source_ids = params[:source_ids] || []
      sources = current_user.films.where(uuid: source_ids)

      Roll.where(film_uuid: sources.pluck(:uuid)).update_all(
        film_uuid: target.uuid,
        updated_at: Time.current
      )

      sources.destroy_all
      render json: serialize_film(target)
    end

    private

    def set_film
      @film = current_user.films.find_by(slug: params[:slug])
      render_not_found unless @film
    end

    def film_params
      params.permit(:slug, :brand, :name, :nickname, :iso, :color, :slide,
        :show_iso, :gradient_from, :gradient_to)
    end
  end
end
