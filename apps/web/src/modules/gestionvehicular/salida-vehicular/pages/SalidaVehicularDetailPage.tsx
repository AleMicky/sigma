import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Car,
  Compass,
  FilePlus2,
  FileText,
  Gauge,
  GitBranch,
  History,
  MapPin,
  Navigation,
  Play,
  User,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

import { useEjecutarAccionSalidaMutation } from "../api/salida-vehicular.mutations"
import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type { WorkflowAction } from "../api/salida-vehicular.types"
import { CancelarSalidaDialog } from "../components/CancelarSalidaDialog"
import { EjecutarAccionFlowableDialog } from "../components/EjecutarAccionFlowableDialog"
import { RegistrarBitacoraDialog } from "../components/RegistrarBitacoraDialog"
import { SalidaVehicularStatusBadge } from "../components/SalidaVehicularStatusBadge"

interface SalidaVehicularDetailPageProps {
  salidaId: string
}

export function SalidaVehicularDetailPage({ salidaId }: SalidaVehicularDetailPageProps) {
  const navigate = useNavigate()
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [isBitacoraDialogOpen, setIsBitacoraDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  // Queries
  const salidaQuery = useQuery(salidaVehicularQueries.detail(salidaId))
  const tareaQuery = useQuery(salidaVehicularQueries.tareaActual(salidaId))
  const accionesQuery = useQuery(salidaVehicularQueries.acciones(salidaId))
  const eventosQuery = useQuery(salidaVehicularQueries.eventos(salidaId))
  const bitacorasQuery = useQuery(salidaVehicularQueries.bitacoras(salidaId))
  const historialQuery = useQuery(salidaVehicularQueries.historial(salidaId))

  const accionMutation = useEjecutarAccionSalidaMutation()

  const salida = salidaQuery.data
  const currentTask = tareaQuery.data
  const availableActions = accionesQuery.data?.actions ?? []
  const eventos = eventosQuery.data ?? []
  const bitacoras = bitacorasQuery.data ?? []
  const historyTasks = historialQuery.data?.tasks ?? []

  const isFinalizado = salida?.estado?.toUpperCase().includes("FINALIZ")
  const isCancelado = salida?.estado?.toUpperCase().includes("CANCEL")
  const isInactive = isFinalizado || isCancelado

  const handleQuickExecute = async (action: WorkflowAction) => {
    if (!salida) return
    const accionId = action.variable || action.value || action.name
    await accionMutation.mutateAsync({
      id: salida.id,
      accionId,
      data: {
        variables: {
          [action.variable]: action.value,
        },
      },
    })
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  if (salidaQuery.isLoading) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full p-8 text-center text-xs text-muted-foreground">
        Cargando información de la salida vehicular...
      </PageShell>
    )
  }

  if (!salida) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full p-8 text-center text-xs text-muted-foreground space-y-3">
        <p>No se encontró la salida vehicular solicitada.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void navigate({ to: "/gestion-vehicular/salidas" })}
          className="text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Volver a Salidas
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-4 pb-12">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void navigate({ to: "/gestion-vehicular/salidas" })}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
                Salida #{salida.numero}
              </h1>
              <SalidaVehicularStatusBadge status={salida.estado} />
            </div>
            <p className="text-xs text-muted-foreground">
              {salida.placa ? `Placa: ${salida.placa}` : salida.activoDescripcion} &bull; Registrado el {formatDate(salida.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isInactive && (
            <Button
              size="sm"
              onClick={() => setIsActionDialogOpen(true)}
              className="text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <GitBranch className="h-4 w-4" />
              Avanzar Flujo BPMN
            </Button>
          )}

          {!isCancelado && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBitacoraDialogOpen(true)}
              className="text-xs gap-1.5"
            >
              <FilePlus2 className="h-4 w-4 text-emerald-600" />
              Nueva Bitácora
            </Button>
          )}

          {!isInactive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-xs gap-1.5 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 border-rose-300/40"
            >
              <AlertTriangle className="h-4 w-4" />
              Cancelar Salida
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="control" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-xl h-9 p-0.5 bg-muted/60">
          <TabsTrigger value="control" className="text-xs gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
            Control BPMN
          </TabsTrigger>
          <TabsTrigger value="eventos" className="text-xs gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            Eventos ({eventos.length})
          </TabsTrigger>
          <TabsTrigger value="bitacoras" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5 text-emerald-500" />
            Bitácoras ({bitacoras.length})
          </TabsTrigger>
          <TabsTrigger value="historial" className="text-xs gap-1.5">
            <History className="h-3.5 w-3.5 text-purple-500" />
            Auditoría Flowable
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CONTROL Y ESTADO BPMN */}
        <TabsContent value="control" className="space-y-4 pt-3">
          {/* Current Task Banner */}
          <Card className="border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-xs">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Tarea Activa en Motor Flowable
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    {currentTask?.taskDefinitionKey ?? "NINGUNA_PENDIENTE"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {currentTask?.name ?? (isInactive ? "Proceso concluido sin tareas pendientes" : "En espera de asignación")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Instancia: {salida.processInstanceId ?? "N/A"} &bull; Asignado a: {currentTask?.assignee ?? salida.empleadoNombre ?? "Responsable"}
                </p>
              </div>

              {/* Action Buttons right inside banner */}
              {availableActions.length > 0 && !isInactive && (
                <div className="flex flex-wrap gap-2">
                  {availableActions.map((act) => (
                    <Button
                      key={act.name}
                      size="sm"
                      onClick={() => handleQuickExecute(act)}
                      disabled={accionMutation.isPending}
                      className="text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      {act.name}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsActionDialogOpen(true)}
                    className="text-xs"
                  >
                    Detalle de Acción...
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards Grid: Details + Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Info de Salida */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  Datos de la Salida y Ruta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Origen:</span>
                    <p className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      {salida.origen}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Destino:</span>
                    <p className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <Navigation className="h-3.5 w-3.5 text-indigo-500" />
                      {salida.destino}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-[11px]">Motivo del Viaje / Comisión:</span>
                  <p className="mt-1 p-2.5 bg-muted/40 rounded-lg text-foreground leading-relaxed">
                    {salida.motivo}
                  </p>
                </div>

                <div className="pt-2 border-t grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Conductor / Empleado:</span>
                    <p className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {salida.empleadoNombre ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Código de Empleado:</span>
                    <p className="font-mono text-muted-foreground mt-0.5">
                      {salida.empleadoCodigo ?? "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info de Vehículo */}
            <Card className="shadow-xs">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  Vehículo Asignado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Placa:</span>
                    <p className="font-bold text-foreground text-sm font-mono mt-0.5">
                      {salida.placa ?? "S/P"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Código de Activo:</span>
                    <p className="font-mono text-primary font-semibold mt-0.5">
                      {salida.activoCodigo ?? "Sin código"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-[11px]">Descripción / Modelo:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {salida.marca ? `${salida.marca} ${salida.modelo ?? ""}` : salida.activoDescripcion}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-[11px]">ID de Proceso Flowable:</span>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                    {salida.processInstanceId ?? "No inicializado"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: EVENTOS VEHICULARES */}
        <TabsContent value="eventos" className="space-y-4 pt-3">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Línea de Tiempo de Eventos y Transiciones
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Movimientos registrados automáticamente en cada avance del flujo o evento del vehículo.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Fecha y Hora</TableHead>
                    <TableHead className="font-semibold">Tipo de Evento</TableHead>
                    <TableHead className="font-semibold">Kilometraje</TableHead>
                    <TableHead className="font-semibold">Coordenadas GPS</TableHead>
                    <TableHead className="font-semibold">Observación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                        No hay eventos registrados para esta salida.
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventos.map((ev) => (
                      <TableRow key={ev.id} className="text-xs">
                        <TableCell className="font-mono text-muted-foreground">
                          {formatDate(ev.fechaHora || ev.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                            {ev.tipoEvento}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono">
                          {ev.kilometraje != null ? (
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              <Gauge className="h-3 w-3 text-muted-foreground" />
                              {ev.kilometraje.toLocaleString()} km
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {ev.latitud != null && ev.longitud != null ? (
                            <a
                              href={`https://maps.google.com/?q=${ev.latitud},${ev.longitud}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                            >
                              <Compass className="h-3 w-3" />
                              {ev.latitud.toFixed(4)}, {ev.longitud.toFixed(4)}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[250px] truncate">
                          {ev.observacion ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BITACORAS */}
        <TabsContent value="bitacoras" className="space-y-4 pt-3">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Bitácora de Novedades e Incidentes
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registro de eventualidades ocurridas durante la ejecución del viaje.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsBitacoraDialogOpen(true)}
                className="text-xs gap-1.5"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                Registrar Entrada
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Fecha y Hora</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold">Ubicación GPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bitacoras.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                        No hay entradas en la bitácora para esta salida.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bitacoras.map((b) => {
                      const isIncidente = b.tipo === "INCIDENTE"
                      const isNovedad = b.tipo === "NOVEDAD"
                      return (
                        <TableRow key={b.id} className="text-xs">
                          <TableCell className="font-mono text-muted-foreground">
                            {formatDate(b.fechaHora || b.createdAt)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                isIncidente
                                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                  : isNovedad
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              {b.tipo}
                            </span>
                          </TableCell>
                          <TableCell className="text-foreground max-w-[320px]">
                            {b.descripcion}
                          </TableCell>
                          <TableCell>
                            {b.latitud != null && b.longitud != null ? (
                              <a
                                href={`https://maps.google.com/?q=${b.latitud},${b.longitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                              >
                                <Compass className="h-3 w-3" />
                                {b.latitud.toFixed(4)}, {b.longitud.toFixed(4)}
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: AUDITORIA FLOWABLE */}
        <TabsContent value="historial" className="space-y-4 pt-3">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-purple-500" />
                Historial de Tareas de Proceso Flowable
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rastreo y auditoría de ejecución paso a paso de las tareas de usuario del BPMN.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-semibold">Tarea / Hito</TableHead>
                    <TableHead className="font-semibold">Clave BPMN</TableHead>
                    <TableHead className="font-semibold">Asignado</TableHead>
                    <TableHead className="font-semibold">Inicio</TableHead>
                    <TableHead className="font-semibold">Fin / Conclusión</TableHead>
                    <TableHead className="font-semibold">Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                        No hay tareas en el historial de Flowable.
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyTasks.map((t) => (
                      <TableRow key={t.taskId} className="text-xs">
                        <TableCell className="font-medium text-foreground">
                          {t.taskName || t.taskDefinitionKey}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {t.taskDefinitionKey}
                        </TableCell>
                        <TableCell>{t.assigneeName ?? t.assignee ?? "-"}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {formatDate(t.startTime)}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {t.endTime ? formatDate(t.endTime) : (
                            <span className="text-amber-500 font-semibold">En Curso</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {t.durationInMillis != null
                            ? `${Math.round(t.durationInMillis / 1000)}s`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EjecutarAccionFlowableDialog
        open={isActionDialogOpen}
        onOpenChange={setIsActionDialogOpen}
        salida={salida}
      />

      <RegistrarBitacoraDialog
        open={isBitacoraDialogOpen}
        onOpenChange={setIsBitacoraDialogOpen}
        salidaId={salida.id}
        salidaNumero={salida.numero}
      />

      <CancelarSalidaDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        salida={salida}
      />
    </PageShell>
  )
}
