import * as React from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  Edit2,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

import { useIncidenteDetailQuery } from "../api/incidente.queries"
import { CancelarIncidenteDialog } from "../components/CancelarIncidenteDialog"
import { EvidenciasTab } from "../components/EvidenciasTab"
import { IncidenteBpmFlow } from "../components/IncidenteBpmFlow"
import { IncidentePrioridadBadge } from "../components/IncidentePrioridadBadge"
import { IncidenteStatusBadge } from "../components/IncidenteStatusBadge"
import { InvolucradosTab } from "../components/InvolucradosTab"
import { RegistrarIncidenteDialog } from "../components/RegistrarIncidenteDialog"

export function IncidenteDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: "/_dashboard/activos/incidentes/$id" })

  const [activeTab, setActiveTab] = React.useState("general")
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [cancelarDialogOpen, setCancelarDialogOpen] = React.useState(false)

  const {
    data: incidente,
    isLoading,
    isFetching,
    refetch,
  } = useIncidenteDetailQuery(id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando detalle del incidente...</p>
      </div>
    )
  }

  if (!incidente) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Incidente no encontrado</h2>
        <p className="text-sm text-muted-foreground">
          El incidente solicitado no existe o fue eliminado.
        </p>
        <Button onClick={() => navigate({ to: "/activos/incidentes" })} variant="outline">
          Volver a Incidentes
        </Button>
      </div>
    )
  }

  const isTerminal =
    incidente.estado === "CERRADO" ||
    incidente.estado === "RECHAZADO" ||
    incidente.estado === "CANCELADO"

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Botón Volver y Acciones de Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/activos/incidentes" })}
            className="h-9 w-9 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {incidente.tipoIncidente.replace(/_/g, " ")}
              </h1>
              <IncidentePrioridadBadge prioridad={incidente.prioridad} />
              <IncidenteStatusBadge status={incidente.estado} />
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              ID: {incidente.id}
            </p>
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

          {!isTerminal && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-1.5 h-9"
              >
                <Edit2 className="w-4 h-4" />
                Editar Datos
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelarDialogOpen(true)}
                className="gap-1.5 h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Flujo BPMN Flowable */}
      <IncidenteBpmFlow incidente={incidente} onSuccess={() => refetch()} />

      {/* Pestañas de Detalle */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border/80">
          <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="involucrados" className="gap-2 text-xs sm:text-sm">
            <Users className="w-4 h-4" />
            Involucrados ({incidente.involucrados?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="evidencias" className="gap-2 text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            Evidencias ({incidente.evidencias?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Información General */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Detalles del Suceso
                </CardTitle>
                <CardDescription>
                  Datos cronológicos y espaciales del incidente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Fecha y Hora</span>
                  <span className="font-semibold text-foreground">
                    {incidente.fechaHora
                      ? new Date(incidente.fechaHora).toLocaleString([], {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block">Lugar / Ubicación</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{incidente.ubicacion || "No especificada"}</span>
                  </div>
                </div>

                {(incidente.latitud != null || incidente.longitud != null) && (
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Coordenadas GPS
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {incidente.latitud}, {incidente.longitud}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-xs text-muted-foreground block">
                    ID del Activo Relacionado
                  </span>
                  <span className="font-mono text-xs text-foreground">
                    {incidente.activoId}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block">
                    ID del Empleado que Reporta
                  </span>
                  <span className="font-mono text-xs text-foreground">
                    {incidente.empleadoReportaId}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Descripción del Incidente
                </CardTitle>
                <CardDescription>
                  Declaración inicial y detalles del reporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-sm leading-relaxed whitespace-pre-wrap">
                  {incidente.descripcion}
                </div>

                <div className="pt-2 border-t border-border/60 space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Registrado el:</span>{" "}
                    {incidente.auditoria?.createdAt
                      ? new Date(incidente.auditoria.createdAt).toLocaleString()
                      : "—"}
                  </p>
                  {incidente.auditoria?.updatedAt && (
                    <p>
                      <span className="font-medium">Última actualización:</span>{" "}
                      {new Date(incidente.auditoria.updatedAt).toLocaleString()}
                    </p>
                  )}
                  {incidente.auditoria?.createdBy && (
                    <p>
                      <span className="font-medium">Registrado por:</span>{" "}
                      {incidente.auditoria.createdBy}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Involucrados */}
        <TabsContent value="involucrados">
          <InvolucradosTab incidenteId={incidente.id} readOnly={isTerminal} />
        </TabsContent>

        {/* Tab 3: Evidencias */}
        <TabsContent value="evidencias">
          <EvidenciasTab incidenteId={incidente.id} readOnly={isTerminal} />
        </TabsContent>
      </Tabs>

      {/* Modal Editar */}
      <RegistrarIncidenteDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        incidenteToEdit={incidente}
        onSuccess={() => refetch()}
      />

      {/* Modal Cancelar */}
      <CancelarIncidenteDialog
        open={cancelarDialogOpen}
        onOpenChange={setCancelarDialogOpen}
        incidenteId={incidente.id}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
