import { api } from "@/src/lib/api";

export interface AuthUser {
    id: string;
    username: string;
    name: string;
    email: string;
    roles: string[];
}

export interface AuthTokenResponse {
    accessToken: string;
    refreshToken: string | null;
    expiresIn: number;
    tokenType: string;
    user: AuthUser;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export const authEndpoints = {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
} as const;

export const authService = {
    async login(payload: LoginPayload): Promise<AuthTokenResponse> {
        const response = await api.post<AuthTokenResponse>(
            authEndpoints.login,
            payload,
            { skipAuth: true }
        );
        return response.data;
    },

    async refreshSession(refreshToken: string): Promise<AuthTokenResponse> {
        const response = await api.post<AuthTokenResponse>(
            authEndpoints.refresh,
            { refreshToken },
            { skipAuth: true }
        );
        return response.data;
    },

    async logout(refreshToken?: string | null): Promise<void> {
        try {
            await api.post(
                authEndpoints.logout,
                { refreshToken: refreshToken ?? "" },
                { skipAuth: true }
            );
        } catch {
            // Ignore logout network failures to ensure local session wipe
        }
    },

    async getCurrentUser(): Promise<AuthUser> {
        const response = await api.get<AuthUser>(authEndpoints.me);
        return response.data;
    },
};
