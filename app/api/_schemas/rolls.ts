export type RollIdPathParams = {
  id: string; // roll_number
};

export type CreateRollBody = {
  roll_number: string;
  camera_id?: string;
  film_id?: string;
  shot_at?: string;
  fridge_at?: string;
  lab_at?: string;
  lab_name?: string;
  scanned_at?: string;
  processed_at?: string;
  archived_at?: string;
  album_name?: string;
  tags?: string[];
  notes?: string;
  push_pull?: number | null;
};

export type ContactSheetUploadResponse = {
  contact_sheet_url: string;
};

