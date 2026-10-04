import { storageService } from "@/services/storage.service";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

export interface SessionData<T = unknown> {
  accessToken: string;
  refreshToken: string | null;
  user: T | null;
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "session_user";

export const sessionService = {
  /**
   * Save access token
   */
  async saveAccessToken(token: string): Promise<boolean> {
    return storageService.set(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return storageService.get(ACCESS_TOKEN_KEY);
  },

  /**
   * Save refresh token
   */
  async saveRefreshToken(token: string): Promise<boolean> {
    return storageService.set(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return storageService.get(REFRESH_TOKEN_KEY);
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
    return storageService.setJSON(USER_KEY, user);
  },

  /**
   * Get user session data
   */
  async getUser<T>(): Promise<T | null> {
    return storageService.getJSON<T>(USER_KEY);
  },

  /**
   * Save complete session in one step
   */
  async saveSession<T>(params: {
    accessToken: string;
    refreshToken?: string;
    user?: T;
  }): Promise<void> {
    const promises: Promise<unknown>[] = [
      this.saveAccessToken(params.accessToken),
    ];

    if (params.refreshToken !== undefined) {
      promises.push(this.saveRefreshToken(params.refreshToken));
    }

    if (params.user !== undefined) {
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
    return storageService.has(ACCESS_TOKEN_KEY);
  },

  /**
   * Clear tokens only (keeps user profile cached if desired)
   */
  async clearTokens(): Promise<void> {
    await storageService.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },

  /**
   * Clear user profile data
   */
  async clearUser(): Promise<void> {
    await storageService.remove(USER_KEY);
  },

  /**
   * Clear all session data (logout)
   */
  async clear(): Promise<void> {
    await storageService.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_KEY,
    ]);
  },
};