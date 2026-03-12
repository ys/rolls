export type ErrorResponse = {
  error: string;
};

export type SuccessResponse = {
  success: true;
};

export type UserPublic = {
  id: string;
  username: string;
  name: string | null;
  email: string;
};

export type SessionAuthSuccessResponse = {
  success: true;
  user: UserPublic;
};

