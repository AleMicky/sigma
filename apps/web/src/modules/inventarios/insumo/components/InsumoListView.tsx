import { useState } from "react"
import {
  Boxes,
  Calendar,
  Check,
  Clock,
  Copy,
  Cpu,
  Droplet,
  FolderTree,
  Package,
  Ruler,
  Shield,
  Tag,
  Tags,
  User,
  Wrench,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteInsumo } from "../api/insumo.mutations"
import type { Insumo } from "../api/insumo.service"

type InsumoListViewProps = {
  insumos: Insumo[]
  categoriasById: Map<string, { id: string; nombre: string; codigo: string }>
  unidadesMedidaById: Map<string, { id: string; nombre: string; simbolo?: string | null; codigo?: string }>
  onEdit: (insumo: Insumo) => void
}

function getInsumoIcon(nombre: string, codigo: string) {
  const text = (nombre + " " + codigo).toUpperCase()
  if (text.includes("MECAN") || text.includes("REPUESTO") || text.includes("HERRAMIENTA") || text.includes("TORNILLO")) {
    return Wrench
  }
  if (text.includes("ELEC") || text.includes("CIRCUITO") || text.includes("CABLE") || text.includes("BATERIA")) {
    return Zap
  }
  if (text.includes("CHIP") || text.includes("SENSOR") || text.includes("TARJETA") || text.includes("MODULO")) {
    return Cpu
  }
  if (text.includes("ACEITE") || text.includes("LUBRIC") || text.includes("GRASA") || text.includes("QUIMIC") || text.includes("LIQUIDO")) {
    return Droplet
  }
  if (text.includes("EPP") || text.includes("SEGUR") || text.includes("GUANTE") || text.includes("CASCO")) {
    return Shield
  }
  if (text.includes("CAJA") || text.includes("EMPAQUE") || text.includes("BOLSA")) {
    return Boxes
  }
  if (text.includes("TIPO") || text.includes("CLASIFICACION")) {
    return Tags
  }
  return Package
}

export function InsumoListView({
  insumos,
  categoriasById,
  unidadesMedidaById,
  onEdit,
}: InsumoListViewProps) {
  const [insumoToDelete, setInsumoToDelete] = useState<Insumo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteInsumo()

  function copyCode(e: React.MouseEvent, insumo: Insumo) {
    e.stopPropagation()
    navigator.clipboard.writeText(insumo.codigo)
    setCopiedId(insumo.id)
    toast.success(`Código "${insumo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
      {insumos.map((insumo) => {
        const catId = insumo.categoriaInsumo?.id ?? insumo.categoriaInsumoId
        const umId = insumo.unidadMedida?.id ?? insumo.unidadMedidaId
        const categoria = catId ? (insumo.categoriaInsumo ?? categoriasById.get(catId)) : undefined
        const unidadMedida = umId ? (insumo.unidadMedida ?? unidadesMedidaById.get(umId)) : undefined

        const Icon = getInsumoIcon(insumo.nombre, insumo.codigo)
        const isCopied = copiedId === insumo.id

        const audit =
          "auditoria" in insumo && insumo.auditoria
            ? insumo.auditoria
            : insumo
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={insumo.id}
            className="group flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30"
          >
            {/* Cabecera de la fila */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs transition-transform group-hover:scale-105">
                  <Icon className="size-5" />
                </span>

                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      {insumo.nombre}
                    </span>

                    <div className="flex items-center gap-1">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                        {insumo.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, insumo)}
                        className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                        title="Copiar código"
                      >
                        {isCopied ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>

                    {categoria?.nombre ? (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-[11px] font-medium"
                      >
                        <FolderTree className="size-3 text-primary" />
                        <span className="truncate max-w-[160px]">
                          {categoria.nombre}
                        </span>
                      </Badge>
                    ) : null}

                    {unidadMedida?.nombre ? (
                      <Badge
                        variant="outline"
                        className="gap-1 text-[11px] font-medium text-muted-foreground"
                      >
                        <Ruler className="size-3" />
                        <span className="truncate max-w-[120px]">
                          {unidadMedida.nombre}
                        </span>
                      </Badge>
                    ) : null}

                    {insumo.marca ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Tag className="size-3 text-primary/70" />
                        {insumo.marca}
                      </span>
                    ) : null}
                  </div>

                  {/* Descripción */}
                  {insumo.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {insumo.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                      Sin descripción registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end shrink-0 pt-0.5">
                <RowActions
                  editLabel="Editar insumo"
                  deleteLabel="Eliminar insumo"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(insumo)}
                  onDelete={() => setInsumoToDelete(insumo)}
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
        open={Boolean(insumoToDelete)}
        onOpenChange={(open) => {
          if (!open) setInsumoToDelete(null)
        }}
        title="Eliminar insumo"
        description={
          insumoToDelete
            ? `¿Seguro que deseas eliminar "${insumoToDelete.nombre}"?`
            : "¿Seguro que deseas eliminar este insumo?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!insumoToDelete) return
          await deleteMutation.mutateAsync(insumoToDelete.id)
          setInsumoToDelete(null)
        }}
      />
    </div>
  )
}
