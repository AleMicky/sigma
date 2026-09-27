import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  KeyRound,
  Loader2,
  MapPin,
  Pencil,
  Save,
  Trash2,
  User,
  Users,
} from "lucide-react"

import { ActivoCombobox } from "@/modules/mantenimientos/orden-trabajo/components/ActivoCombobox"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { ConductorCombobox } from "@/modules/gestionvehicular/conductor/components/ConductorCombobox"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Textarea } from "@/shared/components/ui/textarea"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import {
  useCreateAsignacionVehicular,
  useDeleteAsignacionVehicular,
  useUpdateAsignacionVehicular,
} from "../api/asignacion-vehicular.mutations"
import { asignacionVehicularQueries } from "../api/asignacion-vehicular.queries"
import type { SolicitudVehicular } from "../../solicitud/api/solicitud-vehicular.service"

export type AsignacionVehicularDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud?: SolicitudVehicular | null
  onSuccess?: () => void
}

export function AsignacionVehicularDialog({
  open,
  onOpenChange,
  solicitud,
  onSuccess,
}: AsignacionVehicularDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [activoId, setActivoId] = React.useState("")
  const [conductorId, setConductorId] = React.useState("")
  const [asignadoPorId, setAsignadoPorId] = React.useState("")
  const [observacion, setObservacion] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Consulta de asignaciones existentes para esta solicitud
  const asignacionQuery = useQuery({
    ...asignacionVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: Boolean(open && solicitud?.id),
  })

  const asignaciones = asignacionQuery.data ?? []
  const asignacionActual = asignaciones.length > 0 ? asignaciones[0] : null

  const createMutation = useCreateAsignacionVehicular()
  const updateMutation = useUpdateAsignacionVehicular()
  const deleteMutation = useDeleteAsignacionVehicular()

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  // Inicializar o resetear valores al abrir o cambiar la asignación
  React.useEffect(() => {
    if (!open) {
      setIsEditing(false)
      setErrorMessage(null)
      return
    }

    if (asignacionActual) {
      setActivoId(asignacionActual.activoId || "")
      setConductorId(asignacionActual.conductorId || "")
      setAsignadoPorId(asignacionActual.asignadoPorId || "")
      setObservacion(asignacionActual.observacion || "")
      setIsEditing(false)
    } else {
      setActivoId("")
      setConductorId("")
      // Por defecto asignadoPorId si la solicitud tiene responsable asignado
      setAsignadoPorId(solicitud?.responsableAsignacionId || "")
      setObservacion("")
      setIsEditing(true)
    }
  }, [open, asignacionActual, solicitud])

  const handleStartEdit = () => {
    if (asignacionActual) {
      setActivoId(asignacionActual.activoId || "")
      setConductorId(asignacionActual.conductorId || "")
      setAsignadoPorId(asignacionActual.asignadoPorId || "")
      setObservacion(asignacionActual.observacion || "")
    }
    setIsEditing(true)
    setErrorMessage(null)
  }

  const handleCancelEdit = () => {
    if (asignacionActual) {
      setIsEditing(false)
      setErrorMessage(null)
    } else {
      onOpenChange(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!solicitud?.id) {
      setErrorMessage("No se encontró la solicitud vehicular.")
      return
    }

    if (!activoId) {
      setErrorMessage("Debe seleccionar un vehículo / activo.")
      return
    }

    if (!conductorId) {
      setErrorMessage("Debe seleccionar un conductor asignado.")
      return
    }

    if (!asignadoPorId) {
      setErrorMessage("Debe indicar el empleado responsable de la asignación.")
      return
    }

    try {
      if (asignacionActual) {
        await updateMutation.mutateAsync({
          id: asignacionActual.id,
          payload: {
            solicitudVehicularId: solicitud.id,
            activoId,
            conductorId,
            asignadoPorId,
            fechaAsignacion:
              asignacionActual.fechaAsignacion || new Date().toISOString(),
            observacion: observacion.trim() || undefined,
          },
        })
      } else {
        await createMutation.mutateAsync({
          solicitudVehicularId: solicitud.id,
          activoId,
          conductorId,
          asignadoPorId,
          fechaAsignacion: new Date().toISOString(),
          observacion: observacion.trim() || undefined,
        })
      }

      setIsEditing(false)
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error al guardar la asignación."
      setErrorMessage(msg)
    }
  }

  const handleDelete = async () => {
    if (!asignacionActual) return
    const confirm = window.confirm(
      "¿Está seguro de que desea eliminar esta asignación vehicular?"
    )
    if (!confirm) return

    try {
      await deleteMutation.mutateAsync(asignacionActual.id)
      setIsEditing(true)
      setActivoId("")
      setConductorId("")
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al eliminar la asignación vehicular."
      setErrorMessage(msg)
    }
  }

  if (!solicitud) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 rounded-2xl overflow-hidden shadow-2xl">
        {/* ENCABEZADO MODAL */}
        <DialogHeader className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                <KeyRound className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                  Asignación de Vehículo y Conductor
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Solicitud <span className="font-mono font-bold text-foreground">{solicitud.numero}</span> • {solicitud.motivo}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-semibold uppercase px-2 py-0.5",
                asignacionActual
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {asignacionActual ? "Asignada" : "Pendiente de Asignación"}
            </Badge>
          </div>
        </DialogHeader>

        {/* RESUMEN DE LA SOLICITUD */}
        <div className="bg-muted/30 px-4 sm:px-5 py-2.5 border-b border-border/50 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {solicitud.destino && (
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span>{solicitud.destino}</span>
            </div>
          )}

          {solicitud.solicitante && (
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground shrink-0" />
              <span>{solicitud.solicitante.nombreCompleto}</span>
            </div>
          )}

          {solicitud.fechaSalida && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <span>Salida: {formatDate(solicitud.fechaSalida)}</span>
            </div>
          )}

          {solicitud.fechaRetornoEstimada && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <span>Retorno: {formatDate(solicitud.fechaRetornoEstimada)}</span>
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[calc(85vh-200px)] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          )}

          {asignacionQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs">Cargando datos de asignación...</p>
            </div>
          ) : asignacionActual && !isEditing ? (
            /* VISTA DE DETALLE DE ASIGNACIÓN EXISTENTE */
            <div className="space-y-3.5">
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-foreground">
                      Unidad y Conductor Asignados
                    </span>
                  </div>
                  {asignacionActual.fechaAsignacion && (
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(asignacionActual.fechaAsignacion)}
                    </span>
                  )}
                </div>

                {/* Tarjeta de Vehículo */}
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Car className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {asignacionActual.activo?.nombre || "Vehículo Asignado"}
                      </span>
                      <code className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                        {asignacionActual.activo?.codigo}
                      </code>
                      {asignacionActual.activo?.placa && (
                        <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          Placa: {asignacionActual.activo.placa}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Conductor */}
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    <User className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {asignacionActual.conductor?.nombreCompleto || "Conductor Asignado"}
                      </span>
                      {asignacionActual.conductor?.numeroLicencia && (
                        <span className="text-[10.5px] font-mono font-semibold bg-background px-1.5 py-0.2 rounded border border-border/60">
                          Lic. {asignacionActual.conductor.numeroLicencia} ({asignacionActual.conductor.categoriaLicencia})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Asignado Por */}
                {asignacionActual.asignadoPor && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">Asignado por:</span>
                    <span>{asignacionActual.asignadoPor.nombreCompleto}</span>
                    {asignacionActual.asignadoPor.cargo && (
                      <span>({asignacionActual.asignadoPor.cargo})</span>
                    )}
                  </div>
                )}

                {/* Observación */}
                {asignacionActual.observacion && (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground text-[10.5px] uppercase tracking-wider">
                      Observación:
                    </span>
                    <p className="text-foreground/90 whitespace-pre-wrap">
                      {asignacionActual.observacion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FORMULARIO DE ASIGNACIÓN (CREAR / EDITAR) */
            <form id="asignacion-form" onSubmit={handleSave} className="space-y-3.5">
              {/* Selección de Vehículo (Activo) */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Car className="size-3.5 text-primary" />
                  <span>Vehículo / Unidad Móvil *</span>
                </FieldLabel>
                <ActivoCombobox
                  value={activoId}
                  onValueChange={(val) => setActivoId(val)}
                  placeholder="Buscar y seleccionar vehículo por código, placa o nombre..."
                  className="w-full text-xs"
                />
              </Field>

              {/* Selección de Conductor */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Conductor Designado *</span>
                </FieldLabel>
                <ConductorCombobox
                  value={conductorId}
                  onValueChange={(val) => setConductorId(val)}
                  placeholder="Buscar y seleccionar conductor disponible..."
                  className="w-full text-xs"
                  soloActivos={true}
                  fechaSalida={solicitud.fechaSalida}
                  fechaRetorno={solicitud.fechaRetornoEstimada}
                />
              </Field>

              {/* Empleado Asignador */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>Responsable de la Asignación *</span>
                </FieldLabel>
                <EmpleadoCombobox
                  value={asignadoPorId}
                  onValueChange={(val) => setAsignadoPorId(val)}
                  placeholder="Buscar empleado asignador..."
                  className="w-full text-xs"
                />
              </Field>

              {/* Observación / Notas adicionales */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>Observaciones de Asignación</span>
                </FieldLabel>
                <Textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Notas, condiciones del vehículo, kilometraje inicial u otras especificaciones..."
                  rows={2}
                  className="text-xs resize-none"
                />
              </Field>
            </form>
          )}
        </div>

        {/* PIE DE DIÁLOGO */}
        <DialogFooter className="p-3 sm:p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between sm:justify-between gap-2">
          {asignacionActual && !isEditing ? (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Eliminar Asignación</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs cursor-pointer"
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleStartEdit}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span>Modificar Asignación</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="text-xs cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                form="asignacion-form"
                size="sm"
                disabled={isSubmitting || !activoId || !conductorId || !asignadoPorId}
                className="gap-1.5 text-xs font-medium cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>{asignacionActual ? "Actualizar Asignación" : "Guardar Asignación"}</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
