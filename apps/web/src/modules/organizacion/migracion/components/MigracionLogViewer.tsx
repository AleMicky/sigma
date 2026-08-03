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
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"

import type { EstadoMigracion, MigracionFilters, RegistroMigracion } from "../api/migracion.service"
import { migracionQueries } from "../api/migracion.queries"
import { MigracionLogDetailModal } from "./MigracionLogDetailModal"
import { MigracionStatusBadge } from "./MigracionStatusBadge"

const MOCK_REGISTROS: RegistroMigracion[] = [
  {
    id: "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
    sistemaOrigen: "SIGA",
    entidad: "Persona",
    idOrigen: "PER-98214",
    idDestino: "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
    estado: "MIGRADO",
    mensaje: "Migración de registro de persona completada con éxito desde el sistema SIGA.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "8f912a4b-1234-4567-8901-234567890abc",
    sistemaOrigen: "N8N_WORKFLOW",
    entidad: "Empleado",
    idOrigen: "EMP-4019",
    idDestino: null,
    estado: "ERROR",
    mensaje: "Error de validación: El número de documento CI '1029384-LP' ya existe registrado en SIGMA.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "1b938f2a-3c41-4d10-a29d-6481bc920f12",
    sistemaOrigen: "EXCEL_IMPORT",
    entidad: "Area",
    idOrigen: "AREA-DIR-01",
    idDestino: "1b938f2a-3c41-4d10-a29d-6481bc920f12",
    estado: "ACTUALIZADO",
    mensaje: "Campos actualizados: nombre='Dirección de Tecnologías', organigrama='Nivel 2'.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "3c91a782-9901-4412-a1b2-c3d4e5f67890",
    sistemaOrigen: "SIGA",
    entidad: "Cargo",
    idOrigen: "CARGO-502",
    idDestino: null,
    estado: "PENDIENTE",
    mensaje: "Registro agendado en cola para procesamiento batch en n8n.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "9f182c3d-1102-45a8-b991-7261a840912f",
    sistemaOrigen: "REST_API_LEGACY",
    entidad: "Persona",
    idOrigen: "PER-00012",
    idDestino: "9f182c3d-1102-45a8-b991-7261a840912f",
    estado: "OMITIDO",
    mensaje: "Registro omitido: No se detectaron diferencias entre el sistema origen y SIGMA.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d",
    sistemaOrigen: "N8N_WORKFLOW",
    entidad: "Activo",
    idOrigen: "ACT-77123",
    idDestino: null,
    estado: "ERROR",
    mensaje: "Connection Timeout: No se pudo establecer conexión con PostgreSQL SIGA (5432).",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: "5d4c3b2a-1e0f-9a8b-7c6d-5e4f3a2b1c0d",
    sistemaOrigen: "SIGA",
    entidad: "Empleado",
    idOrigen: "EMP-1002",
    idDestino: "5d4c3b2a-1e0f-9a8b-7c6d-5e4f3a2b1c0d",
    estado: "MIGRADO",
    mensaje: "Empleado migrado asignado correctamente al Área Dirección General.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "2e1d0c9b-8a7f-6e5d-4c3b-2a1f0e9d8c7b",
    sistemaOrigen: "EXCEL_IMPORT",
    entidad: "Persona",
    idOrigen: "PER-44012",
    idDestino: null,
    estado: "ERROR",
    mensaje: "NullPointerException: El campo requerido 'nombres' vino nulo en el archivo fuente.",
    fechaRegistro: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
]

export const MigracionLogViewer: React.FC = () => {
  const [search, setSearch] = useState("")
  const [sistemaOrigen, setSistemaOrigen] = useState("")
  const [entidad, setEntidad] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS")
  const [page, setPage] = useState(0)
  const pageSize = 20

  const [useMockData, setUseMockData] = useState(false)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | false>(false)
  const [selectedLog, setSelectedLog] = useState<RegistroMigracion | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const activeFilters: MigracionFilters = {
    page,
    size: pageSize,
    sort: "fechaRegistro,desc",
    q: search || undefined,
    sistemaOrigen: sistemaOrigen || undefined,
    entidad: entidad || undefined,
    estado: estadoFilter !== "TODOS" ? (estadoFilter as EstadoMigracion) : undefined,
  }

  const { data, isLoading, isFetching, refetch } = useQuery(
    migracionQueries.list(activeFilters, autoRefreshInterval),
  )

  const realItems = data?.content ?? []
  const hasRealItems = realItems.length > 0
  const activeItemsSource = useMockData || (!isLoading && !hasRealItems) ? MOCK_REGISTROS : realItems

  const filteredItems = activeItemsSource.filter((item) => {
    if (estadoFilter !== "TODOS" && item.estado !== estadoFilter) return false
    if (
      sistemaOrigen &&
      !item.sistemaOrigen.toLowerCase().includes(sistemaOrigen.toLowerCase())
    )
      return false
    if (
      entidad &&
      !item.entidad.toLowerCase().includes(entidad.toLowerCase())
    )
      return false
    if (search) {
      const q = search.toLowerCase()
      const matchMsg = item.mensaje?.toLowerCase().includes(q)
      const matchIdOrigen = item.idOrigen?.toLowerCase().includes(q)
      const matchId = item.id?.toLowerCase().includes(q)
      if (!matchMsg && !matchIdOrigen && !matchId) return false
    }
    return true
  })

  const items = filteredItems
  const totalElements = useMockData || (!isLoading && !hasRealItems) ? filteredItems.length : (data?.totalElements ?? filteredItems.length)

  const pageObj = {
    content: items,
    page,
    size: pageSize,
    totalElements,
    totalPages: Math.ceil(totalElements / pageSize) || 1,
    first: page === 0,
    last: page >= (Math.ceil(totalElements / pageSize) - 1),
    numberOfElements: items.length,
    empty: items.length === 0,
  }

  const errorCount = items.filter((i) => i.estado === "ERROR").length
  const migradoCount = items.filter((i) => i.estado === "MIGRADO").length
  const actualizadoCount = items.filter((i) => i.estado === "ACTUALIZADO").length
  const pendienteCount = items.filter((i) => i.estado === "PENDIENTE").length

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

  const isDemoMode = useMockData || (!isLoading && !hasRealItems)

  return (
    <div className="space-y-3 font-sans">
      {/* Demo Notice Banner */}
      {isDemoMode && (
        <div className="flex items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 shrink-0 text-amber-500" />
            <span>
              Mostrando <strong>datos de prueba compactos</strong> (registros MIGRADO, ERROR, ACTUALIZADO).
            </span>
          </div>
          {hasRealItems && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUseMockData(false)}
              className="h-6 text-[10px] px-2 border-amber-500/30 hover:bg-amber-500/10"
            >
              Ver API real
            </Button>
          )}
        </div>
      )}

      {/* Compact Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-2xs flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</span>
          <span className="text-sm font-bold font-mono text-foreground">{totalElements}</span>
        </div>

        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-2xs flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Migrados</span>
          <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{migradoCount}</span>
        </div>

        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-2xs flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">Actualizados</span>
          <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">{actualizadoCount}</span>
        </div>

        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-2xs flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">Pendientes</span>
          <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">{pendienteCount}</span>
        </div>

        <div className={`border rounded-lg px-3 py-2 shadow-2xs flex items-center justify-between ${errorCount > 0 ? "bg-destructive/10 border-destructive/30" : "bg-card border-border"}`}>
          <span className={`text-[10px] font-medium uppercase tracking-wider ${errorCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>Errores</span>
          <span className={`text-sm font-bold font-mono ${errorCount > 0 ? "text-destructive" : "text-foreground"}`}>{errorCount}</span>
        </div>
      </div>

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
                  className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-all ${
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
              variant={useMockData ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setUseMockData(!useMockData)
                toast.info(useMockData ? "Modo API activado" : "Datos de prueba cargados")
              }}
              className="h-7 text-[11px] px-2.5 gap-1"
            >
              <Sparkles className="size-3 text-amber-500" />
              {useMockData ? "API Real" : "Prueba"}
            </Button>

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
                className="h-8 px-2 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <p className="text-xs font-medium">Cargando logs...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground space-y-1">
            <Database className="size-6 mx-auto text-muted-foreground/60" />
            <p className="text-xs font-semibold text-foreground">
              Sin registros de migración
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

        {/* Compact Table Footer Pagination */}
        <Pagination page={pageObj} onPageChange={setPage} />
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
