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
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-xl p-0 gap-0 rounded-2xl overflow-hidden shadow-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col">
        {/* ENCABEZADO RESPONSIVO */}
        <DialogHeader className="p-3.5 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-border/60 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                <KeyRound className="size-4 sm:size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight truncate">
                  Asignación Vehicular
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                  Solicitud <span className="font-mono font-bold text-foreground">{solicitud.numero}</span> • {solicitud.motivo}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "self-start sm:self-auto text-[10.5px] sm:text-[11px] font-semibold uppercase px-2 py-0.5 shrink-0",
                asignacionActual
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {asignacionActual ? "Asignada" : "Pendiente"}
            </Badge>
          </div>
        </DialogHeader>

        {/* RESUMEN DE LA SOLICITUD RESPONSIVO (GRID MÓVIL) */}
        <div className="bg-muted/30 px-3.5 sm:px-5 py-2 border-b border-border/50 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            {solicitud.destino && (
              <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{solicitud.destino}</span>
              </div>
            )}

            {solicitud.solicitante && (
              <div className="flex items-center gap-1.5 truncate">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{solicitud.solicitante.nombreCompleto}</span>
              </div>
            )}

            {solicitud.fechaSalida && (
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Salida: {formatDate(solicitud.fechaSalida)}</span>
              </div>
            )}

            {solicitud.fechaRetornoEstimada && (
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Retorno: {formatDate(solicitud.fechaRetornoEstimada)}</span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL CON SCROLL SUAVE */}
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs">
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
            /* VISTA DETALLE EN MÓVIL */
            <div className="space-y-3">
              <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      Unidad y Conductor Asignados
                    </span>
                  </div>
                  {asignacionActual.fechaAsignacion && (
                    <span className="text-[10.5px] sm:text-[11px] text-muted-foreground shrink-0">
                      {formatDate(asignacionActual.fechaAsignacion)}
                    </span>
                  )}
                </div>

                {/* Tarjeta de Vehículo */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex size-7.5 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Car className="size-3.5 sm:size-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {asignacionActual.activo?.nombre || "Vehículo Asignado"}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="text-[9.5px] sm:text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {asignacionActual.activo?.codigo}
                      </code>
                      {asignacionActual.activo?.placa && (
                        <span className="text-[9.5px] sm:text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          Placa: {asignacionActual.activo.placa}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Conductor */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex size-7.5 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    <User className="size-3.5 sm:size-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {asignacionActual.conductor?.nombreCompleto || "Conductor Asignado"}
                    </p>
                    {asignacionActual.conductor?.numeroLicencia && (
                      <span className="inline-block text-[9.5px] sm:text-[10.5px] font-mono font-semibold bg-background px-1.5 py-0.5 rounded border border-border/60">
                        Lic. {asignacionActual.conductor.numeroLicencia} ({asignacionActual.conductor.categoriaLicencia})
                      </span>
                    )}
                  </div>
                </div>

                {/* Asignado Por */}
                {asignacionActual.asignadoPor && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground truncate">
                    <span className="font-medium text-foreground/80 shrink-0">Asignado por:</span>
                    <span className="truncate">{asignacionActual.asignadoPor.nombreCompleto}</span>
                  </div>
                )}

                {/* Observación */}
                {asignacionActual.observacion && (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider block">
                      Observación:
                    </span>
                    <p className="text-foreground/90 text-xs whitespace-pre-wrap">
                      {asignacionActual.observacion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FORMULARIO ADAPTADO */
            <form id="asignacion-form" onSubmit={handleSave} className="space-y-3 sm:space-y-3.5">
              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <Car className="size-3.5 text-primary" />
                  <span>Vehículo / Unidad Móvil *</span>
                </FieldLabel>
                <ActivoCombobox
                  value={activoId}
                  onValueChange={(val) => setActivoId(val)}
                  placeholder="Buscar vehículo por código, placa o nombre..."
                  className="w-full text-xs"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <User className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Conductor Designado *</span>
                </FieldLabel>
                <ConductorCombobox
                  value={conductorId}
                  onValueChange={(val) => setConductorId(val)}
                  placeholder="Buscar conductor disponible..."
                  className="w-full text-xs"
                  soloActivos={true}
                  fechaSalida={solicitud.fechaSalida}
                  fechaRetorno={solicitud.fechaRetornoEstimada}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>Responsable de Asignación *</span>
                </FieldLabel>
                <EmpleadoCombobox
                  value={asignadoPorId}
                  onValueChange={(val) => setAsignadoPorId(val)}
                  placeholder="Buscar empleado asignador..."
                  className="w-full text-xs"
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>Observaciones de Asignación</span>
                </FieldLabel>
                <Textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Condiciones, kilometraje inicial u otras especificaciones..."
                  rows={2}
                  className="text-xs resize-none"
                />
              </Field>
            </form>
          )}
        </div>

        {/* PIE RESPONSIVO (STACK EN MÓVIL) */}
        <DialogFooter className="p-3 sm:p-4 bg-muted/20 border-t border-border/60 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
          {asignacionActual && !isEditing ? (
            <>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-1.5 text-xs cursor-pointer order-2 sm:order-1"
              >
                <Trash2 className="size-3.5" />
                <span>Eliminar Asignación</span>
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none text-xs cursor-pointer"
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleStartEdit}
                  className="flex-1 sm:flex-none gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Pencil className="size-3.5" />
                  <span>Modificar</span>
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
                className="w-full sm:w-auto text-xs cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                form="asignacion-form"
                size="sm"
                disabled={isSubmitting || !activoId || !conductorId || !asignadoPorId}
                className="w-full sm:w-auto gap-1.5 text-xs font-medium cursor-pointer"
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
