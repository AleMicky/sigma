import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { useIncidentesQuery } from "../api/incidente.queries"
import type { IncidenteActivo } from "../api/incidente.types"
import { CancelarIncidenteDialog } from "../components/CancelarIncidenteDialog"
import { IncidenteFiltrosBar } from "../components/IncidenteFiltrosBar"
import { IncidentePrioridadBadge } from "../components/IncidentePrioridadBadge"
import { IncidenteStatusBadge } from "../components/IncidenteStatusBadge"
import { RegistrarIncidenteDialog } from "../components/RegistrarIncidenteDialog"

export function IncidentesPage() {
  const navigate = useNavigate()

  // Filtros
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebouncedValue(searchInput, 400)
  const [prioridad, setPrioridad] = React.useState("")
  const [estado, setEstado] = React.useState("")
  const [tipoIncidente, setTipoIncidente] = React.useState("")
  const [page, setPage] = React.useState(0)
  const pageSize = 15

  // Modales
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingIncidente, setEditingIncidente] = React.useState<IncidenteActivo | null>(null)
  const [cancelarId, setCancelarId] = React.useState<string | null>(null)

  const { data: pageData, isLoading, isFetching, refetch } = useIncidentesQuery({
    search: debouncedSearch || undefined,
    prioridad: prioridad || undefined,
    estado: estado || undefined,
    tipoIncidente: tipoIncidente || undefined,
    page,
    size: pageSize,
  })

  const incidentes = pageData?.content || []
  const totalElements = pageData?.totalElements || 0
  const totalPages = pageData?.totalPages || 1

  // Métricas calculadas sobre el listado actual
  const metrics = React.useMemo(() => {
    let revisionCount = 0
    let atencionCount = 0
    let cerradosCount = 0

    for (const inc of incidentes) {
      const st = (inc.estado || "").toUpperCase()
      if (st === "REVISION" || st === "REGISTRADO") revisionCount++
      else if (st === "EN_ATENCION" || st === "VALIDACION") atencionCount++
      else if (st === "CERRADO") cerradosCount++
    }

    return { revisionCount, atencionCount, cerradosCount }
  }, [incidentes])

  const handleResetFilters = () => {
    setSearchInput("")
    setPrioridad("")
    setEstado("")
    setTipoIncidente("")
    setPage(0)
  }

  const handleOpenEdit = (inc: IncidenteActivo, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingIncidente(inc)
    setDialogOpen(true)
  }

  const handleOpenCancel = (inc: IncidenteActivo, e: React.MouseEvent) => {
    e.stopPropagation()
    setCancelarId(inc.id)
  }

  const handleOpenCreate = () => {
    setEditingIncidente(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Gestión de Incidentes
              </h1>
              <p className="text-sm text-muted-foreground">
                Reporte, seguimiento y resolución de incidentes y siniestros de activos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 h-9"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-2 h-9 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Reportar Incidente
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas / KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground">Total Incidentes</span>
              <p className="text-2xl font-extrabold">{totalElements}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                En Revisión
              </span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {metrics.revisionCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                En Atención
              </span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {metrics.atencionCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Cerrados / Resueltos
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {metrics.cerradosCount}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <IncidenteFiltrosBar
        search={searchInput}
        onSearchChange={setSearchInput}
        prioridad={prioridad}
        onPrioridadChange={setPrioridad}
        estado={estado}
        onEstadoChange={setEstado}
        tipoIncidente={tipoIncidente}
        onTipoIncidenteChange={setTipoIncidente}
        onReset={handleResetFilters}
      />

      {/* Tabla de Incidentes */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Fecha / Hora</TableHead>
                <TableHead>Tipo de Incidente</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado (Flowable)</TableHead>
                <TableHead>Lugar / Ubicación</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-28 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-2 block">
                      Cargando incidentes...
                    </span>
                  </TableCell>
                </TableRow>
              ) : incidentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-semibold">No se encontraron incidentes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Intenta con otros filtros o reporta un nuevo incidente.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                incidentes.map((inc) => {
                  const fechaStr = inc.fechaHora
                    ? new Date(inc.fechaHora).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"

                  const isTerminal =
                    inc.estado === "CERRADO" ||
                    inc.estado === "CANCELADO" ||
                    inc.estado === "RECHAZADO"

                  return (
                    <TableRow
                      key={inc.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() =>
                        navigate({
                          to: "/activos/incidentes/$id",
                          params: { id: inc.id },
                        })
                      }
                    >
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {fechaStr}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        <span className="text-foreground">
                          {inc.tipoIncidente.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <IncidentePrioridadBadge prioridad={inc.prioridad} />
                      </TableCell>
                      <TableCell>
                        <IncidenteStatusBadge status={inc.estado} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {inc.ubicacion ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            {inc.ubicacion}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                        {inc.descripcion}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate({
                                to: "/activos/incidentes/$id",
                                params: { id: inc.id },
                              })
                            }
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {!isTerminal && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleOpenEdit(inc, e)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleOpenCancel(inc, e)}
                                className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Cancelar incidente"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Página {page + 1} de {totalPages} ({totalElements} incidentes)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 px-3"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-8 px-3"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Registrar/Editar */}
      <RegistrarIncidenteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        incidenteToEdit={editingIncidente}
      />

      {/* Modal Cancelar */}
      {cancelarId && (
        <CancelarIncidenteDialog
          open={Boolean(cancelarId)}
          onOpenChange={(open) => !open && setCancelarId(null)}
          incidenteId={cancelarId}
        />
      )}
    </div>
  )
}
