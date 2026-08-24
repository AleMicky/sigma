import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Database,
  Eye,
  Layers,
  Pause,
  Play,
  RefreshCw,
  Server,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import type {
  EstadoMigracion,
  MigracionFilters,
  RegistroMigracion,
} from "../api/migracion.service"
import { migracionQueries } from "../api/migracion.queries"
import { MigracionLogDetailModal } from "./MigracionLogDetailModal"
import { MigracionStatusBadge } from "./MigracionStatusBadge"

const PAGE_SIZE = 20

export const MigracionLogViewer: React.FC = () => {
  const [search, setSearch] = useState("")
  const [sistemaOrigen, setSistemaOrigen] = useState("")
  const [entidad, setEntidad] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS")
  const [page, setPage] = useState(0)

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | false>(false)
  const [selectedLog, setSelectedLog] = useState<RegistroMigracion | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)
  const debouncedSistemaOrigen = useDebouncedValue(sistemaOrigen, 300)
  const debouncedEntidad = useDebouncedValue(entidad, 300)

  const activeFilters: MigracionFilters = {
    page,
    size: PAGE_SIZE,
    sort: "fechaRegistro,desc",
    q: debouncedSearch.trim() || undefined,
    sistemaOrigen: debouncedSistemaOrigen.trim() || undefined,
    entidad: debouncedEntidad.trim() || undefined,
    estado: estadoFilter !== "TODOS" ? (estadoFilter as EstadoMigracion) : undefined,
  }

  const { data, isLoading, isFetching, refetch } = useQuery(
    migracionQueries.list(activeFilters, autoRefreshInterval),
  )

  const items = data?.content ?? []

  const handleClearFilters = () => {
    setSearch("")
    setSistemaOrigen("")
    setEntidad("")
    setEstadoFilter("TODOS")
    setPage(0)
  }

  const handleInspectLog = (log: RegistroMigracion) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  const toggleAutoRefresh = () => {
    if (autoRefreshInterval) {
      setAutoRefreshInterval(false)
      toast.info("Auto-actualización desactivada")
    } else {
      setAutoRefreshInterval(5000)
      toast.success("Auto-actualización activada (cada 5s)")
    }
  }

  return (
    <div className="space-y-3 font-sans">
      {/* Compact Filter Toolbar */}
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {["TODOS", "MIGRADO", "ACTUALIZADO", "PENDIENTE", "OMITIDO", "ERROR"].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setEstadoFilter(st)
                    setPage(0)
                  }}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    estadoFilter === st
                      ? st === "ERROR"
                        ? "bg-destructive text-destructive-foreground font-semibold shadow-2xs"
                        : "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ),
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={autoRefreshInterval ? "secondary" : "outline"}
              size="sm"
              onClick={toggleAutoRefresh}
              className="h-7 text-[11px] px-2.5 gap-1"
            >
              {autoRefreshInterval ? (
                <>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Pause className="size-3" /> Vivo (5s)
                </>
              ) : (
                <>
                  <Play className="size-3" /> Auto Off
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-7 text-[11px] px-2 gap-1"
              title="Refrescar logs"
            >
              <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <SearchField
            value={search}
            onChange={(val) => {
              setSearch(val)
              setPage(0)
            }}
            placeholder="Buscar por idOrigen o mensaje..."
            className="w-full"
          />

          <div className="relative">
            <Server className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={sistemaOrigen}
              onChange={(e) => {
                setSistemaOrigen(e.target.value)
                setPage(0)
              }}
              placeholder="Sistema origen (ej. SIGA)"
              className="h-8 w-full rounded-md border border-input bg-transparent pr-2.5 pl-7 text-[11px] shadow-2xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Layers className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={entidad}
                onChange={(e) => {
                  setEntidad(e.target.value)
                  setPage(0)
                }}
                placeholder="Entidad (ej. Persona)"
                className="h-8 w-full rounded-md border border-input bg-transparent pr-2.5 pl-7 text-[11px] shadow-2xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </div>

            {(search || sistemaOrigen || entidad || estadoFilter !== "TODOS") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Limpiar filtros"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* High-Density Compact Data Table */}
      <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground space-y-1">
            <RefreshCw className="size-5 animate-spin mx-auto text-primary" />
            <p className="text-xs font-medium">Cargando logs de migración...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground space-y-1">
            <Database className="size-6 mx-auto text-muted-foreground/60" />
            <p className="text-xs font-semibold text-foreground">
              Sin registros de migración
            </p>
            <p className="text-[11px] text-muted-foreground">
              {search || sistemaOrigen || entidad || estadoFilter !== "TODOS"
                ? "No se encontraron logs con los filtros aplicados."
                : "Aún no se han procesado eventos de migración de datos."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/60 text-muted-foreground border-b border-border uppercase tracking-wider text-[10px] font-semibold select-none">
                <tr>
                  <th className="py-1.5 px-3">Fecha / Hora</th>
                  <th className="py-1.5 px-3">Estado</th>
                  <th className="py-1.5 px-3">Sistema</th>
                  <th className="py-1.5 px-3">Entidad</th>
                  <th className="py-1.5 px-3">ID Origen → SIGMA</th>
                  <th className="py-1.5 px-3">Mensaje / Resultado</th>
                  <th className="py-1.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {items.map((log) => {
                  const isError = log.estado === "ERROR"
                  const dateFormatted = log.fechaRegistro
                    ? new Date(log.fechaRegistro).toLocaleString("es-ES", {
                        hour12: false,
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "-"

                  return (
                    <tr
                      key={log.id}
                      onClick={() => handleInspectLog(log)}
                      className={`cursor-pointer transition-colors ${
                        isError
                          ? "bg-destructive/5 hover:bg-destructive/15 text-destructive font-medium"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <td className="py-1.5 px-3 text-muted-foreground text-[10px] whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      <td className="py-1.5 px-3 whitespace-nowrap">
                        <MigracionStatusBadge estado={log.estado} />
                      </td>

                      <td className="py-1.5 px-3 whitespace-nowrap font-medium font-sans text-[11px]">
                        {log.sistemaOrigen || "-"}
                      </td>

                      <td className="py-1.5 px-3 whitespace-nowrap font-sans">
                        <span className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground text-[10px] font-medium border border-border">
                          {log.entidad || "-"}
                        </span>
                      </td>

                      <td className="py-1.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="font-semibold text-foreground">
                            {log.idOrigen || "N/A"}
                          </span>
                          {log.idDestino && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-primary text-[10px]" title={log.idDestino}>
                                {log.idDestino.substring(0, 8)}...
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-1.5 px-3 max-w-xs truncate font-sans text-[11px]">
                        <span className={isError ? "text-destructive font-medium" : "text-muted-foreground"}>
                          {log.mensaje || "-"}
                        </span>
                      </td>

                      <td className="py-1.5 px-3 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInspectLog(log)
                          }}
                          className="h-6 px-1.5 text-[10px] gap-1 hover:bg-muted"
                        >
                          <Eye className="size-3" /> Ver
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Pagination */}
        {data ? (
          <Pagination page={data} onPageChange={setPage} />
        ) : null}
      </div>

      {/* Log Detail Modal */}
      <MigracionLogDetailModal
        log={selectedLog}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setSelectedLog(null)
        }}
      />
    </div>
  )
}
