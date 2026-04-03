module Serializable
  extend ActiveSupport::Concern

  private

  def serialize_user(user)
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      email_notifications: user.email_notifications,
      role: user.role,
      invite_quota: user.invite_quota,
      invites_sent: user.invites_sent,
      created_at: user.created_at,
      last_seen_at: user.last_seen_at,
      apple_user_id: user.apple_user_id
    }
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
      user_id: camera.user_id,
      brand: camera.brand,
      model: camera.model,
      nickname: camera.nickname,
      format: camera.format,
      updated_at: camera.updated_at
    }
  end

  def serialize_film(film)
    return nil unless film
    {
      uuid: film.uuid,
      slug: film.slug,
      user_id: film.user_id,
      brand: film.brand,
      name: film.name,
      nickname: film.nickname,
      iso: film.iso,
      color: film.color,
      slide: film.slide,
      show_iso: film.show_iso,
      gradient_from: film.gradient_from,
      gradient_to: film.gradient_to,
      updated_at: film.updated_at
    }
  end

  def serialize_credential(cred)
    {
      id: cred.id,
      credential_id: cred.credential_id,
      device_name: cred.device_name,
      created_at: cred.created_at,
      last_used_at: cred.last_used_at,
      transports: cred.transports
    }
  end

  def serialize_invite(invite)
    {
      id: invite.id,
      code: invite.code,
      max_uses: invite.max_uses,
      used_count: invite.used_count,
      expires_at: invite.expires_at,
      created_at: invite.created_at,
      used_at: invite.used_at
    }
  end

  def serialize_key(key)
    {
      id: key.id,
      label: key.label,
      created_at: key.created_at,
      last_used_at: key.last_used_at
    }
  end
end
