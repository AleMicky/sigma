export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  roles?: string[];
  department?: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export type LoginRequest = LoginPayload;

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number;
  tokenType?: string;
  user: AuthUser;
}

export type LoginResponse = AuthTokenResponse;

export interface RefreshTokenPayload {
  refreshToken: string;
}