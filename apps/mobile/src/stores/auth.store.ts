import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { setupApiAuth } from "@/src/lib/api";
import {
    authService,
    AuthTokenResponse,
    AuthUser,
    LoginPayload,
} from "@/src/features/auth/services/auth.service";

const AUTH_STORAGE_KEY = "sigma_auth_session";

// Secure storage adapter for Zustand persist middleware
const secureStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(name);
        } catch {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(name, value);
        } catch (error) {
            console.warn("Error saving session to SecureStore:", error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(name);
        } catch (error) {
            console.warn("Error removing session from SecureStore:", error);
        }
    },
};

export interface AuthSession {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string | null;
}

export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isRestoring: boolean;

    // Actions
    setSession: (session: AuthSession) => void;
    clearSession: () => void;
    login: (credentials: LoginPayload) => Promise<AuthTokenResponse>;
    logout: () => Promise<void>;
    refreshAuthToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            isRestoring: true,

            setSession: ({ user, accessToken, refreshToken }) => {
                set({
                    user,
                    accessToken,
                    refreshToken: refreshToken ?? null,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            clearSession: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            login: async (credentials: LoginPayload) => {
                set({ isLoading: true });
                try {
                    const response = await authService.login(credentials);
                    get().setSession({
                        user: response.user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                    });
                    return response;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                const { refreshToken } = get();
                set({ isLoading: true });
                try {
                    await authService.logout(refreshToken);
                } finally {
                    get().clearSession();
                }
            },

            refreshAuthToken: async () => {
                const { refreshToken } = get();
                if (!refreshToken) {
                    get().clearSession();
                    return null;
                }

                try {
                    const response = await authService.refreshSession(refreshToken);
                    get().setSession({
                        user: response.user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken ?? refreshToken,
                    });
                    return response.accessToken;
                } catch {
                    get().clearSession();
                    return null;
                }
            },
        }),
        {
            name: AUTH_STORAGE_KEY,
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isRestoring = false;
                }
            },
        }
    )
);

// Register token getters with API client without circular dependencies
setupApiAuth(
    () => useAuthStore.getState().accessToken,
    () => useAuthStore.getState().refreshAuthToken()
);
