import { useState } from "react"
import { Mail, Phone, User } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"

import { useDeletePersona } from "../api/persona.mutations"
import type { Persona } from "../api/persona.service"

type PersonaCardProps = {
  persona: Persona
  onEdit: (persona: Persona) => void
}

export function PersonaCard({ persona, onEdit }: PersonaCardProps) {
  const deleteMutation = useDeletePersona()
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    <li className="group flex min-w-0 gap-2.5 rounded-xl border border-border bg-card p-3 sm:gap-3 sm:p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground sm:size-9">
        <User className="size-3.5 sm:size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">
              {nombreCompleto}
            </span>
            <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {docCompleto}
            </code>
          </div>

          <RowActions
            className="shrink-0"
            editLabel="Editar persona"
            deleteLabel="Eliminar persona"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(persona)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>

        <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
          {persona.correo ? (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{persona.correo}</span>
            </div>
          ) : null}

          {persona.telefono ? (
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="size-3 shrink-0" />
              <span className="truncate">{persona.telefono}</span>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar persona"
        description={`¿Seguro que deseas eliminar a "${nombreCompleto}"?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(persona.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}
