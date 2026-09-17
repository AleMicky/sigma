import { useEffect } from "react"
import { Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router"

import type { RouterContext } from "@/app/router/router.context"
import { generateBreadcrumbs } from "@/layouts/dashboard-layout/AppBreadcrumb"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    if (pathname === "/login") {
      document.title = "SIGMA | Iniciar Sesión"
      return
    }

    const breadcrumbs = generateBreadcrumbs(pathname)
    const segments = breadcrumbs
      .filter((_, idx) => !(idx === 0 && breadcrumbs.length > 1))
      .map((item) => item.title)

    if (segments.length > 0) {
      document.title = `SIGMA | ${segments.join(" › ")}`
    } else {
      document.title = "SIGMA"
    }
  }, [pathname])

  return <Outlet />
}
