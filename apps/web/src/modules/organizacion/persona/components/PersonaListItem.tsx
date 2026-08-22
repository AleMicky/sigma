import { Cake, Mail, Phone } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { RowActions } from "@/shared/components/row-actions"
import { formatDate } from "@/shared/lib/format-date"

import { useDeletePersona } from "../api/persona.mutations"
import type { Persona } from "../api/persona.service"

type PersonaListItemProps = {
  persona: Persona
  onEdit: (persona: Persona) => void
  onDelete: (persona: Persona) => void
}

function getInitials(name: string): string {
  const clean = name.trim()
  if (!clean) return "PE"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function PersonaListItem({
  persona,
  onEdit,
  onDelete,
}: PersonaListItemProps) {
  const deleteMutation = useDeletePersona()

  const nombreCompleto = [
    persona.nombres,
    persona.primerApellido,
    persona.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")

  const docCompleto = `${persona.tipoDocumento}: ${persona.numeroDocumento}${
    persona.complemento ? `-${persona.complemento}` : ""
  }`

  const initials = getInitials(nombreCompleto)

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted/40 sm:px-4">
      {/* Información de la Persona */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar con iniciales */}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-medium text-xs text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
          <span>{initials}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Fila 1: Nombre + Documento */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(persona)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {nombreCompleto}
            </button>

            <code className="shrink-0 rounded-md border border-border/70 bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
              {docCompleto}
            </code>
          </div>

          {/* Fila 2: Contacto (Email, Teléfono, Nacimiento) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground min-w-0">
            {persona.correo ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-foreground/80 max-w-[220px] truncate">
                <Mail className="size-3 shrink-0 text-primary opacity-80" />
                <span className="truncate">{persona.correo}</span>
              </span>
            ) : null}

            {persona.telefono ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-foreground/80">
                <Phone className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400 opacity-80" />
                <span>{persona.telefono}</span>
              </span>
            ) : null}

            {persona.fechaNacimiento ? (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                <Cake className="size-3 shrink-0 opacity-60" />
                <span>{formatDate(persona.fechaNacimiento)}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Auditoría y Acciones */}
      <div className="flex shrink-0 items-center gap-3">
        <AuditInfo
          data={persona}
          compact
          className="hidden lg:inline-block max-w-[200px] text-right"
        />

        <RowActions
          className="shrink-0"
          editLabel="Editar persona"
          deleteLabel="Eliminar persona"
          deleteDisabled={deleteMutation.isPending}
          onEdit={() => onEdit(persona)}
          onDelete={() => onDelete(persona)}
        />
      </div>
    </li>
  )
}

