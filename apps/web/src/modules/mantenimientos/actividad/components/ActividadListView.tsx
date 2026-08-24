import React, { useState } from "react"
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Copy,
  Globe2,
  Layers,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteActividad } from "../api/actividad.mutations"
import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadListViewProps = {
  actividades: ActividadMantenimiento[]
  onEdit: (actividad: ActividadMantenimiento) => void
  onManageAplicaciones: (actividad: ActividadMantenimiento) => void
}

export function ActividadListView({
  actividades,
  onEdit,
  onManageAplicaciones,
}: ActividadListViewProps) {
  const [actividadToDelete, setActividadToDelete] =
    useState<ActividadMantenimiento | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteActividad()

  function copyCode(e: React.MouseEvent, actividad: ActividadMantenimiento) {
    e.stopPropagation()
    navigator.clipboard.writeText(actividad.codigo)
    setCopiedId(actividad.id)
    toast.success(`Código "${actividad.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {actividades.map((actividad) => {
        const isCopied = copiedId === actividad.id

        const audit =
          "auditoria" in actividad && actividad.auditoria
            ? actividad.auditoria
            : actividad
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={actividad.id}
            className="group flex flex-col justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs hover:border-primary/40 hover:bg-muted/10 hover:shadow-xs transition-all"
          >
            {/* Cabecera de la fila: Icono, Título, Código, Badges y Acciones */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Wrench className="size-5" />
                </span>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {actividad.nombre}
                    </span>

                    <div className="flex items-center gap-1">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {actividad.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, actividad)}
                        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                        title="Copiar código"
                      >
                        {isCopied ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    {actividad.aplicaTodosTiposActivo ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium gap-1 px-2 py-0.5"
                      >
                        <Globe2 className="size-3" />
                        <span>Todos los Activos</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[11px] text-muted-foreground gap-1 px-2 py-0.5"
                      >
                        <Layers className="size-3" />
                        <span>Por Tipo de Activo</span>
                      </Badge>
                    )}

                    {actividad.requiereChecklist && (
                      <Badge
                        variant="outline"
                        className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-medium gap-1 px-2 py-0.5"
                      >
                        <CheckSquare className="size-3" />
                        <span>Checklist Requerido</span>
                      </Badge>
                    )}
                  </div>

                  {/* Descripción */}
                  {actividad.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {actividad.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                      Sin descripción registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onManageAplicaciones(actividad)}
                  className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground inline-flex shadow-2xs cursor-pointer"
                  title="Gestionar tipos de activos aplicables"
                >
                  <Layers className="size-3.5 text-primary" />
                  <span className="hidden sm:inline">Aplicaciones</span>
                </Button>

                <RowActions
                  editLabel="Editar actividad"
                  deleteLabel="Eliminar actividad"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(actividad)}
                  onDelete={() => setActividadToDelete(actividad)}
                />
              </div>
            </div>

            {/* Barra inferior de datos de auditoría */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2.5 border-t border-border/30 text-[11px] text-muted-foreground/75 font-normal">
              {createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">Creado:</strong>{" "}
                    {formatDateTime(createdAt)}
                    {createdBy ? ` por ${createdBy}` : ""}
                  </span>
                </div>
              ) : null}

              {updatedAt && updatedAt !== createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">Actualizado:</strong>{" "}
                    {formatDateTime(updatedAt)}
                    {updatedBy ? ` por ${updatedBy}` : ""}
                  </span>
                </div>
              ) : null}

              {!createdAt && !updatedAt && (createdBy || updatedBy) ? (
                <div className="flex items-center gap-1.5">
                  <User className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">Autor:</strong>{" "}
                    {updatedBy ?? createdBy}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}

      <ConfirmDeleteDialog
        open={Boolean(actividadToDelete)}
        onOpenChange={(open) => {
          if (!open) setActividadToDelete(null)
        }}
        title="Eliminar actividad de mantenimiento"
        description={
          actividadToDelete
            ? `¿Seguro que deseas eliminar la actividad "${actividadToDelete.nombre}"?`
            : "¿Seguro que deseas eliminar esta actividad?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!actividadToDelete) return
          await deleteMutation.mutateAsync(actividadToDelete.id)
          setActividadToDelete(null)
        }}
      />
    </div>
  )
}
