import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Calendar,
  Check,
  Clock,
  Copy,
  MapPin,
  Package,
  Power,
  PowerOff,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/components/TipoUbicacionBadge"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteActivo, useSetActivoActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"

type ActivoListViewProps = {
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  ubicacionesById?: Map<string, Ubicacion>
  onEdit: (activo: Activo) => void
}

export function ActivoListView({
  activos,
  tiposById,
  ubicacionesById,
  onEdit,
}: ActivoListViewProps) {
  const [activoToDelete, setActivoToDelete] = useState<Activo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const deleteMutation = useDeleteActivo()
  const setActivoMutation = useSetActivoActivo()

  function copyCode(e: React.MouseEvent, activo: Activo) {
    e.stopPropagation()
    navigator.clipboard.writeText(activo.codigo)
    setCopiedId(activo.id)
    toast.success(`Código "${activo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full space-y-3">
      {activos.map((activo) => {
        const isActivo = activo.activo !== false
        const tipoActivo =
          activo.tipoActivo ??
          (activo.tipoActivoId ? tiposById.get(activo.tipoActivoId) : undefined)
        const ubicacion =
          activo.ubicacion ??
          (activo.ubicacionId ? ubicacionesById?.get(activo.ubicacionId) : undefined)

        const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
        const TipoIcon = tipoActivo ? getTipoActivoIcon(tipoActivo.icono) : Package

        const ubicacionConfig = ubicacion
          ? TIPO_UBICACION_CONFIG[ubicacion.tipo]
          : null
        const UbicacionIcon = ubicacionConfig?.icon || MapPin

        const isCopied = copiedId === activo.id
        const isToggling =
          setActivoMutation.isPending &&
          setActivoMutation.variables?.id === activo.id

        const formattedAcquisitionDate = activo.fechaAdquisicion
          ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null

        const audit =
          "auditoria" in activo && activo.auditoria
            ? activo.auditoria
            : (activo as unknown as {
                createdAt?: string
                updatedAt?: string
                createdBy?: string
                updatedBy?: string
              })
        const createdAt = audit.createdAt ?? ""
        const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
        const createdBy = audit.createdBy ?? null
        const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

        return (
          <div
            key={activo.id}
            className={cn(
              "group relative flex flex-col justify-between gap-3.5 rounded-2xl border bg-card p-3.5 sm:p-4 md:p-5 shadow-2xs transition-all duration-200 hover:border-primary/30 hover:shadow-xs",
              isActivo
                ? "border-border/80"
                : "border-amber-500/30 bg-amber-500/[0.02]",
            )}
          >
            {/* Main content row */}
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:gap-4">
              {/* Product Framing Thumbnail (4:3 aspect, contain fit, soft backdrop) */}
              <Link
                to={routes.activos.detail(activo.id)}
                className="group/img relative mx-auto sm:mx-0 w-full max-w-[240px] sm:max-w-none sm:w-32 md:w-36 lg:w-40 h-28 sm:h-24 md:h-28 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-muted/20 to-muted/40 p-2 flex items-center justify-center transition-colors hover:border-primary/40 hover:bg-muted/50 shadow-2xs"
                title={`Ver detalles de ${activo.nombre}`}
              >
                <AuthenticatedImage
                  src={activo.urlImagen}
                  alt={activo.nombre}
                  className={cn(
                    "size-full object-contain transition-transform duration-300 group-hover/img:scale-105 drop-shadow-2xs",
                    !isActivo && "grayscale-[0.4] opacity-80",
                  )}
                  fallbackClassName="size-full flex items-center justify-center"
                  fallback={
                    <div
                      className="flex size-full items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${tipoColor}12`,
                        color: tipoColor,
                      }}
                    >
                      <TipoIcon className="size-8 sm:size-9 shrink-0 opacity-80" />
                    </div>
                  }
                />
              </Link>

              {/* Details & Actions Container */}
              <div className="flex flex-col min-w-0 flex-1 gap-2">
                {/* Top bar: Title + Badges + Actions */}
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                    {/* Title + Code + Badges Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={routes.activos.detail(activo.id)}
                        className="font-heading font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors truncate max-w-md sm:max-w-lg"
                      >
                        {activo.nombre}
                      </Link>

                      {/* Monospace Code with Copy Button */}
                      <div className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 border border-border/60">
                        <code className="font-mono text-xs font-semibold text-foreground/85">
                          {activo.codigo}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => copyCode(e, activo)}
                          className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Copiar código"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>

                      {/* Tipo de Activo Pill */}
                      {tipoActivo ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted/60 text-foreground border border-border/60">
                          <span
                            className="size-2 rounded-full shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: tipoColor,
                            }}
                          />
                          <TipoIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate max-w-[140px]">
                            {tipoActivo.nombre}
                          </span>
                        </span>
                      ) : null}

                      {/* Estado Badge (Activo / De baja) */}
                      <Badge
                        variant={isActivo ? "default" : "outline"}
                        className={cn(
                          "text-[11px] font-medium transition-colors h-5 px-2 gap-1.5",
                          isActivo
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            isActivo ? "bg-emerald-500" : "bg-amber-500",
                          )}
                        />
                        {isActivo ? "Activo" : "De baja"}
                      </Badge>
                    </div>

                    {/* Metadata Chips: Ubicación + Fecha de Adquisición */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {ubicacion ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-medium text-foreground/80 border border-primary/10 max-w-[260px] truncate">
                          <UbicacionIcon className="size-3.5 shrink-0 text-primary" />
                          <span className="truncate">{ubicacion.nombre}</span>
                        </span>
                      ) : null}

                      {formattedAcquisitionDate ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground border border-border/40">
                          <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
                          <span>Adquirido el {formattedAcquisitionDate}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions Group (Responsive: Right aligned or inline on mobile) */}
                  <div className="flex items-center gap-1.5 self-end md:self-start shrink-0 pt-1 md:pt-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isToggling}
                      onClick={() => {
                        setActivoMutation.mutate({
                          id: activo.id,
                          activo: !isActivo,
                        })
                      }}
                      className={cn(
                        "h-8 px-2.5 text-xs font-medium gap-1.5 transition-colors cursor-pointer",
                        isActivo
                          ? "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
                          : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30",
                      )}
                      title={
                        isActivo
                          ? "Dar de baja el activo"
                          : "Dar de alta el activo"
                      }
                    >
                      {isActivo ? (
                        <PowerOff className="size-3.5" />
                      ) : (
                        <Power className="size-3.5" />
                      )}
                      <span>{isActivo ? "Baja" : "Alta"}</span>
                    </Button>

                    <RowActions
                      className="shrink-0"
                      editLabel="Editar activo"
                      deleteLabel="Eliminar activo"
                      deleteDisabled={deleteMutation.isPending}
                      onEdit={() => onEdit(activo)}
                      onDelete={() => setActivoToDelete(activo)}
                    />
                  </div>
                </div>

                {/* Description */}
                {activo.descripcion ? (
                  <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activo.descripcion}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/40 italic">
                    Sin descripción registrada
                  </p>
                )}
              </div>
            </div>

            {/* Audit footer */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground/75 font-normal">
              {createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">
                      Creado:
                    </strong>{" "}
                    {formatDateTime(createdAt)}
                    {createdBy ? ` por ${createdBy}` : ""}
                  </span>
                </div>
              ) : null}

              {updatedAt && updatedAt !== createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">
                      Actualizado:
                    </strong>{" "}
                    {formatDateTime(updatedAt)}
                    {updatedBy ? ` por ${updatedBy}` : ""}
                  </span>
                </div>
              ) : null}

              {!createdAt && !updatedAt && (createdBy || updatedBy) ? (
                <div className="flex items-center gap-1.5">
                  <User className="size-3 text-muted-foreground/50 shrink-0" />
                  <span>
                    <strong className="font-medium text-muted-foreground">
                      Autor:
                    </strong>{" "}
                    {updatedBy ?? createdBy}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}

      <ConfirmDeleteDialog
        open={Boolean(activoToDelete)}
        onOpenChange={(open) => {
          if (!open) setActivoToDelete(null)
        }}
        title="Eliminar activo"
        description={
          activoToDelete
            ? `¿Seguro que deseas eliminar "${activoToDelete.nombre}"?`
            : "¿Seguro que deseas eliminar este activo?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!activoToDelete) return
          await deleteMutation.mutateAsync(activoToDelete.id)
          setActivoToDelete(null)
        }}
      />
    </div>
  )
}
