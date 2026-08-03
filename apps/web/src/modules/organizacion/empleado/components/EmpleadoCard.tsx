import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, Building, Calendar, UserCheck } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { areaQueries } from "../../area/api/area.queries"
import { cargoQueries } from "../../cargo/api/cargo.queries"
import { personaQueries } from "../../persona/api/persona.queries"
import { useDeleteEmpleado } from "../api/empleado.mutations"
import type { Empleado } from "../api/empleado.service"

type EmpleadoCardProps = {
  empleado: Empleado
  onEdit: (empleado: Empleado) => void
}

export function EmpleadoCard({ empleado, onEdit }: EmpleadoCardProps) {
  const deleteMutation = useDeleteEmpleado()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const personaQuery = useQuery(personaQueries.detail(empleado.personaId))
  const areaQuery = useQuery(areaQueries.detail(empleado.areaId))
  const cargoQuery = useQuery(cargoQueries.detail(empleado.cargoId))

  const persona = personaQuery.data
  const area = areaQuery.data
  const cargo = cargoQuery.data

  const nombrePersona = persona
    ? [persona.nombres, persona.primerApellido, persona.segundoApellido]
        .filter(Boolean)
        .join(" ")
    : "Cargando persona..."

  return (
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-9">
        <UserCheck className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold">
              {nombrePersona}
            </span>
            <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {empleado.codigo}
            </code>
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar empleado"
            deleteLabel="Eliminar empleado"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(empleado)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-1.5 truncate">
            <Building className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {area?.nombre ?? "Área no asignada"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {cargo?.nombre ?? "Cargo no asignado"}
            </span>
          </div>
        </div>

        {empleado.fechaInicio ? (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="size-3 shrink-0" />
            <span>
              Desde: {empleado.fechaInicio}
              {empleado.fechaFin ? ` hasta: ${empleado.fechaFin}` : " (Actual)"}
            </span>
          </div>
        ) : null}
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar empleado"
        description={`¿Seguro que deseas eliminar el registro de empleado con código "${empleado.codigo}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(empleado.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}
