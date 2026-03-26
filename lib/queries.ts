import "server-only";
import { sql, type Camera, type Film, type Roll, type User } from "./db";

// ============================================================================
// Cameras
// ============================================================================

export async function getCameras(userId: string): Promise<Camera[]> {
  return sql<Camera[]>`
    SELECT c.*, COUNT(r.roll_number)::int AS roll_count
    FROM cameras c
    LEFT JOIN rolls r ON r.camera_uuid = c.uuid AND r.user_id = ${userId}
    WHERE c.user_id = ${userId}
    GROUP BY c.uuid
    ORDER BY COALESCE(c.nickname, c.brand || ' ' || c.model)
  `;
}

export async function getCameraCount(userId: string): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM cameras WHERE user_id = ${userId}
  `;
  return row?.count ?? 0;
}

// ============================================================================
// Films
// ============================================================================

export async function getFilms(userId: string): Promise<Film[]> {
  return sql<Film[]>`
    SELECT f.*, COUNT(r.roll_number)::int AS roll_count,
      cf.gradient_from, cf.gradient_to
    FROM films f
    LEFT JOIN rolls r ON r.film_uuid = f.uuid AND r.user_id = ${userId}
    LEFT JOIN catalog_films cf ON cf.slug = f.slug
    WHERE f.user_id = ${userId}
    GROUP BY f.uuid, cf.gradient_from, cf.gradient_to
    ORDER BY COALESCE(f.nickname, f.brand || ' ' || f.name)
  `;
}

export async function getFilmCount(userId: string): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM films WHERE user_id = ${userId}
  `;
  return row?.count ?? 0;
}

// ============================================================================
// Invites
// ============================================================================

export async function getInviteCount(userId: string): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM invites WHERE created_by = ${userId}
  `;
  return row?.count ?? 0;
}

export async function getRemainingInvites(userId: string): Promise<number | null> {
  const [user] = await sql<User[]>`
    SELECT invite_quota, invites_sent FROM users WHERE id = ${userId}
  `;
  if (!user || user.invite_quota === null) {
    return null; // Unlimited (admin)
  }
  return Math.max(0, user.invite_quota - user.invites_sent);
}

// ============================================================================
// Rolls with joined camera/film details
// ============================================================================

export type RollWithDetails = Roll & {
  camera_nickname: string | null;
  camera_brand: string | null;
  camera_model: string | null;
  film_nickname: string | null;
  film_brand: string | null;
  film_name: string | null;
  film_iso: number | null;
  film_show_iso: boolean | null;
  film_slug: string | null;
  film_gradient_from: string | null;
  film_gradient_to: string | null;
};

export async function getRollsWithDetails(
  userId: string,
  archived: boolean,
): Promise<RollWithDetails[]> {
  return sql<RollWithDetails[]>`
    SELECT r.*,
      c.nickname  AS camera_nickname,
      c.brand     AS camera_brand,
      c.model     AS camera_model,
      f.nickname  AS film_nickname,
      f.brand     AS film_brand,
      f.name      AS film_name,
      f.iso       AS film_iso,
      f.show_iso  AS film_show_iso,
      f.slug      AS film_slug,
      cf.gradient_from AS film_gradient_from,
      cf.gradient_to   AS film_gradient_to
    FROM rolls r
    LEFT JOIN cameras c ON c.uuid = r.camera_uuid AND c.user_id = ${userId}
    LEFT JOIN films   f ON f.uuid = r.film_uuid AND f.user_id = ${userId}
    LEFT JOIN catalog_films cf ON cf.slug = f.slug
    WHERE r.user_id = ${userId}
      AND r.scanned_at IS ${archived ? sql`NOT NULL` : sql`NULL`}
    ORDER BY ${archived ? sql`r.scanned_at DESC, ` : sql``}r.roll_number DESC
  `;
}
