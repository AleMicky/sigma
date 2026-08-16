import { useNavigate } from "@tanstack/react-router"
import { Calendar, FileText, ImageIcon, MapPin, Package } from "lucide-react"

import { routes } from "@/app/config/routes"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"

import type { Activo } from "../../api/activo.service"

interface ActivoCatalogoCardProps {
  activo: Activo
  tipoActivo?: TipoActivo | null
  ubicacion?: Ubicacion | null
}

export function ActivoCatalogoCard({
  activo,
  tipoActivo: tipoActivoProp,
  ubicacion: ubicacionProp,
}: ActivoCatalogoCardProps) {
  const navigate = useNavigate()
  const tipoActivo = activo.tipoActivo ?? tipoActivoProp
  const ubicacion = activo.ubicacion ?? ubicacionProp
  const tipoColor = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const TipoIcon = tipoActivo ? getTipoActivoIcon(tipoActivo.icono) : Package

  const formattedDate = activo.fechaAdquisicion
    ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest("button, a, [role='button'], input, select, textarea")) {
      return
    }
    void navigate({
      to: routes.activos.detail(activo.id),
    })
  }

  return (
    <li
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Top Accent Color Bar */}
      <div
        className="h-1 w-full shrink-0 transition-opacity opacity-80 group-hover:opacity-100"
        style={{ backgroundColor: tipoColor }}
      />

      {/* Image Preview Banner with Floating Badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40 border-b border-border/50">
        <AuthenticatedImage
          src={activo.urlImagen}
          alt={activo.nombre}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackClassName="size-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/80 text-muted-foreground/50"
          fallback={
            <div className="flex flex-col items-center gap-1.5">
              <ImageIcon className="size-8 opacity-40" />
              <span className="text-[11px] font-medium tracking-wide">Sin imagen</span>
            </div>
          }
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Top Badge: Tipo de Activo */}
        {tipoActivo ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-md backdrop-blur-md text-white border border-white/20"
              style={{ backgroundColor: `${tipoColor}dd` }}
            >
              <TipoIcon className="size-3 shrink-0" />
              <span className="truncate max-w-[120px]">{tipoActivo.nombre}</span>
            </span>
          </div>
        ) : null}

        {/* Floating Top Action: Detail Link */}
        <Button
          size="icon-xs"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation()
            void navigate({ to: routes.activos.detail(activo.id) })
          }}
          className="absolute top-2.5 right-2.5 z-10 size-7 rounded-lg bg-background/80 shadow-md backdrop-blur-md opacity-90 transition-opacity hover:opacity-100 hover:bg-background"
          title="Ver Ficha Técnica"
        >
          <FileText className="size-3.5" />
        </Button>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-3.5 gap-2.5">
        <div className="flex flex-col gap-1.5">
          {/* Code & Acquisition Date */}
          <div className="flex items-center justify-between gap-2">
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground border border-border/60">
              {activo.codigo}
            </code>

            {formattedDate ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="size-3 shrink-0" />
                {formattedDate}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {activo.nombre}
          </h3>

          {/* Description */}
          {activo.descripcion ? (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
              {activo.descripcion}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic line-clamp-1">
              Sin descripción adicional
            </p>
          )}
        </div>

        {/* Bottom Section: Location */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="min-w-0 flex-1">
            {ubicacion ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground border border-border/40 truncate max-w-full"
                title={`${ubicacion.codigo} - ${ubicacion.nombre}`}
              >
                <MapPin className="size-3 shrink-0 text-primary" />
                <span className="truncate">{ubicacion.nombre}</span>
              </span>
            ) : (
              <span className="text-xs italic text-muted-foreground/60">
                Sin ubicación
              </span>
            )}
          </div>

          <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ver ficha →
          </span>
        </div>
      </div>
    </li>
  )
}
