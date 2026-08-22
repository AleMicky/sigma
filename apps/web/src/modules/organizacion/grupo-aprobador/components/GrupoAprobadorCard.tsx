import { useState } from "react"
import { ListOrdered, ShieldCheck } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"

import { useDeleteGrupoAprobador } from "../api/grupo-aprobador.mutations"
import type { GrupoAprobador } from "../api/grupo-aprobador.service"

type GrupoAprobadorCardProps = {
  grupo: GrupoAprobador
  onEdit: (grupo: GrupoAprobador) => void
  onManageDetalles: (grupo: GrupoAprobador) => void
}

export function GrupoAprobadorCard({
  grupo,
  onEdit,
  onManageDetalles,
}: GrupoAprobadorCardProps) {
  const deleteMutation = useDeleteGrupoAprobador()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <li className="group flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
            <ShieldCheck className="size-3.5 sm:size-4" />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {grupo.nombre}
            </span>
            <code className="w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {grupo.codigo}
            </code>
          </div>
        </div>

        <RowActions
          className="shrink-0"
          editLabel="Editar grupo"
          deleteLabel="Eliminar grupo"
          deleteDisabled={deleteMutation.isPending}
          onEdit={() => onEdit(grupo)}
          onDelete={() => setConfirmOpen(true)}
        />
      </div>

      {grupo.descripcion ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {grupo.descripcion}
        </p>
      ) : (
        <p className="text-xs italic text-muted-foreground/60">
          Sin descripción
        </p>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onManageDetalles(grupo)}
          className="gap-1.5 text-xs text-foreground hover:bg-muted"
        >
          <ListOrdered className="size-3.5 text-primary" />
          Gestionar Pasos
        </Button>

        <AuditInfo data={grupo} compact />
      </div>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar grupo aprobador"
        description={`¿Seguro que deseas eliminar el grupo aprobador "${grupo.nombre}" (${grupo.codigo})?`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(grupo.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}
