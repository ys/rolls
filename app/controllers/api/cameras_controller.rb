module Api
  class CamerasController < BaseController
    before_action :set_camera, only: [:show, :update, :destroy]

    def index
      cameras = current_user.cameras.order(updated_at: :desc)
      render json: cameras.map { |c| serialize_camera(c) }
    end

    def create
      slug = params[:slug].presence || Slugifier.generate(params[:brand].to_s, params[:model].to_s)

      camera = current_user.cameras.find_or_initialize_by(slug: slug)
      camera.assign_attributes(camera_params)
      camera.uuid ||= SecureRandom.uuid
      camera.updated_at = Time.current

      if camera.save
        render json: serialize_camera(camera), status: camera.previously_new_record? ? :created : :ok
      else
        render_error(camera.errors.full_messages.join(", "))
      end
    end

    def show
      render json: serialize_camera(@camera)
    end

    def update
      @camera.updated_at = Time.current
      if @camera.update(camera_params)
        render json: serialize_camera(@camera)
      else
        render_error(@camera.errors.full_messages.join(", "))
      end
    end

    def destroy
      @camera.destroy!
      head :no_content
    end

    def merge
      target = current_user.cameras.find_by(uuid: params[:target_id])
      return render_not_found unless target

      source_ids = params[:source_ids] || []
      sources = current_user.cameras.where(uuid: source_ids)

      # Reassign rolls to target camera
      Roll.where(camera_uuid: sources.pluck(:uuid)).update_all(
        camera_uuid: target.uuid,
        updated_at: Time.current
      )

      sources.destroy_all
      render json: serialize_camera(target)
    end

    private

    def set_camera
      @camera = current_user.cameras.find_by(slug: params[:slug])
      render_not_found unless @camera
    end

    def camera_params
      params.permit(:slug, :brand, :model, :nickname, :format)
    end

    def serialize_camera(camera)
      {
        uuid: camera.uuid,
        slug: camera.slug,
        user_id: camera.user_id,
        brand: camera.brand,
        model: camera.model,
        nickname: camera.nickname,
        format: camera.format,
        updated_at: camera.updated_at
      }
    end
  end
end
