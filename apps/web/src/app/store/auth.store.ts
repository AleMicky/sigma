import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { apiConfig } from "@/app/config/api.config"
import { appConfig } from "@/app/config"
import type { AuthUser } from "@/app/router/router.context"

export type AuthSession = {
  user: AuthUser
  accessToken: string
  refreshToken?: string | null
  /** Segundos de vigencia informados por /auth/login o /auth/refresh. */
  expiresIn?: number | null
}

type PersistedAuthState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  /** Instant epoch en ms; se deriva de `exp` del JWT o de `expiresIn`. */
  expiresAt: number | null
  /** Hash de baseUrl + id de usuario; evita reutilizar la sesión en otro servidor/usuario. */
  sessionScope: string | null
}

type AuthState = PersistedAuthState & {
  isAuthenticated: boolean
  /** Contador no persistido: cada cierre local dispara una sola limpieza de caché. */
  sessionEpoch: number
  setSession: (session: AuthSession) => void
  clearSession: () => void
  /** Comprueba la vigencia actual y limpia la sesión si expiró. */
  validateSession: () => boolean
}

const SESSION_SCHEMA_VERSION = 1

/** Hash FNV-1a estable (sin dependencias ni secretos) para versionar claves de sesión. */
export function hashSessionValue(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

export function getSessionScope(
  baseUrl: string,
  userId: string | null | undefined,
): string {
  return hashSessionValue(`${baseUrl}|${userId ?? ""}`)
}

export function getAuthStorageKey(baseUrl: string = apiConfig.baseUrl): string {
  return `${appConfig.storageKeys.user}:v${SESSION_SCHEMA_VERSION}:${hashSessionValue(baseUrl)}`
}

/** Incluye roles para que `router.invalidate()` se ejecute si cambian. */
export function getAuthSessionKey(isAuthenticated: boolean, user: AuthUser | null): string {
  const roles = [...(user?.roles ?? [])].sort().join(",")
  return `${isAuthenticated}:${user?.id ?? ""}:${roles}`
}

function readJwtExpiration(accessToken: string): number | null {
  const parts = accessToken.split(".")
  if (parts.length !== 3 || !parts[1]) return null

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    const payload: unknown = JSON.parse(atob(padded))

    if (
      typeof payload === "object" &&
      payload !== null &&
      "exp" in payload &&
      typeof payload.exp === "number" &&
      Number.isFinite(payload.exp)
    ) {
      return payload.exp * 1000
    }
  } catch {
    // Token opaco o payload no decodificable: se usa expiresIn si viene en la respuesta.
  }

  return null
}

export function resolveExpiresAt(
  accessToken: string,
  expiresIn?: number | null,
): number | null {
  const jwtExpiration = readJwtExpiration(accessToken)
  if (jwtExpiration !== null) return jwtExpiration

  if (
    typeof expiresIn === "number" &&
    Number.isFinite(expiresIn) &&
    expiresIn > 0
  ) {
    return Date.now() + expiresIn * 1000
  }

  return null
}

function hasUsableTokens(state: PersistedAuthState): boolean {
  return Boolean(
    state.user &&
      state.accessToken &&
      (state.expiresAt === null || state.expiresAt > Date.now()),
  )
}

function hasValidPersistedSession(state: PersistedAuthState): boolean {
  return Boolean(
    hasUsableTokens(state) &&
      state.expiresAt !== null &&
      state.sessionScope === getSessionScope(apiConfig.baseUrl, state.user?.id),
  )
}

const INITIAL_SESSION: PersistedAuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  sessionScope: null,
}

function removeLegacyStoredSession(): void {
  try {
    if (typeof localStorage === "undefined") return
    localStorage.removeItem(appConfig.storageKeys.user)
    localStorage.removeItem(getAuthStorageKey())
  } catch {
    // Ignorar errores de acceso al storage
  }
}

function clearRecentNavTabs(): void {
  try {
    if (typeof sessionStorage === "undefined") return
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sigma_recent_nav_tabs")) {
        sessionStorage.removeItem(key)
      }
    })
    sessionStorage.removeItem("sigma_recent_nav_tabs")
  } catch {
    // Ignorar errores de acceso al storage
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...INITIAL_SESSION,
      isAuthenticated: false,
      sessionEpoch: 0,

      setSession: ({ user, accessToken, refreshToken, expiresIn }) => {
        const nextSession: PersistedAuthState = {
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          expiresAt: resolveExpiresAt(accessToken, expiresIn),
          sessionScope: getSessionScope(apiConfig.baseUrl, user.id),
        }

        set({ ...nextSession, isAuthenticated: hasUsableTokens(nextSession) })
      },

      clearSession: () => {
        clearRecentNavTabs()
        removeLegacyStoredSession()
        set((state) => ({
          ...INITIAL_SESSION,
          isAuthenticated: false,
          sessionEpoch: state.sessionEpoch + 1,
        }))
      },

      validateSession: () => {
        const state = get()
        const scopeMatches =
          !state.user ||
          state.sessionScope === getSessionScope(apiConfig.baseUrl, state.user.id)

        if (hasUsableTokens(state) && scopeMatches) {
          return true
        }

        get().clearSession()
        return false
      },
    }),
    {
      name: getAuthStorageKey(),
      version: SESSION_SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAuthState => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        sessionScope: state.sessionScope,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (
          persistedState && typeof persistedState === "object"
            ? persistedState
            : {}
        ) as Partial<PersistedAuthState>

        const candidate: PersistedAuthState = {
          user: persisted.user ?? INITIAL_SESSION.user,
          accessToken: persisted.accessToken ?? INITIAL_SESSION.accessToken,
          refreshToken: persisted.refreshToken ?? INITIAL_SESSION.refreshToken,
          expiresAt: persisted.expiresAt ?? INITIAL_SESSION.expiresAt,
          sessionScope: persisted.sessionScope ?? INITIAL_SESSION.sessionScope,
        }

        const isValid = hasValidPersistedSession(candidate)

        return {
          ...currentState,
          ...(isValid ? candidate : INITIAL_SESSION),
          isAuthenticated: isValid,
        }
      },
      onRehydrateStorage: () => (state, error) => {
        if (error || !state?.isAuthenticated) {
          removeLegacyStoredSession()
        }
      },
    },
  ),
)
