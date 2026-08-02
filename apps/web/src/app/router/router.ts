import { createRouter } from "@tanstack/react-router"

import { queryClient } from "../query/queryClient"
import type { RouterContext } from "./router.context"
import { routeTree } from "./routeTree.gen"

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    // Se inyecta desde RouterApp con el estado real de auth
    auth: undefined!,
  } satisfies RouterContext,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
