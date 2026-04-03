module Api
  class CatalogController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false
    skip_before_action :set_current_user

    def films
      films = CatalogFilm.order(:brand, :name)
      render json: films.map { |f| serialize_film(f) }
    end

    private

    def serialize_film(film)
      {
        slug: film.slug,
        brand: film.brand,
        name: film.name,
        nickname: film.nickname,
        iso: film.iso,
        color: film.color,
        slide: film.slide,
        show_iso: film.show_iso,
        gradient_from: film.gradient_from,
        gradient_to: film.gradient_to
      }
    end
  end
end
