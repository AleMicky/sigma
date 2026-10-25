import { createElement, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Activity,
  Calendar,
  Check,
  Clock,
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
import { formatDateTime } from "@/shared/utils/date.utils"

import { useDeleteActivo, useSetActivoActivo } from "../api/activo.mutations"
import type { Activo } from "../api/activo.service"
import { CambiarEstadoOperativoDialog } from "./CambiarEstadoOperativoDialog"

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

          const audit =
            "auditoria" in activo && activo.auditoria
              ? activo.auditoria
              : (activo as unknown as {
                  createdAt?: string
                  updatedAt?: string
                  createdBy?: string
                  updatedBy?: string
                })
          const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
          const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

          return (
            <div
              key={activo.id}
              className={cn(
                "group flex flex-col justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30",
                !isActivo && "bg-muted/15 opacity-85",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                {/* Lado izquierdo: Thumbnail + Información */}
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Thumbnail con formato panorámico */}
                  <Link
                    to={routes.activos.detail(activo.id)}
                    className="group/img relative w-28 sm:w-36 md:w-44 h-20 sm:h-24 md:h-28 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30 flex items-center justify-center transition-all hover:border-primary/40 hover:bg-muted/40 shadow-2xs"
                    title={`Ver detalles de ${activo.nombre}`}
                  >
                    {activo.urlImagen ? (
                      <AuthenticatedImage
                        src={activo.urlImagen}
                        alt={activo.nombre}
                        className={cn(
                          "size-full object-cover transition-transform duration-300 group-hover/img:scale-105",
                          !isActivo && "grayscale-[0.4] opacity-80",
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
                              className="size-8 sm:size-9 opacity-80"
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
                          className="flex size-10 items-center justify-center rounded-xl shadow-2xs transition-transform group-hover/img:scale-105"
                          style={{
                            backgroundColor: `${tipoColor}20`,
                            color: tipoColor,
                          }}
                        >
                          {tipoActivo ? (
                            <TipoActivoIcon
                              name={tipoActivo.icono}
                              className="size-5.5 opacity-85"
                            />
                          ) : (
                            <ImageIcon className="size-5 text-muted-foreground/60" />
                          )}
                        </div>
                      </div>
                    )}
                  </Link>

                  {/* Contenedor de Información Central */}
                  <div className="flex flex-col min-w-0 flex-1 gap-2">
                    {/* Fila 1: Título, Código y Tipo */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={routes.activos.detail(activo.id)}
                        className="font-heading font-semibold text-base sm:text-lg text-foreground hover:text-primary transition-colors truncate max-w-full sm:max-w-md"
                      >
                        {activo.nombre}
                      </Link>

                      {/* Código con botón interactivo de copiado */}
                      <div className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 border border-border/60">
                        <code className="font-mono text-[11px] font-bold text-foreground/85">
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
                          <TipoActivoIcon
                            name={tipoActivo.icono}
                            className="size-3 text-muted-foreground"
                          />
                          <span className="truncate max-w-[130px]">
                            {tipoActivo.nombre}
                          </span>
                        </span>
                      ) : null}
                    </div>

                    {/* Fila 2: Estados y Metadatos (Sin colisiones con el título) */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* Badge de Estado Operativo (Interactivo) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActivoParaCambiarEstado(activo)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border hover:opacity-85 transition-opacity cursor-pointer shadow-2xs"
                        style={{
                          backgroundColor: `${opColor}15`,
                          borderColor: `${opColor}35`,
                          color: opColor,
                        }}
                        title="Haga clic para cambiar el estado operativo"
                      >
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: opColor }}
                        />
                        <span className="truncate max-w-[140px]">{opNombre}</span>
                      </button>

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

                      {/* Chips de Ubicación */}
                      {ubicacion ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-[240px] truncate">
                          {createElement(ubicacionIcon, {
                            className: "size-3 shrink-0 opacity-80",
                          })}
                          <span className="truncate">{ubicacion.nombre}</span>
                        </span>
                      ) : null}

                      {/* Fecha de Adquisición */}
                      {formattedAcquisitionDate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80">
                          <Calendar className="size-3 shrink-0 opacity-60" />
                          <span>Adquirido el {formattedAcquisitionDate}</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Fila 3: Descripción */}
                    {activo.descripcion ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5 max-w-4xl">
                        {activo.descripcion}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                        Sin descripción registrada
                      </p>
                    )}
                  </div>
                </div>

                {/* Lado derecho: Botones de Acción */}
                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center pt-1 sm:pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setActivoParaCambiarEstado(activo)}
                    className="h-7.5 px-2.5 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    title="Cambiar estado operativo"
                  >
                    <Activity className="size-3.5 text-primary" />
                    <span>Estado</span>
                  </Button>

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
                      "h-7.5 px-2.5 text-xs font-medium gap-1.5 transition-colors cursor-pointer",
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

                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onEdit(activo)}
                    className="size-7.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                    title="Editar activo"
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={deleteMutation.isPending}
                    onClick={() => setActivoToDelete(activo)}
                    className="size-7.5 text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                    title="Eliminar activo"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Barra inferior de auditoría discreta */}
              {updatedAt ? (
                <div className="flex items-center gap-1.5 pt-2 border-t border-border/30 text-[10.5px] text-muted-foreground/60 font-normal">
                  <Clock className="size-3 text-muted-foreground/40 shrink-0" />
                  <span>
                    Actualizado el {formatDateTime(updatedAt)}
                    {updatedBy ? ` por ${updatedBy}` : ""}
                  </span>
                </div>
              ) : null}
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
