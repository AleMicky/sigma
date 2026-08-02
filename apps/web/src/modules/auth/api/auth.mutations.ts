import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/app/store/auth.store"

import { authKeys } from "./auth.keys"
import { login, logout } from "./auth.service"

export function useLogin() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession({
        user: session.user,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      })
      queryClient.setQueryData(authKeys.me(), session.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) return
      await logout(refreshToken)
    },
    onSettled: () => {
      clearSession()
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}
