import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { sessionService } from "@/services/session.service";

export function useRestoreSession() {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let isMounted = true;

    const restore = async () => {
      try {
        const token = await sessionService.getAccessToken();
        const user = await sessionService.getUser<AuthUser>();

        if (isMounted && token && user) {
          setUser(user);
        }
      } catch (error) {
        console.warn("Error al restaurar sesión:", error);
      } finally {
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    restore();

    return () => {
      isMounted = false;
    };
  }, [setUser, setInitialized]);
}