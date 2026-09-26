import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertCircle,
  Calendar,
  FileCheck,
  FileCode2,
  FileSignature,
  FileText,
  Filter,
  FilterX,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCw,
  Search,
  SearchX,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { formatDate } from "@/shared/lib/format-date"

import { useDeleteTipoSolicitudVehicular } from "../api/tipo-solicitud.mutations"
import { tipoSolicitudVehicularQueries } from "../api/tipo-solicitud.queries"
import type { TipoSolicitudVehicular } from "../api/tipo-solicitud.service"
import { TipoSolicitudFormDialog } from "../components/TipoSolicitudFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type ViewMode = "table" | "grid"

// ==========================================
// HELPERS PUROS Y TIPADOS
// ==========================================

/**
 * Formatea los días de anticipación de forma amigable para la UI.
 */
function formatAnticipacion(dias: number): string {
  if (dias === 0) return "Inmediato"
  if (dias === 1) return "1 día antes"
  return `${dias} días antes`
}

/**
 * Formatea una fecha ISO o cadena temporal a formato legible.
 */
function formatFecha(fecha?: string | null): string {
  if (!fecha) return "-"
  return formatDate(fecha)
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function TiposSolicitudPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoSolicitudVehicular | null>(null)
  const [deleting, setDeleting] = useState<TipoSolicitudVehicular | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteTipoSolicitudVehicular()

  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "codigo",
      direction: "ASC" as const,
      ...(search.query && { search: search.query }),
    }),
    [search.page, search.query]
  )

  const tiposQuery = useQuery(tipoSolicitudVehicularQueries.list(queryParams))

  // Consulta en caché para métricas globales
  const allTiposQuery = useQuery({
    ...tipoSolicitudVehicularQueries.list({ size: 1000 }),
    staleTime: 1000 * 60 * 3, // 3 minutos
  })

  const tiposSolicitud = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content]
  )

  // Métricas reales calculadas en memoria
  const kpiStats = useMemo(() => {
    const list = allTiposQuery.data?.content ?? tiposSolicitud
    const total = allTiposQuery.data?.totalElements ?? list.length

    let conRespaldo = 0
    let conJustificacion = 0

    for (const item of list) {
      if (item.requiereRespaldo) conRespaldo++
      if (item.requiereJustificacion) conJustificacion++
    }

    return { total, conRespaldo, conJustificacion }
  }, [allTiposQuery.data, tiposSolicitud])

  useClampPage(search.page, search.setPage, tiposQuery.data?.totalPages)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (tipo: TipoSolicitudVehicular) => {
    setEditing(tipo)
    setDialogOpen(true)
  }

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditing(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Manejado por la mutación con toast
    }
  }

  const hasActiveFilters = Boolean(search.search.trim())

  const resetFilters = () => {
    search.setSearch("")
  }

  // Definición de columnas consolidadas para la tabla
  const columns = useMemo<ColumnDef<TipoSolicitudVehicular>[]>(
    () => [
      {
        accessorKey: "codigo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Código" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-2 py-0.5">
              <Badge
                variant="outline"
                className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted/60 text-foreground border-border/60"
              >
                {item.codigo}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tipo / Motivo" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex flex-col min-w-0 py-0.5 max-w-sm md:max-w-md">
              <span
                className="text-sm font-medium text-foreground truncate"
                title={item.nombre}
              >
                {item.nombre}
              </span>
              {item.descripcion ? (
                <span
                  className="text-xs text-muted-foreground truncate line-clamp-1"
                  title={item.descripcion}
                >
                  {item.descripcion}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/50 italic">
                  Sin descripción
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "diasAnticipacion",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Anticipación" hideSortMenu />
        ),
        cell: ({ row }) => {
          const dias = row.original.diasAnticipacion ?? 0
          return (
            <div className="flex items-center py-0.5 whitespace-nowrap">
              <Badge
                variant="outline"
                className="font-normal text-xs px-2 py-0.5 bg-muted/40 text-muted-foreground border-border/60"
              >
                {formatAnticipacion(dias)}
              </Badge>
            </div>
          )
        },
      },
      {
        id: "requerimientos",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Requisitos" hideSortMenu />
        ),
        cell: ({ row }) => {
          const { requiereRespaldo, requiereJustificacion } = row.original
          if (!requiereRespaldo && !requiereJustificacion) {
            return (
              <span className="text-xs text-muted-foreground/60 italic">
                Ninguno
              </span>
            )
          }
          return (
            <div className="flex items-center gap-1.5 flex-wrap py-0.5">
              {requiereJustificacion && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium px-1.5 py-0.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                >
                  Justificación
                </Badge>
              )}
              {requiereRespaldo && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-medium px-1.5 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  Respaldo
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const item = row.original
          const rawDate = item.auditoria?.createdAt || item.createdAt

          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {rawDate && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <div className="hidden sm:flex size-7 items-center justify-center rounded-md text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-help">
                        <Calendar className="size-3.5" />
                      </div>
                    }
                  />
                  <TooltipContent side="left">
                    <p className="text-xs">Registrado: {formatFecha(rawDate)}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                      title="Opciones"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => openEdit(item)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleting(item)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <TooltipProvider>
      <div className="flex w-full flex-col gap-3.5 px-2 sm:px-4 pt-2 pb-6 max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <FileText className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Tipos de Solicitud
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <ShieldCheck className="size-3" />
                  Gestión Vehicular
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                Configura los tipos de solicitud vehicular, anticipación y requisitos asociados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <RefreshButton
              isRefreshing={tiposQuery.isFetching}
              onRefresh={() => {
                tiposQuery.refetch()
                allTiposQuery.refetch()
              }}
              className="h-8 w-8 rounded-lg px-0"
              iconClassName="size-3.5"
            />
            <Button
              size="sm"
              onClick={openCreate}
              className="h-8 flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nuevo Tipo</span>
            </Button>
          </div>
        </div>

        {/* TARJETAS DE RESUMEN (KPIS) */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Total Tipos */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Tipos
              </p>
              {allTiposQuery.isPending && !allTiposQuery.data ? (
                <Skeleton className="mt-0.5 h-5 w-8 rounded" />
              ) : (
                <p className="font-heading text-lg font-bold leading-none tracking-tight text-foreground mt-0.5">
                  {kpiStats.total}
                </p>
              )}
            </div>
          </div>

          {/* Con Respaldo */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs">
              <FileCheck className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Con Respaldo
                </p>
                <span className="size-1 rounded-full bg-blue-500" />
              </div>
              {allTiposQuery.isPending && !allTiposQuery.data ? (
                <Skeleton className="mt-0.5 h-5 w-8 rounded" />
              ) : (
                <p className="font-heading text-lg font-bold leading-none tracking-tight text-blue-600 dark:text-blue-400 mt-0.5">
                  {kpiStats.conRespaldo}
                </p>
              )}
            </div>
          </div>

          {/* Requieren Justificación */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-2xs">
              <FileSignature className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Requieren Justificación
                </p>
                <span className="size-1 rounded-full bg-purple-500" />
              </div>
              {allTiposQuery.isPending && !allTiposQuery.data ? (
                <Skeleton className="mt-0.5 h-5 w-8 rounded" />
              ) : (
                <p className="font-heading text-lg font-bold leading-none tracking-tight text-purple-600 dark:text-purple-400 mt-0.5">
                  {kpiStats.conJustificacion}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ERROR BANNER */}
        {tiposQuery.isError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <p className="font-medium">
                Ocurrió un error al cargar los tipos de solicitud.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => tiposQuery.refetch()}
              className="h-7 gap-1.5 rounded-md border-destructive/30 bg-background/80 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer"
            >
              <RotateCw className="size-3" />
              Reintentar
            </Button>
          </div>
        )}

        {/* CONTENEDOR UNIFICADO: FILTROS + TABLA + PAGINACIÓN */}
        <div className="flex-1 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-xs backdrop-blur-sm flex flex-col transition-all">
          {/* BARRA DE FILTROS & BÚSQUEDA */}
          <div className="flex flex-col bg-card/60 backdrop-blur-md">
            <div className="flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    placeholder="Buscar por código, nombre o descripción..."
                    value={search.search}
                    onChange={(e) => search.setSearch(e.target.value)}
                    className="pl-8 pr-7 h-8 text-xs rounded-lg bg-background/70 border-border/60 focus-visible:ring-primary/25 placeholder:text-muted-foreground/60 shadow-2xs"
                  />
                  {search.search && (
                    <button
                      type="button"
                      onClick={() => search.setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground p-0.5 cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Selector de modo de vista */}
              <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-2xs">
                <Button
                  size="sm"
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  type="button"
                  onClick={() => setViewMode("table")}
                  className="h-6.5 px-2.5 text-xs gap-1.5 rounded-md font-medium transition-all cursor-pointer"
                  title="Vista tabular compacta"
                >
                  <List className="size-3.5" />
                  <span>Tabla</span>
                </Button>

                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className="h-6.5 px-2.5 text-xs gap-1.5 rounded-md font-medium transition-all cursor-pointer"
                  title="Vista en tarjetas"
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Tarjetas</span>
                </Button>
              </div>
            </div>

            {/* Fila de Filtros Activos (Chips) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 bg-muted/15 border-b border-border/40 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                  <Filter className="size-3" />
                  <span>Filtros:</span>
                </div>

                <Badge
                  variant="secondary"
                  className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-background border border-border/60"
                >
                  <span>Texto: &quot;{search.search}&quot;</span>
                  <button
                    type="button"
                    onClick={() => search.setSearch("")}
                    className="hover:text-destructive cursor-pointer ml-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1 ml-auto cursor-pointer"
                >
                  <FilterX className="size-3" />
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>

          {/* VISTA PRINCIPAL (TABLA / TARJETAS) */}
          <div className="flex-1 min-h-0">
            {viewMode === "grid" ? (
              <div className="p-3.5">
                {tiposQuery.isLoading && tiposSolicitud.length === 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="p-4 rounded-xl border border-border/60">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="size-9 rounded-lg" />
                          <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-10 w-full mb-3" />
                        <div className="flex justify-between items-center pt-2 border-t border-border/40">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-6 w-14" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : tiposSolicitud.length === 0 ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/60 shadow-2xs">
                      {hasActiveFilters ? (
                        <SearchX className="size-6 text-muted-foreground" />
                      ) : (
                        <FileText className="size-6 text-primary" />
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">
                      {hasActiveFilters
                        ? "Sin resultados para tu búsqueda"
                        : "No hay tipos de solicitud registrados."}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                      {hasActiveFilters
                        ? `No se encontraron coincidencias para "${search.search}". Intenta con otro término o limpia el filtro.`
                        : "Registra los motivos y clasificaciones de solicitud vehicular para gestionar la flota."}
                    </p>
                    {hasActiveFilters ? (
                      <Button
                        onClick={resetFilters}
                        variant="outline"
                        size="sm"
                        className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/70 cursor-pointer shadow-2xs"
                      >
                        Limpiar búsqueda
                      </Button>
                    ) : (
                      <Button
                        onClick={openCreate}
                        size="sm"
                        className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        Crear primer tipo
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tiposSolicitud.map((tipo) => {
                      const rawDate = tipo.auditoria?.createdAt || tipo.createdAt
                      return (
                        <Card
                          key={tipo.id}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card/70 hover:bg-card/95 hover:border-border transition-all duration-200 shadow-2xs hover:shadow-xs p-3.5"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                                  <FileCode2 className="size-4" />
                                </div>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted/60 border-border/60"
                                >
                                  {tipo.codigo}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                                        title="Opciones"
                                      >
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    }
                                  />
                                  <DropdownMenuContent align="end" className="w-36">
                                    <DropdownMenuItem
                                      onClick={() => openEdit(tipo)}
                                      className="cursor-pointer gap-2 text-xs"
                                    >
                                      <Pencil className="size-3.5" />
                                      <span>Editar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => setDeleting(tipo)}
                                      className="cursor-pointer gap-2 text-xs"
                                    >
                                      <Trash2 className="size-3.5" />
                                      <span>Eliminar</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <h4 className="text-sm font-medium text-foreground truncate" title={tipo.nombre}>
                              {tipo.nombre}
                            </h4>

                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
                              {tipo.descripcion || (
                                <span className="italic text-muted-foreground/60">
                                  Sin descripción
                                </span>
                              )}
                            </p>

                            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                              <Badge
                                variant="outline"
                                className="font-normal text-xs px-2 py-0.5 bg-muted/40 text-muted-foreground border-border/60"
                              >
                                {formatAnticipacion(tipo.diasAnticipacion ?? 0)}
                              </Badge>
                              {tipo.requiereJustificacion && (
                                <Badge
                                  variant="outline"
                                  className="text-[11px] font-medium px-1.5 py-0.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                                >
                                  Justificación
                                </Badge>
                              )}
                              {tipo.requiereRespaldo && (
                                <Badge
                                  variant="outline"
                                  className="text-[11px] font-medium px-1.5 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                >
                                  Respaldo
                                </Badge>
                              )}
                            </div>
                          </div>

                          {rawDate && (
                            <div className="flex items-center justify-between border-t border-border/50 pt-2.5 mt-2.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="size-3 text-muted-foreground/70" />
                                <span>{formatFecha(rawDate)}</span>
                              </div>
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={tiposSolicitud}
                isLoading={tiposQuery.isLoading}
                emptyTitle={
                  hasActiveFilters
                    ? "Sin resultados para tu búsqueda"
                    : "No hay tipos de solicitud registrados."
                }
                emptyDescription={
                  hasActiveFilters
                    ? `No se encontraron coincidencias para "${search.search}". Intenta con otro término o limpia el filtro.`
                    : "Registra los motivos y clasificaciones de solicitud vehicular para gestionar la flota."
                }
                emptyIcon={
                  hasActiveFilters ? (
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/60 shadow-2xs">
                      <SearchX className="size-6 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
                      <FileText className="size-6" />
                    </div>
                  )
                }
                emptyAction={
                  hasActiveFilters ? (
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      size="sm"
                      className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/70 cursor-pointer shadow-2xs"
                    >
                      Limpiar búsqueda
                    </Button>
                  ) : (
                    <Button
                      onClick={openCreate}
                      size="sm"
                      className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Crear primer tipo
                    </Button>
                  )
                }
                density="compact"
                stickyHeader
                containerClassName="gap-0"
                className="border-0 rounded-none shadow-none"
              />
            )}
          </div>

          {/* PAGINACIÓN AL PIE DEL CONTENEDOR */}
          {tiposQuery.data && tiposSolicitud.length > 0 && (
            <div className="border-t border-border/60 bg-muted/20">
              <Pagination
                page={tiposQuery.data}
                onPageChange={search.setPage}
              />
            </div>
          )}
        </div>

        {/* MODAL DE CREACIÓN / EDICIÓN */}
        {dialogOpen && (
          <TipoSolicitudFormDialog
            open={dialogOpen}
            onOpenChange={handleCloseDialog}
            tipoSolicitud={editing}
          />
        )}

        {deleting && (
          <ConfirmDeleteDialog
            open={Boolean(deleting)}
            onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
            title="Eliminar tipo de solicitud"
            description={`¿Estás seguro de que deseas eliminar el tipo de solicitud "${deleting.nombre}" (${deleting.codigo})?`}
            onConfirm={handleDelete}
            isPending={deleteMutation.isPending}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
