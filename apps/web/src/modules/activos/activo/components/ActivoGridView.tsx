import { createElement, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Activity,
  Calendar,
  Check,
  Copy,
  ImageIcon,
  MapPin,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { TipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/components/TipoUbicacionBadge"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { useDeleteActivo, useSetActivoActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"
import { CambiarEstadoOperativoDialog } from "./CambiarEstadoOperativoDialog"

type ActivoGridViewProps = {
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  ubicacionesById?: Map<string, Ubicacion>
  onEdit: (activo: Activo) => void
}

export function ActivoGridView({
  activos,
  tiposById,
  ubicacionesById,
  onEdit,
}: Readonly<ActivoGridViewProps>) {
  const [activoToDelete, setActivoToDelete] = useState<Activo | null>(null)
  const [activoParaCambiarEstado, setActivoParaCambiarEstado] =
    useState<Activo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const deleteMutation = useDeleteActivo()
  const setActivoMutation = useSetActivoActivo()

  function copyCode(e: React.MouseEvent, activo: Activo) {
    e.stopPropagation()
    void navigator.clipboard.writeText(activo.codigo)
    setCopiedId(activo.id)
    toast.success(`Código "${activo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {activos.map((activo) => {
          const isActivo = activo.activo !== false
          const tipoActivo =
            activo.tipoActivo ??
            (activo.tipoActivoId ? tiposById.get(activo.tipoActivoId) : undefined)
          const ubicacion =
            activo.ubicacion ??
            (activo.ubicacionId ? ubicacionesById?.get(activo.ubicacionId) : undefined)

          const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR

          const ubicacionConfig = ubicacion
            ? TIPO_UBICACION_CONFIG[ubicacion.tipo]
            : null
          const ubicacionIcon = ubicacionConfig?.icon || MapPin

          const isCopied = copiedId === activo.id
          const isToggling =
            setActivoMutation.isPending &&
            setActivoMutation.variables?.id === activo.id

          const formattedAcquisitionDate = activo.fechaAdquisicion
            ? new Date(activo.fechaAdquisicion + "T00:00:00").toLocaleDateString(
                "es-ES",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              )
            : null

          const opColor = activo.estadoOperativo?.color || "#10B981"
          const opNombre = activo.estadoOperativo?.nombre || "Operativo"

          return (
            <div
              key={activo.id}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs transition-all hover:border-primary/40 hover:shadow-md",
                !isActivo && "bg-muted/15 opacity-85",
              )}
            >
              {/* Media Banner 16:10 */}
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60 bg-muted/30">
                <Link
                  to={routes.activos.detail(activo.id)}
                  className="size-full block overflow-hidden"
                  title={`Ver detalles de ${activo.nombre}`}
                >
                  {activo.urlImagen ? (
                    <AuthenticatedImage
                      src={activo.urlImagen}
                      alt={activo.nombre}
                      className={cn(
                        "size-full object-cover transition-transform duration-300 group-hover:scale-105",
                        !isActivo && "grayscale-[0.3] opacity-80",
                      )}
                      fallbackClassName="size-full flex items-center justify-center bg-muted/40"
                      fallback={
                        <div
                          className="flex size-full items-center justify-center"
                          style={{
                            backgroundColor: `${tipoColor}15`,
                            color: tipoColor,
                          }}
                        >
                          <TipoActivoIcon
                            name={tipoActivo?.icono}
                            className="size-8 opacity-80"
                          />
                        </div>
                      }
                    />
                  ) : (
                    <div
                      className="flex size-full flex-col items-center justify-center transition-colors"
                      style={{
                        background: `radial-gradient(circle at center, ${tipoColor}20 0%, transparent 75%)`,
                      }}
                    >
                      <div
                        className="flex size-11 items-center justify-center rounded-xl shadow-2xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${tipoColor}20`,
                          color: tipoColor,
                        }}
                      >
                        {tipoActivo ? (
                          <TipoActivoIcon
                            name={tipoActivo.icono}
                            className="size-6 opacity-85"
                          />
                        ) : (
                          <ImageIcon className="size-6 text-muted-foreground/60" />
                        )}
                      </div>
                    </div>
                  )}
                </Link>

                {/* Floating Badges */}
                <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1.5 pointer-events-none">
                  {tipoActivo ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-md bg-background/90 border border-white/20 dark:border-white/10 shadow-xs text-foreground">
                      <span
                        className="size-1.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: tipoColor }}
                      />
                      <TipoActivoIcon
                        name={tipoActivo.icono}
                        className="size-3 text-muted-foreground"
                      />
                      <span className="truncate max-w-[100px]">
                        {tipoActivo.nombre}
                      </span>
                    </div>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActivoParaCambiarEstado(activo)
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-md bg-background/90 border shadow-xs transition-opacity hover:opacity-85 pointer-events-auto cursor-pointer"
                    style={{
                      backgroundColor: `${opColor}18`,
                      borderColor: `${opColor}40`,
                      color: opColor,
                    }}
                    title="Clic para cambiar estado operativo"
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: opColor }}
                    />
                    <span className="truncate max-w-[110px]">{opNombre}</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-3.5 gap-2">
                {/* Identification & Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 border border-border/60">
                    <code className="font-mono text-[11px] font-bold text-foreground">
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

                  <Badge
                    variant={isActivo ? "default" : "outline"}
                    className={cn(
                      "text-[9.5px] font-medium h-4.5 px-1.5 gap-1",
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
                    {isActivo ? "Activo" : "Baja"}
                  </Badge>
                </div>

                {/* Title */}
                <Link
                  to={routes.activos.detail(activo.id)}
                  className="font-heading font-semibold text-sm leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
                >
                  {activo.nombre}
                </Link>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                  {ubicacion ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-full truncate">
                      {createElement(ubicacionIcon, {
                        className: "size-3 shrink-0 opacity-80",
                      })}
                      <span className="truncate">{ubicacion.nombre}</span>
                    </span>
                  ) : null}

                  {formattedAcquisitionDate ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                      <Calendar className="size-3 shrink-0 opacity-60" />
                      <span>{formattedAcquisitionDate}</span>
                    </span>
                  ) : null}
                </div>

                {/* Description */}
                {activo.descripcion ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5">
                    {activo.descripcion}
                  </p>
                ) : null}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setActivoParaCambiarEstado(activo)}
                  className="h-7 px-2 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Cambiar estado operativo"
                >
                  <Activity className="size-3 text-primary" />
                  <span>Estado</span>
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={isToggling}
                    onClick={() => {
                      setActivoMutation.mutate({
                        id: activo.id,
                        activo: !isActivo,
                      })
                    }}
                    className={cn(
                      "size-7 cursor-pointer",
                      isActivo
                        ? "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                        : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10",
                    )}
                    title={isActivo ? "Dar de baja" : "Dar de alta"}
                  >
                    {isActivo ? (
                      <PowerOff className="size-3.5" />
                    ) : (
                      <Power className="size-3.5" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(activo)}
                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Editar activo"
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={deleteMutation.isPending}
                    onClick={() => setActivoToDelete(activo)}
                    className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Eliminar activo"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(activoToDelete)}
        onOpenChange={(open) => !open && setActivoToDelete(null)}
        title="Eliminar activo"
        description={`¿Estás seguro de que deseas eliminar "${activoToDelete?.nombre}" (${activoToDelete?.codigo})? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar activo"
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!activoToDelete) return
          await deleteMutation.mutateAsync(activoToDelete.id)
          setActivoToDelete(null)
        }}
      />

      <CambiarEstadoOperativoDialog
        open={Boolean(activoParaCambiarEstado)}
        onOpenChange={(open) => !open && setActivoParaCambiarEstado(null)}
        activo={activoParaCambiarEstado}
      />
    </>
  )
}
