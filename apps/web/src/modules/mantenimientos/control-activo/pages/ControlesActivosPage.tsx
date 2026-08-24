import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  Plus,
  Search,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteControlActivo } from "../api/control-activo.mutations"
import { controlActivoQueries } from "../api/control-activo.queries"
import type { TipoControlActivo } from "../api/control-activo.service"
import { ControlActivoListView } from "../components/ControlActivoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ControlesActivosPage() {
  const search = usePaginatedSearch()
  const deleteMutation = useDeleteControlActivo()

  const [tipoFilter, setTipoFilter] = useState<string>("ALL")
  const [conformidadFilter, setConformidadFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const queryFilters = useMemo(() => {
    return {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "fecha",
      direction: "DESC" as const,
      tipo:
        tipoFilter !== "ALL" ? (tipoFilter as TipoControlActivo) : undefined,
    }
  }, [search.page, tipoFilter])

  const controlesQuery = useQuery(controlActivoQueries.list(queryFilters))
  const rawControles = controlesQuery.data?.content ?? []

  // Filtrado local por conformidad o búsqueda si aplica
  const controles = useMemo(() => {
    return rawControles.filter((c) => {
      if (conformidadFilter === "CONFORME" && !c.conforme) return false
      if (conformidadFilter === "NO_CONFORME" && c.conforme) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchActivo =
          c.activo?.codigo.toLowerCase().includes(q) ||
          c.activo?.nombre.toLowerCase().includes(q)
        const matchEntregado = c.entregadoPor?.nombre
          .toLowerCase()
          .includes(q)
        const matchRecibido = c.recibidoPor?.nombre.toLowerCase().includes(q)
        if (!matchActivo && !matchEntregado && !matchRecibido) return false
      }
      return true
    })
  }, [rawControles, conformidadFilter, searchQuery])

  const totalCount = controlesQuery.data?.totalElements ?? rawControles.length

  const entregasCount = useMemo(
    () => rawControles.filter((c) => c.tipo === "ENTREGA").length,
    [rawControles],
  )
  const devolucionesCount = useMemo(
    () => rawControles.filter((c) => c.tipo === "DEVOLUCION").length,
    [rawControles],
  )
  const noConformesCount = useMemo(
    () => rawControles.filter((c) => !c.conforme).length,
    [rawControles],
  )

  useClampPage(
    search.page,
    search.setPage,
    controlesQuery.data?.totalPages,
  )

  function handleDelete(id: string) {
    if (confirm("¿Estás seguro de que deseas eliminar este control de activo?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8.5 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs">
                <ClipboardCheck className="size-5" />
              </div>
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                Control de Activos y Accesorios
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {totalCount} actas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <Link to={routes.mantenimientos.controlesActivos.nuevo}>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs font-semibold gap-1 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Plus className="size-3.5" />
                  <span>Nuevo</span>
                </Button>
              </Link>
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => controlesQuery.refetch()}
                isRefreshing={controlesQuery.isFetching}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Registro y verificación de actas de entrega, devolución e inspección de accesorios y componentes.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-2">
          <Link to={routes.mantenimientos.controlesActivos.nuevo}>
            <Button
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nuevo Control de Activo</span>
            </Button>
          </Link>
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
            onRefresh={() => controlesQuery.refetch()}
            isRefreshing={controlesQuery.isFetching}
          />
        </div>
      </header>

      {/* Mini Dashboard de Métricas Rápidas */}
      <div className="shrink-0 pt-2.5 pb-1">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Total Controles */}
          <div
            onClick={() => {
              setTipoFilter("ALL")
              setConformidadFilter("ALL")
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              tipoFilter === "ALL" && conformidadFilter === "ALL"
                ? "bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/30"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
              <ClipboardCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Total Actas
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalCount}
              </p>
            </div>
          </div>

          {/* Actas de Entrega */}
          <div
            onClick={() => {
              setTipoFilter("ENTREGA")
              setConformidadFilter("ALL")
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              tipoFilter === "ENTREGA"
                ? "bg-sky-500/15 border-sky-500/50 ring-1 ring-sky-500/30"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300">
              <span className="text-[11px] font-bold">ENT</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 truncate">
                Entregas
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {entregasCount}
              </p>
            </div>
          </div>

          {/* Actas de Devolución */}
          <div
            onClick={() => {
              setTipoFilter("DEVOLUCION")
              setConformidadFilter("ALL")
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              tipoFilter === "DEVOLUCION"
                ? "bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/30"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <span className="text-[11px] font-bold">DEV</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 truncate">
                Devoluciones
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {devolucionesCount}
              </p>
            </div>
          </div>

          {/* Con Observaciones / No conformes */}
          <div
            onClick={() => {
              setConformidadFilter((prev) =>
                prev === "NO_CONFORME" ? "ALL" : "NO_CONFORME",
              )
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              conformidadFilter === "NO_CONFORME"
                ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 truncate">
                Con Observaciones
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                {noConformesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex items-center justify-between gap-2 py-2 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por activo, entregado o recibido…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs rounded-lg shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={tipoFilter}
            onValueChange={(val) => setTipoFilter(val ?? "ALL")}
          >
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue placeholder="Tipo de Acta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los Tipos</SelectItem>
              <SelectItem value="ENTREGA">Solo Entregas</SelectItem>
              <SelectItem value="DEVOLUCION">Solo Devoluciones</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={conformidadFilter}
            onValueChange={(val) => setConformidadFilter(val ?? "ALL")}
          >
            <SelectTrigger className="h-8 text-xs w-38">
              <SelectValue placeholder="Conformidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las Actas</SelectItem>
              <SelectItem value="CONFORME">Solo Conformes</SelectItem>
              <SelectItem value="NO_CONFORME">Con Observaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-1">
        {controlesQuery.isLoading ? (
          <ListSkeleton
            rows={5}
            rowClassName="h-20 rounded-xl"
            className="space-y-2"
          />
        ) : controlesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(controlesQuery.error)}
            className="text-destructive"
          />
        ) : controles.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-9 text-sky-500" />}
            title="No hay actas de control registradas"
            description="Genera un acta de entrega o devolución para controlar el estado y accesorios del activo."
            action={
              <Link to={routes.mantenimientos.controlesActivos.nuevo}>
                <Button
                  size="sm"
                  className="text-xs font-semibold gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Plus className="size-3.5" />
                  <span>Nuevo Control de Activo</span>
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-0.5",
                controlesQuery.isFetching && "opacity-75",
              )}
            >
              <ControlActivoListView
                controles={controles}
                onDelete={handleDelete}
              />
            </div>

            {controlesQuery.data ? (
              <Pagination
                page={controlesQuery.data}
                onPageChange={search.setPage}
                className="border-t pt-2 shrink-0 text-xs"
              />
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  )
}
