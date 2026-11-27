import type { AuthUser } from "@/app/router/router.context"
import { http } from "@/shared/api"

import { authEndpoints } from "./auth.endpoints"

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
    authEndpoints.login,
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
    authEndpoints.refresh,
    { refreshToken },
    { skipAuth: true },
  )
}

export async function logout(
  refreshToken: string | null,
  accessToken?: string | null,
): Promise<void> {
  // El contrato mantiene logout como permitAll, pero la API valida el `sub`
  // del Bearer cuando está presente. `skipAuth` evita el flujo de refresh
  // en esta llamada y el header se envía explícitamente.
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined

  await http.post<void, { refreshToken: string }>(
    authEndpoints.logout,
    { refreshToken: refreshToken ?? "" },
    { skipAuth: true, ...(headers ? { headers } : {}) },
  )
}

export async function getCurrentUser(): Promise<AuthUser> {
  return http.get<AuthUser>(authEndpoints.me)
}
