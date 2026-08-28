// Типы авторизации курьера (Swagger: courier-auth)

export type AuthTokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
};

export type LoginRequest = {
  phone: string;
  password: string;
  device_id: string;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type LogoutRequest = {
  refresh_token: string;
};

export type ApiValidationError = {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
};

export type AuthErrorCode = 401 | 403 | 422 | 423;
