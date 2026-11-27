import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuthStore } from "@/app/store/auth.store"
import { getErrorMessage } from "@/shared/api"

import { authKeys } from "./auth.keys"
import { login, logout } from "./auth.service"

export function useLogin() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      // La suscripción de REQ-112 limpia la caché al cambiar la identidad.
      setSession({
        user: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresIn: session.expiresIn,
      })
      queryClient.setQueryData(authKeys.me(), session.user)
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: () => {
      // Se leen en el momento de la mutación para no usar un closure obsoleto.
      const { refreshToken, accessToken } = useAuthStore.getState()
      return logout(refreshToken, accessToken)
    },
    onError: (error) => {
      toast.warning(
        `No se pudo invalidar la sesión en el servidor: ${getErrorMessage(error)}. La sesión local se cerró de todos modos.`,
      )
    },
    onSettled: () => {
      clearSession()
    },
  })
}
