import type { ComponentType } from "react"
import {
  Copy,
  Edit2,
  FilePlus,
  ImageIcon,
  Maximize2,
  X,
} from "lucide-react"

import type { Activo } from "@/modules/activos/activo/api/activo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"

type ActivoDetailHeroProps = {
  activo: Activo
  tipoActivo?: TipoActivo | null
  color: string
  icon: ComponentType<{ className?: string }>
  isEditing?: boolean
  onToggleEdit?: (editing: boolean) => void
  onCopyCode: () => void
  onOpenImageModal: () => void
  onOpenAddDocument: () => void
}

export function ActivoDetailHero({
  activo,
  tipoActivo,
  color,
  icon: Icon,
  isEditing = false,
  onToggleEdit,
  onCopyCode,
  onOpenImageModal,
  onOpenAddDocument,
}: ActivoDetailHeroProps) {
  return (
    <div
      className="relative flex flex-col md:flex-row items-stretch gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}12 0%, ${color}03 100%)`,
      }}
    >
      {/* Top Accent Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color }}
      />

      {/* Left: Asset Preview Image */}
      <div className="relative shrink-0 w-full sm:w-64 md:w-72 aspect-[16/10] sm:aspect-auto sm:h-40 rounded-xl overflow-hidden border border-border/70 bg-background/60 shadow-2xs group">
        <AuthenticatedImage
          src={activo.urlImagen}
          alt={activo.nombre}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackClassName="size-full bg-muted/40 flex flex-col items-center justify-center text-muted-foreground/50"
          fallback={
            <div className="flex flex-col items-center gap-1">
              <ImageIcon className="size-8 opacity-40" />
              <span className="text-[11px] font-medium tracking-wide">
                Sin imagen
              </span>
            </div>
          }
        />
        {/* Quick Zoom Trigger */}
        {activo.urlImagen && (
          <button
            type="button"
            onClick={onOpenImageModal}
            className="absolute bottom-2 right-2 size-7 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs hover:bg-black/80 cursor-pointer"
            title="Ampliar imagen"
          >
            <Maximize2 className="size-3.5" />
          </button>
        )}
      </div>

      {/* Center/Right: Title, Subtitle, Status, and Action Buttons */}
      <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
        <div className="flex flex-col gap-1.5">
          {/* Top Row: Icon + Code + Status Badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 items-center justify-center rounded-lg text-white shadow-xs"
                style={{ backgroundColor: color }}
              >
                <Icon className="size-4" />
              </span>
              <button
                type="button"
                onClick={onCopyCode}
                className="group inline-flex items-center gap-1.5 font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer"
                title="Click para copiar código"
              >
                <span>{activo.codigo}</span>
                <Copy className="size-3.5 text-muted-foreground opacity-50 group-hover:opacity-100" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {tipoActivo ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-background border border-border/70 shadow-2xs">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {tipoActivo.nombre}
                </span>
              ) : null}

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                  activo.activo
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    activo.activo ? "bg-emerald-500 animate-pulse" : "bg-destructive"
                  }`}
                />
                {activo.activo ? "Operativo" : "Inactivo"}
              </span>
            </div>
          </div>

          {/* Subtitle / Asset Details */}
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
              {activo.nombre}
            </h2>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {activo.descripcion ||
                "Activo catalogado y verificado en el sistema integral de gestión."}
            </p>
          </div>
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/50">
          {isEditing ? (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onToggleEdit?.(false)}
              className="h-8.5 px-3.5 text-xs font-semibold gap-1.5"
            >
              <X className="size-3.5" />
              Cancelar Edición
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              type="button"
              onClick={() => onToggleEdit?.(true)}
              className="h-8.5 px-3.5 text-xs font-semibold shadow-xs gap-1.5"
            >
              <Edit2 className="size-3.5" />
              Editar Información
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenAddDocument}
            className="h-8.5 px-3.5 text-xs font-semibold shadow-xs"
          >
            <FilePlus className="size-3.5 text-primary" />
            Adjuntar Documento
          </Button>
        </div>
      </div>
    </div>
  )
}
