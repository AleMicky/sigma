import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { ActivoCombobox } from "@/modules/mantenimientos/orden-trabajo/components/ActivoCombobox"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useActualizarIncidenteMutation,
  useRegistrarIncidenteMutation,
} from "../api/incidente.mutations"
import type { IncidenteActivo } from "../api/incidente.types"

interface RegistrarIncidenteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incidenteToEdit?: IncidenteActivo | null
  onSuccess?: () => void
}

export function RegistrarIncidenteDialog({
  open,
  onOpenChange,
  incidenteToEdit,
  onSuccess,
}: RegistrarIncidenteDialogProps) {
  const isEditing = Boolean(incidenteToEdit)

  const [activoId, setActivoId] = React.useState("")
  const [empleadoReportaId, setEmpleadoReportaId] = React.useState("")
  const [tipoIncidente, setTipoIncidente] = React.useState("COLISION")
  const [prioridad, setPrioridad] = React.useState("MEDIA")
  const [fechaHora, setFechaHora] = React.useState(
    new Date().toISOString().slice(0, 16)
  )
  const [ubicacion, setUbicacion] = React.useState("")
  const [latitud, setLatitud] = React.useState<string>("")
  const [longitud, setLongitud] = React.useState<string>("")
  const [descripcion, setDescripcion] = React.useState("")

  const registrarMutation = useRegistrarIncidenteMutation()
  const actualizarMutation = useActualizarIncidenteMutation()

  const isPending = registrarMutation.isPending || actualizarMutation.isPending

  React.useEffect(() => {
    if (incidenteToEdit) {
      setActivoId(incidenteToEdit.activoId || "")
      setEmpleadoReportaId(incidenteToEdit.empleadoReportaId || "")
      setTipoIncidente(incidenteToEdit.tipoIncidente || "COLISION")
      setPrioridad(incidenteToEdit.prioridad || "MEDIA")
      setFechaHora(
        incidenteToEdit.fechaHora
          ? new Date(incidenteToEdit.fechaHora).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      )
      setUbicacion(incidenteToEdit.ubicacion || "")
      setLatitud(incidenteToEdit.latitud != null ? String(incidenteToEdit.latitud) : "")
      setLongitud(incidenteToEdit.longitud != null ? String(incidenteToEdit.longitud) : "")
      setDescripcion(incidenteToEdit.descripcion || "")
    } else {
      setActivoId("")
      setEmpleadoReportaId("")
      setTipoIncidente("COLISION")
      setPrioridad("MEDIA")
      setFechaHora(new Date().toISOString().slice(0, 16))
      setUbicacion("")
      setLatitud("")
      setLongitud("")
      setDescripcion("")
    }
  }, [incidenteToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!activoId) {
      return
    }
    if (!empleadoReportaId) {
      return
    }
    if (!descripcion.trim()) {
      return
    }

    const payload = {
      activoId,
      empleadoReportaId,
      tipoIncidente,
      prioridad,
      fechaHora,
      ubicacion: ubicacion.trim() || undefined,
      latitud: latitud ? Number.parseFloat(latitud) : undefined,
      longitud: longitud ? Number.parseFloat(longitud) : undefined,
      descripcion: descripcion.trim(),
    }

    if (isEditing && incidenteToEdit) {
      actualizarMutation.mutate(
        { id: incidenteToEdit.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSuccess?.()
          },
        }
      )
    } else {
      registrarMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Editar Incidente" : "Reportar Nuevo Incidente"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Actualiza la información del siniestro o anomalía del activo."
                  : "Registra un incidente para iniciar automáticamente su proceso de atención y trazabilidad en Flowable."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Activo Afectado */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">
              Activo Afectado <span className="text-red-500">*</span>
            </Label>
            <ActivoCombobox
              value={activoId}
              onValueChange={(val) => setActivoId(val)}
              placeholder="Buscar activo por código, nombre o placa..."
              disabled={isEditing}
            />
          </div>

          {/* Empleado que Reporta */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">
              Empleado que Reporta <span className="text-red-500">*</span>
            </Label>
            <EmpleadoCombobox
              value={empleadoReportaId}
              onValueChange={(val) => setEmpleadoReportaId(val)}
              placeholder="Buscar empleado responsable del reporte..."
            />
          </div>

          {/* Tipo de Incidente y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">
                Tipo de Incidente <span className="text-red-500">*</span>
              </Label>
              <Select
                value={tipoIncidente}
                onValueChange={(val: string | null) => setTipoIncidente(val ?? "COLISION")}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLISION">Colisión / Choque</SelectItem>
                  <SelectItem value="FALLA_MECANICA">Falla Mecánica Grave</SelectItem>
                  <SelectItem value="ROBO_HURTO">Robo / Pérdida</SelectItem>
                  <SelectItem value="DANO_MATERIAL">Daño Material / Vandalismo</SelectItem>
                  <SelectItem value="ACCIDENTE_LABORAL">Accidente Laboral</SelectItem>
                  <SelectItem value="OTRO">Otro Siniestro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">
                Nivel de Prioridad <span className="text-red-500">*</span>
              </Label>
              <Select
                value={prioridad}
                onValueChange={(val: string | null) => setPrioridad(val ?? "MEDIA")}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Seleccione prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fecha y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">
                Fecha y Hora del Incidente <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                className="h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-sm">Lugar / Ubicación</Label>
              <Input
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej. Carretera Cochabamba km 45, Patio Norte"
                className="h-10"
              />
            </div>
          </div>

          {/* Coordenadas GPS opcionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Latitud GPS (opcional)</Label>
              <Input
                type="number"
                step="any"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
                placeholder="-17.3895"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Longitud GPS (opcional)</Label>
              <Input
                type="number"
                step="any"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
                placeholder="-66.1568"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Descripción detallada */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-sm">
              Descripción del Suceso <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa cómo ocurrió el incidente, daños iniciales visibles o circunstancias relevantes..."
              rows={4}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !activoId || !empleadoReportaId || !descripcion.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Registrar e Iniciar Flujo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
