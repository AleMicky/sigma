import { useEffect, useRef, useSyncExternalStore } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { useShallow } from "zustand/react/shallow"

import { queryClient } from "@/app/query/queryClient"
import { router } from "@/app/router/router"
import { getAuthSessionKey, useAuthStore } from "@/app/store/auth.store"

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

  const authSessionKey = getAuthSessionKey(auth.isAuthenticated, auth.user)
  const prevAuthSessionKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!hydrated) return

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
