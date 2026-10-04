import { api } from "@/api/axios-client";
import { authEndpoints } from "@/features/auth/api/auth.endpoints";
import type {
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
} from "@/features/auth/types/auth.types";

export { authEndpoints };

export const authApi = {
  /**
   * Autenticar usuario con credenciales
   */
  async login(payload: LoginPayload): Promise<AuthTokenResponse> {
    const { data } = await api.post<AuthTokenResponse>(
      authEndpoints.login,
      payload
    );
    return data;
  },

  /**
   * Renovar token de acceso con refresh token
   */
  async refreshSession(refreshToken: string): Promise<AuthTokenResponse> {
    const { data } = await api.post<AuthTokenResponse>(authEndpoints.refresh, {
      refreshToken,
    });
    return data;
  },

  /**
   * Cerrar sesión en el servidor
   */
  async logout(refreshToken?: string | null): Promise<void> {
    await api.post(authEndpoints.logout, {
      refreshToken: refreshToken ?? undefined,
    });
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>(authEndpoints.me);
    return data;
  },
};

// Direct export aliases for convenience
export const login = authApi.login;
export const refreshSession = authApi.refreshSession;
export const logout = authApi.logout;
export const getCurrentUser = authApi.getCurrentUser;