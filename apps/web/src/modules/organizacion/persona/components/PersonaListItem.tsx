import { Mail, Phone, User } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { RowActions } from "@/shared/components/row-actions"

import { useDeletePersona } from "../api/persona.mutations"
import type { Persona } from "../api/persona.service"

type PersonaListItemProps = {
  persona: Persona
  onEdit: (persona: Persona) => void
  onDelete: (persona: Persona) => void
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

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40">
      {/* Información de la Persona */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(persona)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {nombreCompleto}
            </button>
            <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {docCompleto}
            </code>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
            {persona.correo ? (
              <span className="inline-flex items-center gap-1 truncate">
                <Mail className="size-3 shrink-0 opacity-60" />
                <span className="truncate">{persona.correo}</span>
              </span>
            ) : null}

            {persona.telefono ? (
              <span className="hidden md:inline-flex items-center gap-1 truncate">
                <Phone className="size-3 shrink-0 opacity-60" />
                <span className="truncate">{persona.telefono}</span>
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
          className="hidden sm:inline-block max-w-[200px] text-right"
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
