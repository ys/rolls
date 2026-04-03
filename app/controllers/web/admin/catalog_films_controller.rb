module Web
  module Admin
    class CatalogFilmsController < BaseController
      before_action :set_catalog_film, only: [:edit, :update, :destroy]

      def index
        @catalog_films = CatalogFilm.order(:brand, :name)
      end

      def new
        @catalog_film = CatalogFilm.new
      end

      def create
        @catalog_film = CatalogFilm.new(catalog_film_params)
        if @catalog_film.save
          redirect_to admin_catalog_films_path, notice: "Film added"
        else
          render :new, status: :unprocessable_entity
        end
      end

      def edit
      end

      def update
        if @catalog_film.update(catalog_film_params)
          redirect_to admin_catalog_films_path, notice: "Film updated"
        else
          render :edit, status: :unprocessable_entity
        end
      end

      def destroy
        @catalog_film.destroy!
        redirect_to admin_catalog_films_path, notice: "Film deleted"
      end

      private

      def set_catalog_film
        @catalog_film = CatalogFilm.find(params[:id])
      end

      def catalog_film_params
        params.require(:catalog_film).permit(
          :slug, :brand, :name, :nickname, :iso,
          :color, :slide, :show_iso, :gradient_from, :gradient_to
        )
      end
    end
  end
end
