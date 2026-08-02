import { apiConfig } from "@/app/config"
import type { AuthUser } from "@/app/router/router.context"
import { apiRequest } from "@/shared/lib/api-client"

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
  return apiRequest<AuthTokenResponse>(apiConfig.endpoints.auth.login, {
    method: "POST",
    body: payload,
    auth: false,
  })
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>(apiConfig.endpoints.auth.refresh, {
    method: "POST",
    body: { refreshToken },
    auth: false,
  })
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>(apiConfig.endpoints.auth.me)
}
