import { Link, Outlet, createFileRoute, redirect, useLocation } from "@tanstack/react-router"
import { AlertTriangle, Home, RefreshCw, ShieldAlert } from "lucide-react"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { DashboardLayout } from "@/layouts/dashboard-layout/DashboardLayout"
import { authQueries } from "@/modules/auth/api/auth.queries"
import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import { isApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  isAdminUser,
  isAlwaysAllowedDashboardPath,
  isRouteAuthorized,
  useAllowedNavItems,
} from "@/shared/hooks/use-allowed-nav-items"

function buildLoginRedirect(pathname: string, searchStr: string) {
  const target = `${pathname}${searchStr}`
  return redirect({
    to: "/login",
    search:
      target && target !== routes.home
        ? { redirect: target }
        : undefined,
  })
}

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw buildLoginRedirect(location.pathname, location.searchStr)
    }

    try {
      const user = await context.queryClient.ensureQueryData(
        authQueries.me(),
      )
      const { accessToken, refreshToken } = useAuthStore.getState()

      if (accessToken) {
        useAuthStore.getState().setSession({
          user,
          accessToken,
          refreshToken,
        })
      }
    } catch (error) {
      // El interceptor ya limpia la sesión si el refresh falla.
      if (!useAuthStore.getState().isAuthenticated) {
        throw buildLoginRedirect(location.pathname, location.searchStr)
      }

      // Solo expulsar por 401; no tumbar la sesión por red/5xx.
      if (isApiError(error) && error.status === 401) {
        useAuthStore.getState().clearSession()
        throw buildLoginRedirect(location.pathname, location.searchStr)
      }
    }

    try {
      await context.queryClient.ensureQueryData(menuQueries.misMenus())
    } catch {
      // Si falla la carga de menús por red/5xx, DashboardRoute muestra un estado controlado.
    }
  },
  component: DashboardRoute,
})

function DashboardRoute() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const { allowedRoutes, isLoading, isError, refetch } = useAllowedNavItems()

  const bypassCheck =
    isAlwaysAllowedDashboardPath(location.pathname) ||
    isAdminUser(user?.roles)

  if (!bypassCheck && isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (!bypassCheck && isError) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-heading text-xl font-bold text-foreground">
                No se pudieron verificar tus permisos
              </h1>
              <p className="text-sm text-muted-foreground">
                Ocurrió un error al consultar los menús autorizados para tu cuenta. Intenta nuevamente.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button variant="outline" onClick={() => void refetch()} className="gap-2">
                <RefreshCw className="size-4" />
                Reintentar
              </Button>
              <Button render={<Link to={routes.home} />} className="gap-2">
                <Home className="size-4" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const authorized =
    bypassCheck ||
    isRouteAuthorized(location.pathname, allowedRoutes, user?.roles)

  if (!authorized) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[65vh] items-center justify-center p-6">
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card p-8 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-7" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Error 403
              </p>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                Sin permisos
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No cuentas con permisos asignados para acceder a esta sección del sistema. Si necesitas acceso, solicita la asignación a un administrador.
              </p>
            </div>
            <Button render={<Link to={routes.home} />} className="mt-2 gap-2">
              <Home className="size-4" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
