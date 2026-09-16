import { useState } from "react"
import {
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  User,
  Wrench,
} from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { SolicitudResumenCards } from "../components/SolicitudResumenCards"
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
    if (!estado) {
      setSelectedEstado("")
      return
    }
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
        <SolicitudResumenCards
          resumen={resumen}
          isLoading={resumenQuery.isLoading}
          selectedEstado={selectedEstado}
          onSelectEstado={handleSelectEstado}
        />

        {/* Barra de Búsqueda y Filtros */}
        <SolicitudFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedEstado={selectedEstado}
          onClearEstado={() => setSelectedEstado("")}
        />

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
