import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
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
import { RolMasterItem } from "../components/RolMasterItem"
import { RolMenuDetailPanel } from "../components/RolMenuDetailPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function RolesPage() {
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [detailModalRol, setDetailModalRol] = useState<Rol | null>(null)
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

  // Auto-selección inteligente del primer rol disponible en escritorio
  useEffect(() => {
    if (roles.length > 0) {
      if (selectedRol) {
        const updated = roles.find((r) => r.id === selectedRol.id)
        if (updated) {
          setSelectedRol(updated)
        } else if (window.innerWidth >= 1024) {
          setSelectedRol(roles[0])
        }
      } else if (window.innerWidth >= 1024) {
        setSelectedRol(roles[0])
      }
    } else {
      setSelectedRol(null)
    }
  }, [roles])

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
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-4 md:px-6 md:py-0">
      {/* Header Compacto y Moderno */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:py-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shadow-2xs">
                <Shield className="size-4.5" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl text-foreground">
                  Roles y Permisos
                </h1>

                {/* Badges de métricas rápidas */}
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="gap-1 py-0 px-1.5 text-[10.5px] font-mono h-5">
                    <ShieldCheck className="size-2.5 text-muted-foreground" />
                    <span>Total: {stats.total}</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1 py-0 px-1.5 text-[10.5px] font-mono h-5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                  >
                    <CheckCircle2 className="size-2.5" />
                    <span>{stats.activos} activos</span>
                  </Badge>
                  {stats.inactivos > 0 && (
                    <Badge variant="destructive" className="gap-1 py-0 px-1.5 text-[10.5px] font-mono h-5">
                      <ShieldAlert className="size-2.5" />
                      <span>{stats.inactivos} inactivos</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                onRefresh={() => rolesQuery.refetch()}
                isRefreshing={rolesQuery.isFetching}
                className="h-7 w-7"
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="h-7 px-2 text-xs"
              >
                <HelpCircle className="size-3.5 text-primary" />
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                className="h-7 gap-1 px-2 text-xs"
              >
                {syncMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
                <span>Sync</span>
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1">
            Gestión y sincronización de roles con Keycloak y asignación interactiva de menús por rol.
          </p>
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 self-center md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            onRefresh={() => rolesQuery.refetch()}
            isRefreshing={rolesQuery.isFetching}
            className="h-7.5"
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="h-7.5 gap-1.5 text-xs border-border/80 hover:bg-muted px-2.5 cursor-pointer"
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span>Guía Keycloak</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="h-7.5 gap-1.5 text-xs px-3 cursor-pointer"
          >
            {syncMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span>Sincronizar con Keycloak</span>
          </Button>
        </div>
      </header>

      {/* Layout Maestro - Detalle */}
      <div className="flex min-h-0 flex-1 gap-3.5 py-3 overflow-hidden">
        {/* PANEL MAESTRO (Lista de Roles) */}
        <div
          className={cn(
            "flex min-h-0 flex-col overflow-hidden w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-2",
            selectedRol ? "hidden lg:flex" : "flex",
          )}
        >
          {/* Buscador de Roles */}
          <div className="shrink-0">
            <SearchField
              value={search.search}
              onChange={search.setSearch}
              placeholder="Buscar rol por código o nombre…"
              aria-label="Buscar roles"
              className="w-full h-7.5 text-xs"
            />
          </div>

          {/* Lista de Roles con diseño Card */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            {rolesQuery.isLoading ? (
              <div className="p-2.5">
                <ListSkeleton
                  rows={7}
                  rowClassName="h-14 rounded-xl"
                  className="flex flex-col gap-1.5"
                />
              </div>
            ) : rolesQuery.isError ? (
              <EmptyState
                title={getErrorMessage(rolesQuery.error)}
                className="text-destructive p-4"
              />
            ) : roles.length === 0 ? (
              <div className="p-4 flex flex-col items-center justify-center flex-1 text-center">
                <EmptyState
                  icon={<Shield className="size-6 text-muted-foreground/60" />}
                  title={
                    search.search.trim()
                      ? "Sin resultados"
                      : "No hay roles sincronizados"
                  }
                  description={
                    search.search.trim()
                      ? "Ningún rol coincide con la búsqueda."
                      : "Ejecuta la sincronización con Keycloak para cargar los roles."
                  }
                  action={
                    search.search.trim() ? (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => search.setSearch("")}
                        className="gap-1 h-7 text-xs mt-1"
                      >
                        <X className="size-3" />
                        Limpiar búsqueda
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        type="button"
                        onClick={handleSync}
                        disabled={syncMutation.isPending}
                        className="gap-1 h-7 text-xs mt-1"
                      >
                        {syncMutation.isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3" />
                        )}
                        Sincronizar
                      </Button>
                    )
                  }
                />
              </div>
            ) : (
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto p-1.5 space-y-1 overscroll-contain",
                  rolesQuery.isFetching && "opacity-70",
                )}
              >
                {roles.map((rol) => (
                  <RolMasterItem
                    key={rol.id}
                    rol={rol}
                    isSelected={selectedRol?.id === rol.id}
                    onSelect={(r) => setSelectedRol(r)}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {rolesQuery.data && rolesQuery.data.totalPages > 1 && (
              <div className="shrink-0 border-t border-border/70 bg-muted/20 px-1 py-1">
                <Pagination
                  page={rolesQuery.data}
                  onPageChange={search.setPage}
                  className="border-0 px-0 py-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* PANEL DETALLE (Árbol Rol-Menu y Permisos) */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            selectedRol ? "flex" : "hidden lg:flex",
          )}
        >
          <RolMenuDetailPanel
            key={selectedRol?.id ?? "no-role-selected"}
            rol={selectedRol}
            onBackToMaster={() => setSelectedRol(null)}
            onOpenDetailDialog={(r) => setDetailModalRol(r)}
          />
        </div>
      </div>

      {/* Detalle Técnico / Auditoría Modal */}
      <RolDetailDialog
        key={detailModalRol?.id ?? "empty-detail"}
        rol={detailModalRol}
        open={Boolean(detailModalRol)}
        onOpenChange={(open) => !open && setDetailModalRol(null)}
      />

      {/* Modal Guía Keycloak */}
      <RolHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />
    </PageShell>
  )
}
