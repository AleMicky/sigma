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
    <div className="w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/40 overflow-hidden shadow-2xs">
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
              "group flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30",
              !isActivo && "bg-muted/15 opacity-85",
            )}
          >
            {/* Fila principal */}
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                {/* Imagen del activo con encuadre proporcionado */}
                <Link
                  to={routes.activos.detail(activo.id)}
                  className="group/img relative size-16 sm:size-20 md:size-24 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/20 to-muted/40 p-1.5 flex items-center justify-center transition-all hover:border-primary/40 hover:bg-muted/50 shadow-2xs"
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
                          backgroundColor: `${tipoColor}15`,
                          color: tipoColor,
                        }}
                      >
                        <TipoIcon className="size-7 sm:size-8 shrink-0 opacity-80" />
                      </div>
                    }
                  />
                </Link>

                {/* Contenedor de información central */}
                <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                  {/* Fila 1: Título, Código, Tipo y Estado */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={routes.activos.detail(activo.id)}
                      className="font-heading font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate max-w-md"
                    >
                      {activo.nombre}
                    </Link>

                    {/* Código con botón interactivo de copiado */}
                    <div className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 border border-border/60">
                      <code className="font-mono text-[11px] font-semibold text-foreground/85">
                        {activo.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => copyCode(e, activo)}
                        className="inline-flex size-3.5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copiar código"
                      >
                        {isCopied ? (
                          <Check className="size-2.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-2.5" />
                        )}
                      </button>
                    </div>

                    {/* Badge de Tipo de Activo */}
                    {tipoActivo ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted/60 text-foreground border border-border/60">
                        <span
                          className="size-2 rounded-full shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: tipoColor,
                          }}
                        />
                        <TipoIcon className="size-3 shrink-0 text-muted-foreground" />
                        <span className="truncate max-w-[140px]">
                          {tipoActivo.nombre}
                        </span>
                      </span>
                    ) : null}

                    {/* Badge de Estado Activo / De Baja */}
                    <Badge
                      variant={isActivo ? "default" : "outline"}
                      className={cn(
                        "text-[10px] font-medium transition-colors h-5 px-2 gap-1.5",
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

                  {/* Fila 2: Chips de Ubicación y Fecha de Adquisición */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {ubicacion ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-[240px] truncate">
                        <UbicacionIcon className="size-3 shrink-0 opacity-80" />
                        <span className="truncate">{ubicacion.nombre}</span>
                      </span>
                    ) : null}

                    {formattedAcquisitionDate ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
                        <Calendar className="size-3 shrink-0 opacity-60" />
                        <span>Adquirido el {formattedAcquisitionDate}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Fila 3: Descripción */}
                  {activo.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {activo.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                      Sin descripción registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isToggling}
                  onClick={() => {
                    setActivoMutation.mutate({
                      id: activo.id,
                      activo: !isActivo,
                    })
                  }}
                  className={cn(
                    "h-7 px-2 text-xs font-medium gap-1 transition-colors cursor-pointer",
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
                    <PowerOff className="size-3" />
                  ) : (
                    <Power className="size-3" />
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

            {/* Barra inferior de auditoría */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2.5 border-t border-border/30 text-[11px] text-muted-foreground/75 font-normal">
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
