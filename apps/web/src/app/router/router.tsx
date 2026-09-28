import { createRouter } from "@tanstack/react-router"

import { queryClient } from "../query/queryClient"
import type { RouterContext } from "./router.context"
import { routeTree } from "./routeTree.gen"

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  } satisfies RouterContext,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultNotFoundComponent: () => {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">404 - No Encontrado</h1>
        <p className="text-zinc-500 dark:text-zinc-400">La página que buscas no existe o ha sido movida.</p>
      </div>
    )
  },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
