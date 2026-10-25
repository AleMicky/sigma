import { createElement, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  Calendar,
  Check,
  Clock,
  Copy,
  FileText,
  ImageIcon,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { TipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/components/TipoUbicacionBadge"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"

import type { Activo } from "../../api/activo.service"

interface ActivoCatalogoListViewProps {
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  ubicacionesById: Map<string, Ubicacion>
}

export function ActivoCatalogoListView({
  activos,
  tiposById,
  ubicacionesById,
}: Readonly<ActivoCatalogoListViewProps>) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyCode(e: React.MouseEvent, activo: Activo) {
    e.stopPropagation()
    void navigator.clipboard.writeText(activo.codigo)
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

        const ubicacionConfig = ubicacion
          ? TIPO_UBICACION_CONFIG[ubicacion.tipo]
          : null
        const ubicacionIcon = ubicacionConfig?.icon || MapPin

        const isCopied = copiedId === activo.id

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

                  {/* Fila 2: Estados y Metadatos (Estado Operativo, Activo/Baja, Ubicación, Adquisición) */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {/* Badge de Estado Operativo */}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border shadow-2xs"
                      style={{
                        backgroundColor: `${opColor}15`,
                        borderColor: `${opColor}35`,
                        color: opColor,
                      }}
                    >
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: opColor }}
                      />
                      <span className="truncate max-w-[140px]">{opNombre}</span>
                    </span>

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
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 opacity-70" />
                        <span>Adquirido el {formattedAcquisitionDate}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Fila 3: Descripción */}
                  {activo.descripcion ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed pt-0.5 break-words">
                      {activo.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 italic pt-0.5">
                      Sin descripción registrada
                    </p>
                  )}
                </div>
              </div>

              {/* Lado derecho: SOLO el botón Ver Ficha */}
              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-0.5 self-end sm:self-start">
                <Button
                  size="sm"
                  variant="outline"
                  title="Ver ficha técnica"
                  render={<Link to={routes.activos.detail(activo.id)} />}
                  className="h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors shadow-2xs cursor-pointer"
                >
                  <FileText className="size-3.5" />
                  <span>Ver Ficha</span>
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
  )
}
