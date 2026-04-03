module Web
  class CamerasController < BaseController
    before_action :set_camera, only: [:show, :edit, :update, :destroy]

    def index
      @cameras = current_user.cameras.order(:brand, :model)
    end

    def show
      @rolls = @camera.rolls.where(user: current_user).order(created_at: :desc)
    end

    def new
      @camera = Camera.new
    end

    def create
      @camera = current_user.cameras.build(camera_params)
      @camera.uuid = SecureRandom.uuid
      @camera.updated_at = Time.current

      if @camera.save
        redirect_to camera_path(@camera), notice: "Camera added"
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
    end

    def update
      @camera.updated_at = Time.current
      if @camera.update(camera_params)
        redirect_to camera_path(@camera), notice: "Camera updated"
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @camera.destroy!
      redirect_to cameras_path, notice: "Camera deleted"
    end

    private

    def set_camera
      @camera = current_user.cameras.find_by!(slug: params[:id])
    rescue ActiveRecord::RecordNotFound
      redirect_to cameras_path, alert: "Camera not found"
    end

    def camera_params
      params.require(:camera).permit(:slug, :brand, :model, :nickname, :format)
    end
  end
end
