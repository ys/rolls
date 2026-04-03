module Web
  class RollsController < BaseController
    before_action :set_roll, only: [:show, :edit, :update, :destroy]

    def new
      @roll = Roll.new
      @cameras = current_user.cameras.order(:brand, :model)
      @films = current_user.films.order(:brand, :name)
      @next_number = Roll.next_number_for(current_user)
    end

    def create
      @roll = current_user.rolls.build(roll_params)
      @roll.uuid = SecureRandom.uuid
      @roll.roll_number ||= Roll.next_number_for(current_user)
      @roll.created_at = Time.current
      @roll.updated_at = Time.current
      if @roll.camera_uuid.present?
        @roll.loaded_at ||= Time.current
      else
        @roll.fridge_at ||= Time.current
      end
      if @roll.save
        redirect_to roll_path(@roll), notice: "Roll created"
      else
        @cameras = current_user.cameras.order(:brand, :model)
        @films = current_user.films.order(:brand, :name)
        render :new, status: :unprocessable_entity
      end
    end

    DEVELOP_STATUSES = %w[lab scanned processed uploaded].freeze

    def shoot
      @rolls = current_user.rolls
        .active
        .includes(:camera, :film)
        .order(created_at: :desc)
        .reject { |r| DEVELOP_STATUSES.include?(r.status) }
    end

    def develop
      @rolls = current_user.rolls
        .active
        .includes(:camera, :film)
        .order(created_at: :desc)
        .select { |r| %w[lab scanned processed uploaded].include?(r.status) }
    end

    def index
      redirect_to shoot_path
    end

    def archive
      @rolls = current_user.rolls
        .archived
        .includes(:camera, :film)
        .order(roll_number: :desc)
    end

    def show
    end

    def edit
      @cameras = current_user.cameras.order(:brand, :model)
      @films = current_user.films.order(:brand, :name)
    end

    def update
      @roll.updated_at = Time.current
      if @roll.update(roll_params)
        redirect_to roll_path(@roll), notice: "Roll updated"
      else
        @cameras = current_user.cameras.order(:brand, :model)
        @films = current_user.films.order(:brand, :name)
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @roll.destroy!
      redirect_to root_path, notice: "Roll deleted"
    end

    private

    def set_roll
      @roll = current_user.rolls.find_by!(uuid: params[:id])
    rescue ActiveRecord::RecordNotFound
      redirect_to root_path, alert: "Roll not found"
    end

    def roll_params
      params.require(:roll).permit(
        :roll_number, :camera_uuid, :film_uuid,
        :loaded_at, :shot_at, :fridge_at, :lab_at, :lab_name, :lab_id,
        :scanned_at, :processed_at, :uploaded_at, :archived_at,
        :album_name, :notes, :contact_sheet_url, :push_pull,
        tags: []
      )
    end
  end
end
