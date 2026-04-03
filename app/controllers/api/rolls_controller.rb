module Api
  class RollsController < BaseController
    before_action :set_roll, only: [:show, :update, :destroy, :contact_sheet_show, :contact_sheet_upload]

    def index
      limit = [params[:limit].to_i.nonzero? || 200, 200].min
      offset = params[:offset].to_i

      rolls = current_user.rolls
        .includes(:camera, :film)
        .order(created_at: :desc)
        .limit(limit)
        .offset(offset)

      render json: rolls.map { |r| serialize_roll(r) }
    end

    def home
      rolls = current_user.rolls
        .active
        .includes(:camera, :film)
        .order(created_at: :desc)

      render json: rolls.map { |r| serialize_roll(r, include_associations: true) }
    end

    def archive
      rolls = current_user.rolls
        .archived
        .includes(:camera, :film)
        .order(archived_at: :desc)

      render json: rolls.map { |r| serialize_roll(r, include_associations: true) }
    end

    def next_number
      # Generate next roll number in YYxx format
      year_prefix = Time.current.year.to_s[-2..]
      existing = current_user.rolls
        .where("roll_number LIKE ?", "#{year_prefix}%")
        .pluck(:roll_number)
        .map { |n| n.sub(year_prefix, '').to_i }
        .max || 0

      next_num = existing + 1
      roll_number = "#{year_prefix}#{next_num.to_s.rjust(2, '0')}"

      render json: { roll_number: roll_number }
    end

    def show
      render json: serialize_roll(@roll, include_associations: true)
    end

    def create
      roll = current_user.rolls.build(roll_params)
      roll.uuid ||= SecureRandom.uuid
      roll.created_at ||= Time.current
      roll.updated_at = Time.current

      if roll.save
        render json: serialize_roll(roll), status: :created
      else
        render_error(roll.errors.full_messages.join(', '))
      end
    end

    def update
      @roll.updated_at = Time.current
      if @roll.update(roll_params)
        render json: serialize_roll(@roll, include_associations: true)
      else
        render_error(@roll.errors.full_messages.join(', '))
      end
    end

    def destroy
      @roll.destroy!
      head :no_content
    end

    def bulk_update
      roll_numbers = params[:roll_numbers]
      field = params[:field]
      value = params[:value]

      return render_error('roll_numbers, field, and value required') if roll_numbers.blank? || field.blank?

      allowed_fields = %w[
        loaded_at shot_at fridge_at lab_at lab_name lab_id scanned_at
        processed_at uploaded_at archived_at album_name notes push_pull
        camera_uuid film_uuid tags contact_sheet_url
      ]

      return render_error("Field '#{field}' not allowed for bulk update") unless allowed_fields.include?(field)

      rolls = current_user.rolls.where(roll_number: roll_numbers)
      rolls.update_all(field => value, updated_at: Time.current)

      render json: { updated: rolls.count }
    end

    def contact_sheet_show
      require 'r2_service'
      result = R2Service.download(@roll.roll_number)
      return render_not_found unless result

      response.headers['Content-Type'] = result[:content_type]
      send_data result[:body], type: result[:content_type], disposition: 'inline'
    end

    def contact_sheet_upload
      require 'r2_service'
      body = request.body.read
      content_type = request.content_type || 'image/webp'

      url = R2Service.upload(@roll.roll_number, body, content_type: content_type)
      @roll.update!(contact_sheet_url: url, updated_at: Time.current)

      render json: { url: url }
    end

    private

    def set_roll
      @roll = current_user.rolls.find_by(uuid: params[:id])
      render_not_found unless @roll
    end

    def roll_params
      params.permit(
        :roll_number, :camera_uuid, :film_uuid,
        :loaded_at, :shot_at, :fridge_at, :lab_at, :lab_name, :lab_id,
        :scanned_at, :processed_at, :uploaded_at, :archived_at,
        :album_name, :notes, :contact_sheet_url, :push_pull,
        tags: []
      )
    end

    def serialize_roll(roll, include_associations: false)
      data = {
        uuid: roll.uuid,
        roll_number: roll.roll_number,
        user_id: roll.user_id,
        camera_uuid: roll.camera_uuid,
        film_uuid: roll.film_uuid,
        loaded_at: roll.loaded_at,
        shot_at: roll.shot_at,
        fridge_at: roll.fridge_at,
        lab_at: roll.lab_at,
        lab_name: roll.lab_name,
        lab_id: roll.lab_id,
        scanned_at: roll.scanned_at,
        processed_at: roll.processed_at,
        uploaded_at: roll.uploaded_at,
        archived_at: roll.archived_at,
        album_name: roll.album_name,
        tags: roll.tags || [],
        notes: roll.notes,
        contact_sheet_url: roll.contact_sheet_url,
        push_pull: roll.push_pull,
        created_at: roll.created_at,
        updated_at: roll.updated_at,
        status: roll.status
      }

      if include_associations
        data[:camera] = roll.camera ? serialize_camera(roll.camera) : nil
        data[:film] = roll.film ? serialize_film(roll.film) : nil
      end

      data
    end

    def serialize_camera(camera)
      return nil unless camera
      {
        uuid: camera.uuid,
        slug: camera.slug,
        brand: camera.brand,
        model: camera.model,
        nickname: camera.nickname,
        format: camera.format
      }
    end

    def serialize_film(film)
      return nil unless film
      {
        uuid: film.uuid,
        slug: film.slug,
        brand: film.brand,
        name: film.name,
        nickname: film.nickname,
        iso: film.iso,
        color: film.color,
        slide: film.slide,
        gradient_from: film.gradient_from,
        gradient_to: film.gradient_to
      }
    end
  end
end
