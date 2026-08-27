import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useSincronizarRoles } from "../api/rol.mutations"
import { rolQueries } from "../api/rol.queries"
import type { Rol } from "../api/rol.service"
import { RolDetailDialog } from "../components/RolDetailDialog"
import { RolHelpModal } from "../components/RolHelpModal"
import { RolListItem } from "../components/RolListItem"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function RolesPage() {
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const search = usePaginatedSearch()
  const syncMutation = useSincronizarRoles()

  const rolesQuery = useQuery(
    rolQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "codigo",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const roles = rolesQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    rolesQuery.data?.totalPages,
  )

  const stats = useMemo(() => {
    const total = rolesQuery.data?.totalElements ?? 0
    const activos = roles.filter((r) => r.activo).length
    const inactivos = roles.filter((r) => !r.activo).length
    return { total, activos, inactivos }
  }, [rolesQuery.data?.totalElements, roles])

  async function handleSync() {
    try {
      await syncMutation.mutateAsync()
      void rolesQuery.refetch()
    } catch {
      // Toast notification is managed by mutation
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
                <Shield className="size-5 sm:size-5.5" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Roles y Permisos
                </h1>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                onRefresh={() => rolesQuery.refetch()}
                isRefreshing={rolesQuery.isFetching}
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
              >
                <HelpCircle className="size-4 text-primary" />
                <span className="sr-only sm:not-sr-only">Guía</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="shrink-0 gap-1.5"
              >
                {syncMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                <span className="sr-only sm:not-sr-only">Sincronizar</span>
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Gestión y sincronización de roles locales con el servidor de identidades Keycloak.
          </p>

          {/* Badges de estadísticas rápidas */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary" className="gap-1.5 py-1 text-xs">
              <ShieldCheck className="size-3 text-muted-foreground" />
              <span>Total: {stats.total}</span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              <span>Activos en página: {stats.activos}</span>
            </Badge>
            {stats.inactivos > 0 && (
              <Badge variant="destructive" className="gap-1.5 py-1 text-xs">
                <ShieldAlert className="size-3" />
                <span>Inactivos en página: {stats.inactivos}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            onRefresh={() => rolesQuery.refetch()}
            isRefreshing={rolesQuery.isFetching}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía Keycloak</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="gap-1.5"
          >
            {syncMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            <span>Sincronizar con Keycloak</span>
          </Button>
        </div>
      </header>

      {/* Buscador */}
      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción del rol…"
          aria-label="Buscar roles"
          className="w-full min-w-0"
        />
      </div>

      {/* Content Section - Compact List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {rolesQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-14 rounded-lg"
            className="flex flex-col gap-2"
          />
        ) : rolesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(rolesQuery.error)}
            className="text-destructive"
          />
        ) : roles.length === 0 ? (
          <EmptyState
            icon={<Shield className="size-6 text-muted-foreground" />}
            title={
              search.search.trim()
                ? "Sin resultados para tu búsqueda"
                : "No hay roles sincronizados"
            }
            description={
              search.search.trim()
                ? "Prueba buscando con otro término."
                : "Ejecuta la sincronización con Keycloak para cargar los roles del sistema."
            }
            action={
              search.search.trim() ? undefined : (
                <Button
                  size="sm"
                  type="button"
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                  className="gap-1.5"
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Sincronizar ahora
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                rolesQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                {roles.map((rol) => (
                  <RolListItem
                    key={rol.id}
                    rol={rol}
                    onSelect={(r) => setSelectedRol(r)}
                  />
                ))}
              </ul>
            </div>

            {rolesQuery.data ? (
              <Pagination
                page={rolesQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Detalle Modal */}
      <RolDetailDialog
        key={selectedRol?.id ?? "empty-detail"}
        rol={selectedRol}
        open={Boolean(selectedRol)}
        onOpenChange={(open) => !open && setSelectedRol(null)}
      />

      {/* Help Guide Modal */}
      <RolHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />
    </PageShell>
  )
}
