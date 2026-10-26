import { createElement } from "react"
import { Link } from "@tanstack/react-router"
import {
  Calendar,
  FileText,
  ImageIcon,
  MapPin,
} from "lucide-react"

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

import type { Activo } from "../../api/activo.service"

type ActivoCatalogoGridViewProps = {
  activos: Activo[]
  tiposById: Map<string, TipoActivo>
  ubicacionesById?: Map<string, Ubicacion>
}

export function ActivoCatalogoGridView({
  activos,
  tiposById,
  ubicacionesById,
}: Readonly<ActivoCatalogoGridViewProps>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            {/* Card Media Header */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted/30 border-b border-border/60">
              <Link
                to={routes.activos.detail(activo.id)}
                className="block size-full"
                title={`Ver detalles de ${activo.nombre}`}
              >
                {activo.urlImagen ? (
                  <AuthenticatedImage
                    src={activo.urlImagen}
                    alt={activo.nombre}
                    className={cn(
                      "size-full object-cover transition-transform duration-300 group-hover:scale-105",
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
                          className="size-10 opacity-80"
                        />
                      </div>
                    }
                  />
                ) : (
                  <div
                    className="flex size-full flex-col items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at center, ${tipoColor}20 0%, transparent 75%)`,
                    }}
                  >
                    <div
                      className="flex size-12 items-center justify-center rounded-2xl shadow-2xs"
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

              {/* Status Pills Overlay */}
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                <Badge
                  variant={isActivo ? "default" : "outline"}
                  className={cn(
                    "text-[10px] font-semibold backdrop-blur-md h-5 px-2 gap-1 shadow-2xs",
                    isActivo
                      ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                      : "border-amber-500/30 bg-amber-500/20 text-amber-800 dark:text-amber-300",
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

              {/* Operational Status Pill */}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md border shadow-2xs"
                  style={{
                    backgroundColor: `${opColor}25`,
                    borderColor: `${opColor}40`,
                    color: opColor,
                  }}
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: opColor }}
                  />
                  <span className="truncate max-w-[120px]">{opNombre}</span>
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-col flex-1 p-3.5 gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 pb-0.5">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      {activo.codigo}
                    </span>
                    {tipoActivo && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 truncate">
                        <span>•</span>
                        <span className="truncate">{tipoActivo.nombre}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={routes.activos.detail(activo.id)}
                    className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1"
                    title={activo.nombre}
                  >
                    {activo.nombre}
                  </Link>
                </div>
              </div>

              {activo.descripcion && (
                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed break-words">
                  {activo.descripcion}
                </p>
              )}

              <div className="mt-auto pt-2 flex flex-col gap-1.5 text-xs text-muted-foreground/80 border-t border-border/40">
                {ubicacion && (
                  <div className="flex items-center gap-1.5 truncate">
                    {createElement(ubicacionIcon, {
                      className: "size-3 shrink-0 text-blue-500",
                    })}
                    <span className="truncate">{ubicacion.nombre}</span>
                  </div>
                )}
                {formattedAcquisitionDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 shrink-0 opacity-70" />
                    <span>Adquirido: {formattedAcquisitionDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer: SOLO el botón Ver Ficha */}
            <div className="border-t border-border/50 bg-muted/20 p-2.5">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-medium gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors shadow-2xs cursor-pointer"
                render={<Link to={routes.activos.detail(activo.id)} />}
              >
                <FileText className="size-3.5" />
                <span>Ver Ficha</span>
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
