import { storageService } from "@/services/storage.service";
import { STORAGE_KEYS } from "@/constants/storage-keys";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export interface SessionData<T = unknown> {
  accessToken: string;
  refreshToken: string | null;
  user: T | null;
}

export const sessionService = {
  /**
   * Save access token
   */
  async saveAccessToken(token: string): Promise<boolean> {
    return storageService.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return storageService.get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Save refresh token
   */
  async saveRefreshToken(token: string): Promise<boolean> {
    return storageService.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return storageService.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Save access and refresh tokens together
   */
  async saveTokens(tokens: { accessToken: string; refreshToken?: string }): Promise<void> {
    const promises: Promise<boolean>[] = [this.saveAccessToken(tokens.accessToken)];
    if (tokens.refreshToken !== undefined) {
      promises.push(this.saveRefreshToken(tokens.refreshToken));
    }
    await Promise.all(promises);
  },

  /**
   * Get both tokens
   */
  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  },

  /**
   * Save user session data
   */
  async saveUser<T>(user: T): Promise<boolean> {
    return storageService.setJSON(STORAGE_KEYS.SESSION_USER, user);
  },

  /**
   * Get user session data
   */
  async getUser<T>(): Promise<T | null> {
    return storageService.getJSON<T>(STORAGE_KEYS.SESSION_USER);
  },

  /**
   * Save complete session in one step
   */
  async saveSession<T>(params: {
    accessToken?: string;
    refreshToken?: string;
    user?: T;
  }): Promise<void> {
    const promises: Promise<unknown>[] = [];

    if (typeof params.accessToken === "string" && params.accessToken.trim().length > 0) {
      promises.push(this.saveAccessToken(params.accessToken));
    }

    if (typeof params.refreshToken === "string" && params.refreshToken.trim().length > 0) {
      promises.push(this.saveRefreshToken(params.refreshToken));
    }

    if (params.user !== undefined && params.user !== null) {
      promises.push(this.saveUser(params.user));
    }

    await Promise.all(promises);
  },

  /**
   * Get full session data (tokens + user)
   */
  async getSession<T>(): Promise<SessionData<T> | null> {
    const [accessToken, refreshToken, user] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
      this.getUser<T>(),
    ]);

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      user,
    };
  },

  /**
   * Quick check if a session exists (access token is present)
   */
  async isAuthenticated(): Promise<boolean> {
    return storageService.has(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Clear tokens only (keeps user profile cached if desired)
   */
  async clearTokens(): Promise<void> {
    await storageService.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  },

  /**
   * Clear user profile data
   */
  async clearUser(): Promise<void> {
    await storageService.remove(STORAGE_KEYS.SESSION_USER);
  },

  /**
   * Clear all session data (logout)
   */
  async clear(): Promise<void> {
    await storageService.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.SESSION_USER,
    ]);
  },
};