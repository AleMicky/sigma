import { useState } from "react"
import { Briefcase, Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { RowActions } from "@/shared/components/row-actions"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteCargo } from "../api/cargo.mutations"
import type { Cargo } from "../api/cargo.service"

type CargoListItemProps = {
  cargo: Cargo
  onEdit: (cargo: Cargo) => void
  onDelete: (cargo: Cargo) => void
}

export function CargoListItem({
  cargo,
  onEdit,
  onDelete,
}: CargoListItemProps) {
  const deleteMutation = useDeleteCargo()
  const [copied, setCopied] = useState(false)

  const audit =
    "auditoria" in cargo && cargo.auditoria ? cargo.auditoria : cargo
  const createdAt = audit.createdAt ? formatDateTime(audit.createdAt) : null

  function copyCode(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(cargo.codigo)
    setCopied(true)
    toast.success(`Código "${cargo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40">
      {/* Información del Cargo */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Briefcase className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(cargo)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {cargo.nombre}
            </button>
            <button
              type="button"
              onClick={copyCode}
              title="Copiar código"
              className="inline-flex shrink-0 items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span>{cargo.codigo}</span>
              {copied ? (
                <Check className="size-2.5 text-emerald-500" />
              ) : (
                <Copy className="size-2.5 opacity-50 group-hover:opacity-80" />
              )}
            </button>
          </div>

          {cargo.descripcion ? (
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {cargo.descripcion}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground/40 italic hidden lg:inline">
              Sin descripción
            </span>
          )}
        </div>
      </div>

      {/* Acciones y Fecha */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {createdAt ? (
          <span className="hidden text-[11px] text-muted-foreground xl:inline">
            {createdAt}
          </span>
        ) : null}

        <RowActions
          className="shrink-0"
          editLabel="Editar cargo"
          deleteLabel="Eliminar cargo"
          deleteDisabled={deleteMutation.isPending}
          onEdit={() => onEdit(cargo)}
          onDelete={() => onDelete(cargo)}
        />
      </div>
    </li>
  )
}
