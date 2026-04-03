module Api
  class ImportExportController < BaseController
    # POST /api/import
    def import
      cameras_data = Array(params[:cameras]).filter_map { |c|
        if c.respond_to?(:to_unsafe_h)
          c.to_unsafe_h.with_indifferent_access
        else
          (c.respond_to?(:with_indifferent_access) ? c.with_indifferent_access : nil)
        end
      }
      films_data = Array(params[:films]).filter_map { |f|
        if f.respond_to?(:to_unsafe_h)
          f.to_unsafe_h.with_indifferent_access
        else
          (f.respond_to?(:with_indifferent_access) ? f.with_indifferent_access : nil)
        end
      }
      rolls_data = Array(params[:rolls]).filter_map { |r|
        if r.respond_to?(:to_unsafe_h)
          r.to_unsafe_h.with_indifferent_access
        else
          (r.respond_to?(:with_indifferent_access) ? r.with_indifferent_access : nil)
        end
      }

      imported = {cameras: 0, films: 0, rolls: 0}

      # Upsert cameras
      cameras_data.each do |cam|
        slug = cam[:slug].presence || Slugifier.generate(cam[:brand].to_s, cam[:model].to_s)
        camera = current_user.cameras.find_or_initialize_by(slug: slug)
        camera.assign_attributes(
          uuid: cam[:uuid] || camera.uuid || SecureRandom.uuid,
          brand: cam[:brand],
          model: cam[:model],
          nickname: cam[:nickname],
          format: cam[:format] || 135,
          updated_at: cam[:updated_at] || Time.current
        )
        camera.save!
        imported[:cameras] += 1
      end

      # Upsert films
      films_data.each do |f|
        slug = f[:slug].presence || Slugifier.generate(f[:brand].to_s, f[:name].to_s)
        film = current_user.films.find_or_initialize_by(slug: slug)
        film.assign_attributes(
          uuid: f[:uuid] || film.uuid || SecureRandom.uuid,
          brand: f[:brand],
          name: f[:name],
          nickname: f[:nickname],
          iso: f[:iso],
          color: f[:color],
          slide: f[:slide] || false,
          show_iso: f[:show_iso],
          gradient_from: f[:gradient_from],
          gradient_to: f[:gradient_to],
          updated_at: f[:updated_at] || Time.current
        )
        film.save!
        imported[:films] += 1
      end

      # Upsert rolls
      rolls_data.each do |r|
        roll = current_user.rolls.find_or_initialize_by(uuid: r[:uuid]) if r[:uuid]
        roll ||= current_user.rolls.find_or_initialize_by(roll_number: r[:roll_number]) if r[:roll_number]
        roll ||= current_user.rolls.build

        roll.assign_attributes(
          uuid: r[:uuid] || roll.uuid || SecureRandom.uuid,
          roll_number: r[:roll_number],
          camera_uuid: r[:camera_uuid],
          film_uuid: r[:film_uuid],
          loaded_at: r[:loaded_at],
          shot_at: r[:shot_at],
          fridge_at: r[:fridge_at],
          lab_at: r[:lab_at],
          lab_name: r[:lab_name],
          lab_id: r[:lab_id],
          scanned_at: r[:scanned_at],
          processed_at: r[:processed_at],
          uploaded_at: r[:uploaded_at],
          archived_at: r[:archived_at],
          album_name: r[:album_name],
          tags: r[:tags] || [],
          notes: r[:notes],
          contact_sheet_url: r[:contact_sheet_url],
          push_pull: r[:push_pull],
          created_at: r[:created_at] || roll.created_at || Time.current,
          updated_at: r[:updated_at] || Time.current
        )
        roll.save!
        imported[:rolls] += 1
      end

      render json: {imported: imported}
    end

    # GET /api/export
    def export
      render json: {
        cameras: current_user.cameras.map { |c| serialize_camera(c) },
        films: current_user.films.map { |f| serialize_film(f) },
        rolls: current_user.rolls.order(created_at: :asc).map { |r| serialize_roll(r) }
      }
    end
  end
end
