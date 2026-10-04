import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type {
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
} from "@/features/auth/types/auth.types";
import { sessionService } from "@/services/session.service";

export const authService = {
  /**
   * Realizar login, persistir sesión y actualizar el store de autenticación
   */
  async login(payload: LoginPayload): Promise<AuthTokenResponse> {
    const response = await authApi.login(payload);

    await sessionService.saveSession({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? undefined,
      user: response.user,
    });

    useAuthStore.getState().setUser(response.user);

    return response;
  },

  /**
   * Cerrar sesión limpiando tokens, almacenamiento seguro y store
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await sessionService.getRefreshToken();
      await authApi.logout(refreshToken);
    } catch {
      // Continuar con logout local aunque falle la petición de red
    } finally {
      await sessionService.clear();
      useAuthStore.getState().clear();
    }
  },

  /**
   * Renovar la sesión actual usando el refresh token almacenado
   */
  async refreshSession(): Promise<AuthTokenResponse | null> {
    const refreshToken = await sessionService.getRefreshToken();
    if (!refreshToken) {
      await this.logout();
      return null;
    }

    try {
      const response = await authApi.refreshSession(refreshToken);
      await sessionService.saveSession({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken ?? undefined,
        user: response.user,
      });
      useAuthStore.getState().setUser(response.user);
      return response;
    } catch (error) {
      await this.logout();
      throw error;
    }
  },

  /**
   * Obtener y sincronizar el usuario actual desde el backend
   */
  async getCurrentUser(): Promise<AuthUser> {
    const user = await authApi.getCurrentUser();
    await sessionService.saveUser(user);
    useAuthStore.getState().setUser(user);
    return user;
  },
};