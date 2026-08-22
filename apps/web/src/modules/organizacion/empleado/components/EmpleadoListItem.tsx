import { Briefcase, Building, UserCheck } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteEmpleado } from "../api/empleado.mutations"
import type { Empleado } from "../api/empleado.service"

type EmpleadoListItemProps = {
  empleado: Empleado
  onEdit: (empleado: Empleado) => void
  onDelete: (empleado: Empleado) => void
}

export function EmpleadoListItem({
  empleado,
  onEdit,
  onDelete,
}: EmpleadoListItemProps) {
  const deleteMutation = useDeleteEmpleado()

  const nombrePersona =
    empleado.personaInfo?.nombreCompleto ||
    empleado.personaNombreCompleto ||
    "Empleado sin nombre"

  const nombreArea =
    empleado.areaInfo?.nombre || empleado.areaNombre || "Sin área"

  const nombreCargo =
    empleado.cargoInfo?.nombre || empleado.cargoNombre || "Sin cargo"

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40">
      {/* Información del Empleado */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserCheck className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(empleado)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {nombrePersona}
            </button>
            <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {empleado.codigo}
            </code>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
            <span className="inline-flex items-center gap-1 truncate">
              <Building className="size-3 shrink-0 opacity-60" />
              <span className="truncate">{nombreArea}</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1 truncate">
              <Briefcase className="size-3 shrink-0 opacity-60" />
              <span className="truncate">{nombreCargo}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Auditoría y Acciones */}
      <div className="flex shrink-0 items-center gap-3">
        <AuditInfo
          data={empleado}
          compact
          className="hidden sm:inline-block max-w-[200px] text-right"
        />

        <RowActions
          className="shrink-0"
          editLabel="Editar empleado"
          deleteLabel="Eliminar empleado"
          deleteDisabled={deleteMutation.isPending}
          onEdit={() => onEdit(empleado)}
          onDelete={() => onDelete(empleado)}
        />
      </div>
    </li>
  )
}
