export type WebAuthnRegisterOptionsBody = {
  username: string;
  email: string;
  name?: string;
  invite_code?: string;
};

export type WebAuthnRegisterOptionsResponse = {
  options: unknown;
  challenge: string;
};

export type WebAuthnRegisterVerifyBody = {
  username: string;
  email: string;
  name?: string;
  invite_code?: string;
  response: unknown;
  challenge: string;
  device_name?: string;
};

export type WebAuthnLoginOptionsBody = {
  identifier: string;
};

export type WebAuthnLoginOptionsResponse = {
  options: unknown;
  challenge: string;
  user_id: string;
};

export type WebAuthnLoginVerifyBody = {
  response: unknown;
  challenge: string;
  user_id?: string;
};

export type ApiKeyListResponse = {
  api_keys: Array<{
    id: string;
    label: string | null;
    last_used_at: string | null;
    created_at: string;
  }>;
};

export type ApiKeyCreateBody = {
  label?: string;
};

export type ApiKeyCreateResponse = {
  api_key: {
    id: string;
    label: string | null;
    created_at: string;
  };
  raw_key: string;
};

