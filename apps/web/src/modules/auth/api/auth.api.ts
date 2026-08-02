import { apiConfig } from "@/app/config"
import type { AuthUser } from "@/app/router/router.context"
import { http } from "@/shared/api"

export type AuthTokenResponse = {
  accessToken: string
  refreshToken: string | null
  expiresIn: number
  tokenType: string
  user: AuthUser
}

export type LoginPayload = {
  username: string
  password: string
}

export async function login(
  payload: LoginPayload,
): Promise<AuthTokenResponse> {
  return http.post<AuthTokenResponse, LoginPayload>(
    apiConfig.endpoints.auth.login,
    payload,
    { skipAuth: true },
  )
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthTokenResponse> {
  return http.post<
    AuthTokenResponse,
    { refreshToken: string }
  >(
    apiConfig.endpoints.auth.refresh,
    { refreshToken },
    { skipAuth: true },
  )
}

export async function getCurrentUser(): Promise<AuthUser> {
  return http.get<AuthUser>(apiConfig.endpoints.auth.me)
}
