import { useEffect, useRef, useSyncExternalStore } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { useShallow } from "zustand/react/shallow"

import { queryClient } from "@/app/query/queryClient"
import { router } from "@/app/router/router"
import { useAuthStore } from "@/app/store/auth.store"
import { authKeys } from "@/modules/auth/api/auth.keys"

function subscribeToHydration(onStoreChange: () => void) {
  const unsubHydrate = useAuthStore.persist.onHydrate(onStoreChange)
  const unsubFinish = useAuthStore.persist.onFinishHydration(onStoreChange)

  return () => {
    unsubHydrate()
    unsubFinish()
  }
}

function getHydrationSnapshot() {
  return useAuthStore.persist.hasHydrated()
}

export function RouterApp() {
  const auth = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    })),
  )

  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    () => true,
  )

  const authSessionKey = `${auth.isAuthenticated}:${auth.user?.id ?? ""}`
  const prevAuthSessionKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!hydrated) return

    if (!auth.isAuthenticated) {
      queryClient.removeQueries({
        queryKey: authKeys.all,
      })
    }

    if (
      prevAuthSessionKeyRef.current !== null &&
      prevAuthSessionKeyRef.current !== authSessionKey
    ) {
      void router.invalidate()
    }

    prevAuthSessionKeyRef.current = authSessionKey
  }, [auth.isAuthenticated, authSessionKey, hydrated])

  if (!hydrated) {
    return null
  }

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        auth,
      }}
    />
  )
}
