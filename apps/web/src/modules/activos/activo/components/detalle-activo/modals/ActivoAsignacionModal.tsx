import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Building2, Calendar, FileCheck, RotateCcw, User, UserCheck } from "lucide-react"
import { toast } from "sonner"

import {
  useCreateActivoAsignacion,
  useUpdateActivoAsignacion,
} from "@/modules/activos/activo-asignacion/api/activo-asignacion.mutations"
import type {
  ActivoAsignacion,
  ActivoAsignacionPayload,
} from "@/modules/activos/activo-asignacion/api/activo-asignacion.service"
import { areaQueries } from "@/modules/organizacion/area/api/area.queries"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
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
import { Textarea } from "@/shared/components/ui/textarea"

type ModalMode = "create" | "edit" | "devolver"

type ActivoAsignacionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activoId: string
  activoCodigo: string
  mode?: ModalMode
  asignacionToEdit?: ActivoAsignacion | null
}

function toLocalInputDate(isoString?: string | null): string {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString.slice(0, 16)
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ""
  }
}

function formatLocalDateTimeForApi(dateTimeStr?: string | null): string | null {
  if (!dateTimeStr) return null
  if (dateTimeStr.length === 16) {
    return `${dateTimeStr}:00`
  }
  return dateTimeStr
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs shadow-2xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 text-foreground"

export function ActivoAsignacionModal({
  open,
  onOpenChange,
  activoId,
  activoCodigo,
  mode = "create",
  asignacionToEdit,
}: ActivoAsignacionModalProps) {
  const createMutation = useCreateActivoAsignacion()
  const updateMutation = useUpdateActivoAsignacion()

  const [areaId, setAreaId] = useState<string>("")
  const [empleadoId, setEmpleadoId] = useState<string>("")
  const [fechaAsignacion, setFechaAsignacion] = useState<string>("")
  const [fechaDevolucion, setFechaDevolucion] = useState<string>("")
  const [observacionAsignacion, setObservacionAsignacion] = useState<string>("")
  const [observacionDevolucion, setObservacionDevolucion] = useState<string>("")

  // 1. Áreas de la organización (GET /api/v1/areas)
  const areasQuery = useQuery(
    areaQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const areas = Array.isArray(areasQuery.data)
    ? areasQuery.data
    : (areasQuery.data?.content ?? [])

  // 2. Empleados filtrados por área directamente con GET /api/v1/empleados/area/{areaId}
  const empleadosQuery = useQuery({
    ...empleadoQueries.byArea(areaId, { size: 100 }),
    enabled: Boolean(areaId),
  })
  const empleadosDeArea = Array.isArray(empleadosQuery.data)
    ? empleadosQuery.data
    : (empleadosQuery.data?.content ?? [])

  useEffect(() => {
    if (open) {
      if (asignacionToEdit) {
        const initialAreaId = asignacionToEdit.areaId || ""
        setAreaId(initialAreaId)
        setEmpleadoId(asignacionToEdit.empleadoId || "")
        setFechaAsignacion(toLocalInputDate(asignacionToEdit.fechaAsignacion))
        setFechaDevolucion(
          mode === "devolver" && !asignacionToEdit.fechaDevolucion
            ? toLocalInputDate(new Date().toISOString())
            : toLocalInputDate(asignacionToEdit.fechaDevolucion),
        )
        setObservacionAsignacion(asignacionToEdit.observacionAsignacion || "")
        setObservacionDevolucion(asignacionToEdit.observacionDevolucion || "")
      } else {
        setAreaId("")
        setEmpleadoId("")
        setFechaAsignacion(toLocalInputDate(new Date().toISOString()))
        setFechaDevolucion("")
        setObservacionAsignacion("")
        setObservacionDevolucion("")
      }
    }
  }, [open, asignacionToEdit, mode])

  function handleAreaChange(newAreaId: string) {
    setAreaId(newAreaId)
    setEmpleadoId("")
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!areaId) {
      toast.error("Debes seleccionar el Área o Departamento")
      return
    }

    if (!fechaAsignacion) {
      toast.error("La fecha de asignación es obligatoria")
      return
    }

    if (mode === "devolver" && !fechaDevolucion) {
      toast.error("Debes indicar la fecha de devolución")
      return
    }

    const fechaAsigFormatted = formatLocalDateTimeForApi(fechaAsignacion)
    const fechaDevFormatted = formatLocalDateTimeForApi(fechaDevolucion)

    if (!fechaAsigFormatted) {
      toast.error("Fecha de asignación inválida")
      return
    }

    const payload: ActivoAsignacionPayload = {
      activoId,
      areaId: areaId || null,
      empleadoId: empleadoId || null,
      fechaAsignacion: fechaAsigFormatted,
      fechaDevolucion: fechaDevFormatted,
      observacionAsignacion: observacionAsignacion.trim() || null,
      observacionDevolucion: observacionDevolucion.trim() || null,
    }

    try {
      if (asignacionToEdit?.id) {
        await updateMutation.mutateAsync({
          id: asignacionToEdit.id,
          payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // Handled in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "devolver" ? (
              <>
                <RotateCcw className="size-4.5 text-amber-500" />
                Registrar Devolución de Custodia
              </>
            ) : mode === "edit" ? (
              <>
                <UserCheck className="size-4.5 text-primary" />
                Editar Asignación
              </>
            ) : (
              <>
                <UserCheck className="size-4.5 text-emerald-500" />
                Nueva Asignación / Traspaso de Custodia
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Activo:{" "}
            <span className="font-mono font-bold text-foreground">
              {activoCodigo}
            </span>
            . Selecciona el área y el funcionario custodio responsable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1 text-xs">
          {/* 1. Selección de Área */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              Área o Departamento <span className="text-destructive">*</span>
            </Label>
            <select
              value={areaId}
              onChange={(e) => handleAreaChange(e.target.value)}
              disabled={mode === "devolver"}
              required
              className={selectClassName}
            >
              <option value="">-- Seleccionar Área / Departamento --</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre} ({area.codigo})
                </option>
              ))}
            </select>
            {areasQuery.isLoading && (
              <span className="text-[10px] text-muted-foreground">
                Cargando áreas disponibles...
              </span>
            )}
          </div>

          {/* 2. Selección de Funcionario / Empleado (filtrado por GET /api/v1/empleados/area/{areaId}) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                Funcionario Responsable (Custodio Directo)
              </Label>
              {areaId && !empleadosQuery.isLoading && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  {empleadosDeArea.length}{" "}
                  {empleadosDeArea.length === 1 ? "funcionario" : "funcionarios"} en esta área
                </span>
              )}
            </div>

            <select
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              disabled={mode === "devolver" || !areaId || empleadosQuery.isLoading}
              className={selectClassName}
            >
              <option value="">
                {!areaId
                  ? "-- Primero selecciona un área arriba --"
                  : empleadosQuery.isLoading
                    ? "-- Cargando funcionarios del área seleccionada... --"
                    : empleadosDeArea.length === 0
                      ? "-- No hay funcionarios registrados en esta área (Custodia general del área) --"
                      : "-- Asignar a Funcionario Específico (o dejar custodia general del área) --"}
              </option>
              {empleadosDeArea.map((emp) => {
                const fullName =
                  emp.personaInfo?.nombreCompleto ||
                  emp.personaNombreCompleto ||
                  `Empleado (${emp.codigo})`
                const cargoName = emp.cargoInfo?.nombre || emp.cargoNombre
                const cargoText = cargoName ? ` · ${cargoName}` : ""

                return (
                  <option key={emp.id} value={emp.id}>
                    {fullName}{cargoText} [{emp.codigo}]
                  </option>
                )
              })}
            </select>

            <span className="text-[10px] text-muted-foreground">
              Puedes seleccionar un funcionario en particular o dejar el campo vacío para asignar la custodia directamente a toda el área.
            </span>
          </div>

          {/* 3. Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="size-3 text-muted-foreground" />
                Fecha de Asignación <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={fechaAsignacion}
                onChange={(e) => setFechaAsignacion(e.target.value)}
                disabled={mode === "devolver"}
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            {(mode === "devolver" || mode === "edit") && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  Fecha de Devolución
                  {mode === "devolver" && (
                    <span className="text-destructive font-bold">*</span>
                  )}
                </Label>
                <Input
                  type="datetime-local"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  className="h-9 text-xs font-mono"
                  required={mode === "devolver"}
                />
              </div>
            )}
          </div>

          {/* 4. Observación Asignación */}
          {mode !== "devolver" && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">
                Observación / Motivo de Asignación
              </Label>
              <Textarea
                value={observacionAsignacion}
                onChange={(e) => setObservacionAsignacion(e.target.value)}
                placeholder="Ej. Asignación formal de equipo para labores técnicas y operativas..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          )}

          {/* 5. Observación Devolución */}
          {(mode === "devolver" || mode === "edit") && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <FileCheck className="size-3 text-muted-foreground" />
                Observación / Motivo de Devolución
              </Label>
              <Textarea
                value={observacionDevolucion}
                onChange={(e) => setObservacionDevolucion(e.target.value)}
                placeholder="Ej. Devolución de equipo por cambio de funciones en buen estado..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className={
                mode === "devolver"
                  ? "bg-amber-600 hover:bg-amber-700 font-semibold"
                  : "font-semibold shadow-xs"
              }
            >
              {isPending
                ? "Guardando..."
                : mode === "devolver"
                  ? "Confirmar Devolución"
                  : mode === "edit"
                    ? "Guardar Cambios"
                    : "Asignar Activo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
