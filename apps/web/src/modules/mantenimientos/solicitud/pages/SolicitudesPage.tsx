import { useState } from "react"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileEdit,
  FileText,
  Loader2,
  User,
  Wrench,
} from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"

export function SolicitudesPage() {
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const query = useSolicitudes({
    interfaz: "SolicitudesPage",
    ...(selectedEstado ? { estado: selectedEstado } : {}),
    ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
  })
  const resumenQuery = useSolicitudResumen()

  const solicitudes = query.data?.content ?? []
  const resumen = resumenQuery.data

  const handleSelectEstado = (estado: string) => {
    setSelectedEstado((prev) => (prev === estado ? "" : estado))
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      <SolicitudHeader
        queries={[query, resumenQuery]}
        totalCount={resumen?.total ?? query.data?.totalElements}
        onRefresh={() => {
          query.refetch()
          resumenQuery.refetch()
        }}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {/* Total */}
          <button
            type="button"
            onClick={() => setSelectedEstado("")}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
              !selectedEstado
                ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
            )}
          >
            <span
              className={cn(
                "flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                !selectedEstado
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-primary/10 text-primary",
              )}
            >
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Total
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-foreground">
                {resumenQuery.isLoading ? "..." : (resumen?.total ?? 0)}
              </p>
            </div>
          </button>

          {/* Borradores */}
          <button
            type="button"
            onClick={() => handleSelectEstado("borrador")}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
              selectedEstado === "borrador"
                ? "border-zinc-400 bg-muted ring-1 ring-zinc-400/40"
                : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
            )}
          >
            <span
              className={cn(
                "flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                selectedEstado === "borrador"
                  ? "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 shadow-2xs"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <FileEdit className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Borradores
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-foreground">
                {resumenQuery.isLoading ? "..." : (resumen?.borradores ?? 0)}
              </p>
            </div>
          </button>

          {/* En Revisión */}
          <button
            type="button"
            onClick={() => handleSelectEstado("en_revision")}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
              selectedEstado === "en_revision"
                ? "border-amber-500/60 bg-amber-500/15 ring-1 ring-amber-500/40"
                : "border-border/70 bg-card hover:border-amber-500/40 hover:bg-amber-500/5",
            )}
          >
            <span
              className={cn(
                "flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                selectedEstado === "en_revision"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
              )}
            >
              <Clock className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider truncate">
                En Revisión
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {resumenQuery.isLoading ? "..." : (resumen?.enRevision ?? 0)}
              </p>
            </div>
          </button>

          {/* En Proceso */}
          <button
            type="button"
            onClick={() => handleSelectEstado("en_proceso")}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
              selectedEstado === "en_proceso"
                ? "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30"
                : "border-border/70 bg-card hover:border-blue-500/30 hover:bg-blue-500/5",
            )}
          >
            <span
              className={cn(
                "flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                selectedEstado === "en_proceso"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              )}
            >
              <Wrench className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                En Proceso
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {resumenQuery.isLoading ? "..." : (resumen?.enProceso ?? 0)}
              </p>
            </div>
          </button>

          {/* Finalizadas */}
          <button
            type="button"
            onClick={() => handleSelectEstado("finalizada")}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer col-span-2 sm:col-span-1",
              selectedEstado === "finalizada"
                ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "border-border/70 bg-card hover:border-emerald-500/30 hover:bg-emerald-500/5",
            )}
          >
            <span
              className={cn(
                "flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                selectedEstado === "finalizada"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              <CheckCircle2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Finalizadas
              </p>
              <p className="font-heading text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {resumenQuery.isLoading ? "..." : (resumen?.finalizadas ?? 0)}
              </p>
            </div>
          </button>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por número o título…"
            className="w-full max-w-sm sm:max-w-md"
          />

          {selectedEstado && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Filtrado por:</span>
              <Badge variant="secondary" className="gap-1 text-xs capitalize">
                {selectedEstado.replace("_", " ")}
                <button
                  type="button"
                  onClick={() => setSelectedEstado("")}
                  className="ml-0.5 rounded hover:bg-muted-foreground/20 px-1 py-0.2 cursor-pointer font-bold leading-none"
                  title="Quitar filtro de estado"
                >
                  ×
                </button>
              </Badge>
            </div>
          )}
        </div>

        {/* Listado */}
        {query.isLoading && (
          <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Cargando solicitudes de mantenimiento...</span>
          </div>
        )}

        {query.isError && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Error al cargar las solicitudes de mantenimiento
            </p>
            <p className="text-xs text-muted-foreground">
              {query.error instanceof Error
                ? query.error.message
                : "Ocurrió un error inesperado al consultar la API"}
            </p>
          </div>
        )}

        {!query.isLoading && !query.isError && solicitudes.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-8 opacity-40" />
            <p className="text-sm">
              {debouncedSearch.trim()
                ? `No se encontraron solicitudes que coincidan con "${debouncedSearch.trim()}".`
                : selectedEstado
                  ? `No se encontraron solicitudes con estado "${selectedEstado}".`
                  : "No se encontraron solicitudes de mantenimiento."}
            </p>
            {(searchQuery || selectedEstado) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedEstado("")
                }}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!query.isLoading && !query.isError && solicitudes.length > 0 && (
          <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card shadow-2xs">
            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
                      {solicitud.numero}
                    </span>
                    <h2 className="truncate text-sm font-semibold text-foreground">
                      {solicitud.titulo}
                    </h2>
                    <Badge variant="outline" className="text-[11px] capitalize">
                      {solicitud.estado}
                    </Badge>
                  </div>

                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {solicitud.descripcion}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                    {solicitud.activo && (
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                        <Wrench className="size-3 text-muted-foreground" />
                        {solicitud.activo.codigo} - {solicitud.activo.nombre}
                      </span>
                    )}

                    {solicitud.solicitante && (
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3" />
                        {solicitud.solicitante.nombreCompleto || solicitud.solicitante.nombre}
                      </span>
                    )}

                    {solicitud.fechaSolicitud && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                      </span>
                    )}

                    {solicitud.prioridad && (
                      <span>
                        Prioridad:{" "}
                        <strong className="font-semibold text-foreground">
                          {solicitud.prioridad.nombre}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right sm:self-center">
                  <span className="text-xs text-muted-foreground">
                    {solicitud.tipoMantenimiento?.nombre ?? "Mantenimiento"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
