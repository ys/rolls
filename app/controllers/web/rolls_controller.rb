module Web
  class RollsController < BaseController
    before_action :set_roll, only: [:show, :edit, :update, :destroy, :advance]

    ADVANCE_MAP = {
      "loaded"    => {field: "fridge_at",    label: "→ Fridge"},
      "fridge"    => {field: "lab_at",       label: "→ Lab"},
      "lab"       => {field: "processed_at", label: "→ Processed"},
      "processed" => {field: "uploaded_at",  label: "→ Uploaded"},
      "uploaded"  => {field: "archived_at",  label: "→ Archive"}
    }.freeze

    def new
      @roll = Roll.new
      @cameras = current_user.cameras
        .left_joins(:rolls)
        .group(:uuid)
        .order("COUNT(rolls.uuid) DESC, cameras.brand, cameras.model")
      @films = current_user.films
        .left_joins(:rolls)
        .group(:uuid)
        .order("COUNT(rolls.uuid) DESC, films.brand, films.name")
      @next_number = Roll.next_number_for(current_user)
    end

    def create
      @roll = current_user.rolls.build(roll_params)
      @roll.uuid = SecureRandom.uuid
      @roll.roll_number = Roll.next_number_for(current_user) if @roll.roll_number.blank?
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
        .reject { |r| DEVELOP_STATUSES.include?(r.status) }
        .sort_by { |r| roll_number_sort_key(r.roll_number) }
        .reverse
    end

    def develop
      @rolls = current_user.rolls
        .active
        .includes(:camera, :film)
        .select { |r| %w[lab scanned processed uploaded].include?(r.status) }
        .sort_by { |r| roll_number_sort_key(r.roll_number) }
        .reverse
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
        respond_to do |format|
          format.json { render json: {ok: true} }
          format.html { redirect_to roll_path(@roll), notice: "Roll updated" }
        end
      else
        respond_to do |format|
          format.json { render json: {error: @roll.errors.full_messages.first}, status: :unprocessable_entity }
          format.html do
            @cameras = current_user.cameras.order(:brand, :model)
            @films = current_user.films.order(:brand, :name)
            render :edit, status: :unprocessable_entity
          end
        end
      end
    end

    def advance
      step = ADVANCE_MAP[@roll.status]
      if step
        @roll.update!(step[:field] => Time.current, updated_at: Time.current)
      end
      redirect_back fallback_location: shoot_path
    end

    def destroy
      @roll.destroy!
      redirect_to root_path, notice: "Roll deleted"
    end

    private

    def roll_number_sort_key(roll_number)
      m = roll_number.to_s.match(/^(\d+)x(\d+)$/i)
      m ? [m[1].to_i, m[2].to_i] : [0, 0]
    end

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
