import { useEffect, useState } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { useShallow } from "zustand/react/shallow"

import { queryClient } from "@/app/query/queryClient"
import { router } from "@/app/router/router"
import { useAuthStore } from "@/app/store/auth.store"
import { authKeys } from "@/modules/auth/api/auth.keys"

export function RouterApp() {
  const auth = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    })),
  )
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated(),
  )

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    setHydrated(useAuthStore.persist.hasHydrated())

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (auth.user) {
      queryClient.setQueryData(authKeys.me(), auth.user)
    } else {
      queryClient.removeQueries({ queryKey: authKeys.all })
    }

    void router.invalidate()
  }, [auth.isAuthenticated, auth.user, hydrated])

  if (!hydrated) {
    return null
  }

  return <RouterProvider router={router} context={{ auth }} />
}
