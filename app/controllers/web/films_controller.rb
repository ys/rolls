module Web
  class FilmsController < BaseController
    before_action :set_film, only: [:show, :edit, :update, :destroy]

    def index
      @films = current_user.films.order(:brand, :name)
    end

    def show
      @rolls = @film.rolls.where(user: current_user).order(created_at: :desc)
    end

    def new
      @film = Film.new
    end

    def create
      @film = current_user.films.build(film_params)
      @film.uuid = SecureRandom.uuid
      @film.updated_at = Time.current

      if @film.save
        redirect_to web_film_path(@film), notice: 'Film added'
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      @film.updated_at = Time.current
      if @film.update(film_params)
        redirect_to web_film_path(@film), notice: 'Film updated'
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @film.destroy!
      redirect_to web_films_path, notice: 'Film deleted'
    end

    private

    def set_film
      @film = current_user.films.find_by!(slug: params[:id])
    rescue ActiveRecord::RecordNotFound
      redirect_to web_films_path, alert: 'Film not found'
    end

    def film_params
      params.require(:film).permit(:slug, :brand, :name, :nickname, :iso,
                                   :color, :slide, :show_iso, :gradient_from, :gradient_to)
    end
  end
end
