import { Briefcase, Building, Calendar, CheckCircle2, Clock } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { RowActions } from "@/shared/components/row-actions"
import { formatDate } from "@/shared/lib/format-date"

import type { Empleado } from "../api/empleado.service"

type EmpleadoListItemProps = {
  empleado: Empleado
  onEdit: (empleado: Empleado) => void
  onDelete: (empleado: Empleado) => void
}

function getInitials(name: string): string {
  const clean = name.trim()
  if (!clean) return "EM"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function EmpleadoListItem({
  empleado,
  onEdit,
  onDelete,
}: EmpleadoListItemProps) {
  const nombrePersona =
    empleado.personaInfo?.nombreCompleto ||
    empleado.personaNombreCompleto ||
    "Empleado sin asignar"

  const docPersona =
    empleado.personaDocumento ||
    (empleado.personaInfo?.tipoDocumento && empleado.personaInfo?.numeroDocumento
      ? `${empleado.personaInfo.tipoDocumento}: ${empleado.personaInfo.numeroDocumento}`
      : null)


  const nombreArea =
    empleado.areaInfo?.nombre || empleado.areaNombre || "Sin área asignada"

  const nombreCargo =
    empleado.cargoInfo?.nombre || empleado.cargoNombre || "Sin cargo asignado"

  // Estado de vigencia según fechaFin
  const isExpired = empleado.fechaFin
    ? new Date(empleado.fechaFin).getTime() < new Date().setHours(0, 0, 0, 0)
    : false

  const initials = getInitials(nombrePersona)

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted/40 sm:px-4">
      {/* Información del Empleado */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar con iniciales */}
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-medium text-xs text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
          <span>{initials}</span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${
              isExpired ? "bg-amber-500" : "bg-emerald-500"
            }`}
            title={isExpired ? "Periodo finalizado" : "Activo / Vigente"}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Fila 1: Nombre + Código + Documento */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(empleado)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {nombrePersona}
            </button>

            <code className="shrink-0 rounded-md border border-border/70 bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
              {empleado.codigo}
            </code>

            {docPersona ? (
              <span className="hidden sm:inline-flex items-center text-[11px] text-muted-foreground">
                <span className="opacity-50 mr-1">•</span>
                <span>{docPersona}</span>
              </span>
            ) : null}

            {/* Tag de estado de vigencia */}
            {isExpired ? (
              <Badge
                variant="destructive"
                className="hidden sm:inline-flex h-4.5 text-[10px] px-1.5 gap-1 font-normal bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              >
                <Clock className="size-2.5" />
                <span>Finalizado</span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex h-4.5 text-[10px] px-1.5 gap-1 font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              >
                <CheckCircle2 className="size-2.5" />
                <span>Vigente</span>
              </Badge>
            )}
          </div>

          {/* Fila 2: Área, Cargo y Fechas */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground min-w-0">
            {/* Área */}
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-[200px] truncate">
              <Building className="size-3 shrink-0 opacity-80" />
              <span className="truncate">{nombreArea}</span>
            </span>

            {/* Cargo */}
            <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-400 border border-purple-500/20 max-w-[200px] truncate">
              <Briefcase className="size-3 shrink-0 opacity-80" />
              <span className="truncate">{nombreCargo}</span>
            </span>

            {/* Fecha Inicio */}
            {empleado.fechaInicio ? (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
                <Calendar className="size-3 shrink-0 opacity-60" />
                <span>Desde {formatDate(empleado.fechaInicio)}</span>
              </span>
            ) : null}

            {/* Fecha Fin si existe */}
            {empleado.fechaFin ? (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
                <span>hasta {formatDate(empleado.fechaFin)}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Auditoría y Acciones */}
      <div className="flex shrink-0 items-center gap-3">
        <AuditInfo
          data={empleado}
          compact
          className="hidden lg:inline-block max-w-[200px] text-right"
        />

        <RowActions
          className="shrink-0"
          editLabel="Editar empleado"
          deleteLabel="Eliminar empleado"
          onEdit={() => onEdit(empleado)}
          onDelete={() => onDelete(empleado)}
        />
      </div>
    </li>
  )
}

