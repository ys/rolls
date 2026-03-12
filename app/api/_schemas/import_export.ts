export type ImportCamera = {
  id: string; // slug
  brand: string;
  model: string;
  nickname?: string;
  format?: number;
};

export type ImportFilm = {
  id: string; // slug
  brand: string;
  name: string;
  nickname?: string;
  iso?: number;
  color?: boolean;
  show_iso?: boolean;
};

export type ImportRoll = {
  roll_number: string;
  camera_id?: string; // camera slug
  film_id?: string; // film slug
  shot_at?: string;
  fridge_at?: string;
  lab_at?: string;
  lab_name?: string;
  scanned_at?: string;
  processed_at?: string;
  uploaded_at?: string;
  archived_at?: string;
  album_name?: string;
  tags?: string[];
  notes?: string;
  contact_sheet_url?: string;
  push_pull?: number | null;
};

export type ImportPayload = {
  cameras?: ImportCamera[];
  films?: ImportFilm[];
  rolls?: ImportRoll[];
};

export type ImportResponse = {
  cameras: number;
  films: number;
  rolls: number;
};

export type ExportCamera = {
  uuid: string;
  id: string; // slug
  brand: string;
  model: string;
  nickname: string | null;
  format: number;
};

export type ExportFilm = {
  uuid: string;
  id: string; // slug
  brand: string;
  name: string;
  nickname: string | null;
  iso: number | null;
  color: boolean;
  show_iso: boolean;
};

export type ExportRoll = {
  roll_number: string;
  shot_at: string | null;
  fridge_at: string | null;
  lab_at: string | null;
  lab_name: string | null;
  scanned_at: string | null;
  processed_at: string | null;
  uploaded_at: string | null;
  archived_at: string | null;
  album_name: string | null;
  tags: string[] | null;
  notes: string | null;
  contact_sheet_url: string | null;
  push_pull: number | null;
  camera_id: string | null;
  film_id: string | null;
};

export type ExportResponse = {
  cameras: ExportCamera[];
  films: ExportFilm[];
  rolls: ExportRoll[];
};

