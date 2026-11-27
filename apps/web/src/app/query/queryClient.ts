import { QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/app/store/auth.store";

import { queryDefaultOptions } from "./query-options";

export const queryClient = new QueryClient({
    defaultOptions: queryDefaultOptions,
});

/**
 * Único punto de limpieza de caché por identidad (REQ-SEG-112): basta con que
 * el store deje de estar autenticado o cambie de user.id. Así logout, 401,
 * rehidratación inválida y cambio de cuenta comparten el mismo comportamiento.
 */
useAuthStore.subscribe((state, previousState) => {
    const identityChanged =
        (state.user?.id ?? null) !== (previousState.user?.id ?? null);
    const authenticationChanged =
        state.isAuthenticated !== previousState.isAuthenticated;
    const sessionCleared = state.sessionEpoch !== previousState.sessionEpoch;

    if (identityChanged || authenticationChanged || sessionCleared) {
        queryClient.clear();
    }
});
