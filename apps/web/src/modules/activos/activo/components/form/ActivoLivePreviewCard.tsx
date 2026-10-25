import { createElement, useEffect, useMemo, useState } from "react"
import {
  Calendar,
  Check,
  Copy,
  Eye,
  FileText,
  ImageIcon,
  LayoutGrid,
  List,
  MapPin,
} from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { TipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/components/TipoUbicacionBadge"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

type ActivoLivePreviewCardProps = {
  codigo?: string
  nombre?: string
  descripcion?: string | null
  fechaAdquisicion?: string | null
  selectedTipo?: TipoActivo
  ubicacion?: Ubicacion
  estadoOperativoNombre?: string | null
  estadoOperativoColor?: string | null
  pendingFile?: File | null
  currentUrl?: string | null
  removeExistingImage?: boolean
}

export function ActivoLivePreviewCard({
  codigo,
  nombre,
  descripcion,
  fechaAdquisicion,
  selectedTipo,
  ubicacion,
  estadoOperativoNombre,
  estadoOperativoColor,
  pendingFile,
  currentUrl,
  removeExistingImage,
}: ActivoLivePreviewCardProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card")
  const [isCopied, setIsCopied] = useState(false)

  const localPreviewUrl = useMemo(() => {
    if (!pendingFile) return null
    return URL.createObjectURL(pendingFile)
  }, [pendingFile])

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  const showExisting = Boolean(currentUrl) && !removeExistingImage && !pendingFile

  const tipoColor = selectedTipo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  const ubicacionConfig = ubicacion ? TIPO_UBICACION_CONFIG[ubicacion.tipo] : null
  const ubicacionIcon = ubicacionConfig?.icon || MapPin

  const formattedDate = fechaAdquisicion
    ? new Date(fechaAdquisicion + "T00:00:00").toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  const opColor = estadoOperativoColor || "#10B981"
  const opNombre = estadoOperativoNombre || "Operativo"

  const handleCopyCode = () => {
    if (!codigo) return
    void navigator.clipboard.writeText(codigo)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Renderizador de imagen compartida
  const renderMedia = (className?: string, imgClassName?: string) => {
    if (localPreviewUrl) {
      return (
        <div className={cn("relative overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/25", className)}>
          <img
            src={localPreviewUrl}
            alt="Vista previa"
            className={cn("size-full object-cover transition-transform duration-300", imgClassName)}
          />
        </div>
      )
    }

    if (showExisting && currentUrl) {
      return (
        <div className={cn("relative overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/25", className)}>
          <AuthenticatedImage
            src={currentUrl}
            alt={nombre || "Activo"}
            className={cn("size-full object-cover transition-transform duration-300", imgClassName)}
            fallbackClassName="size-full flex items-center justify-center"
            fallback={
              <div
                className="flex size-full items-center justify-center"
                style={{
                  backgroundColor: `${tipoColor}15`,
                  color: tipoColor,
                }}
              >
                <TipoActivoIcon name={selectedTipo?.icono} className="size-8 opacity-80" />
              </div>
            }
          />
        </div>
      )
    }

    return (
      <div
        className={cn("relative flex items-center justify-center transition-colors", className)}
        style={{
          background: `radial-gradient(circle at center, ${tipoColor}20 0%, transparent 75%)`,
        }}
      >
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60">
          <div
            className="flex size-12 items-center justify-center rounded-xl shadow-2xs"
            style={{
              backgroundColor: `${tipoColor}18`,
              color: tipoColor,
            }}
          >
            {selectedTipo ? (
              <TipoActivoIcon name={selectedTipo.icono} className="size-6 opacity-85" />
            ) : (
              <ImageIcon className="size-6 opacity-60" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight text-muted-foreground/70">
            Sin imagen adjunta
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs transition-all flex flex-col gap-3.5">
      {/* Header del preview con switch de vista */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
            <Eye className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold tracking-tight text-foreground font-heading">
                Vista Previa
              </h4>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider">
                  En vivo
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cómo se mostrará en el catálogo
            </p>
          </div>
        </div>

        {/* Toggle Tarjeta / Lista */}
        <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={cn(
              "flex size-6 items-center justify-center rounded-md text-xs transition-colors cursor-pointer",
              viewMode === "card"
                ? "bg-background text-foreground shadow-2xs font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Vista de tarjeta"
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "flex size-6 items-center justify-center rounded-md text-xs transition-colors cursor-pointer",
              viewMode === "list"
                ? "bg-background text-foreground shadow-2xs font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Vista de fila compacta"
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Vista 1: Tarjeta Destacada (Hero Card) */}
      {viewMode === "card" ? (
        <div className="group/card relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-gradient-to-b from-card to-muted/20 shadow-xs transition-all hover:border-border hover:shadow-sm">
          {/* Banner Fotográfico con Proporción Panorámica 16:10 */}
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/60 bg-muted/30">
            {renderMedia("size-full", "group-hover/card:scale-103")}

            {/* Badges Flotantes sobre la Imagen */}
            <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1.5 pointer-events-none">
              {/* Tipo de Activo */}
              {selectedTipo ? (
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium backdrop-blur-md bg-background/85 border border-white/20 dark:border-white/10 shadow-xs text-foreground">
                  <span
                    className="size-2 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: tipoColor }}
                  />
                  <TipoActivoIcon name={selectedTipo.icono} className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{selectedTipo.nombre}</span>
                </div>
              ) : <div />}

              {/* Estado Operativo */}
              <Badge
                variant="outline"
                className="text-[10px] font-medium h-6 px-2.5 gap-1.5 backdrop-blur-md bg-background/90 shadow-xs border"
                style={{
                  backgroundColor: `${opColor}15`,
                  borderColor: `${opColor}40`,
                  color: opColor,
                }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: opColor }}
                />
                <span className="truncate max-w-[110px]">{opNombre}</span>
              </Badge>
            </div>
          </div>

          {/* Cuerpo de la Tarjeta */}
          <div className="flex flex-col gap-2.5 p-3.5">
            {/* Fila: Código & Fecha */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 border border-border/60">
                <code className="font-mono text-[11px] font-bold text-foreground tracking-wide">
                  {codigo || "CÓDIGO"}
                </code>
                {codigo ? (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copiar código"
                  >
                    {isCopied ? (
                      <Check className="size-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-2.5" />
                    )}
                  </button>
                ) : null}
              </div>

              {formattedDate ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground">
                  <Calendar className="size-3 shrink-0 opacity-70" />
                  <span>{formattedDate}</span>
                </span>
              ) : null}
            </div>

            {/* Nombre del Activo */}
            <h5
              className={cn(
                "font-heading font-semibold text-sm sm:text-base leading-snug break-words",
                nombre ? "text-foreground" : "text-muted-foreground/60 italic font-normal",
              )}
            >
              {nombre || "Nombre del activo…"}
            </h5>

            {/* Ubicación */}
            {ubicacion ? (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-500/20 w-fit max-w-full">
                {createElement(ubicacionIcon, { className: "size-3 shrink-0 opacity-80" })}
                <span className="truncate">{ubicacion.nombre}</span>
              </div>
            ) : null}

            {/* Descripción en recuadro estilizado */}
            {descripcion ? (
              <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5 text-xs text-muted-foreground leading-relaxed">
                <FileText className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                <p className="line-clamp-3 break-words text-[11px] leading-relaxed">
                  {descripcion}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Vista 2: Fila Compacta (Como en listado del catálogo) */
        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 p-3">
          <div className="flex items-start gap-3">
            {/* Thumbnail apaisado */}
            <div className="relative w-24 h-20 sm:w-28 sm:h-22 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/40 shadow-2xs">
              {renderMedia("size-full", "object-contain")}
            </div>

            {/* Contenido derecho */}
            <div className="flex flex-col min-w-0 flex-1 gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground border border-border/60">
                  {codigo || "CÓDIGO"}
                </span>

                {selectedTipo ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground border border-border/60">
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tipoColor }}
                    />
                    <span className="truncate max-w-[90px]">{selectedTipo.nombre}</span>
                  </span>
                ) : null}
              </div>

              <h5
                className={cn(
                  "text-xs font-semibold line-clamp-2 break-words leading-tight",
                  nombre ? "text-foreground" : "text-muted-foreground/60 italic font-normal",
                )}
              >
                {nombre || "Nombre del activo…"}
              </h5>

              <div>
                <Badge
                  variant="outline"
                  className="text-[9.5px] font-medium h-5 px-1.5 gap-1"
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
                  <span className="truncate">{opNombre}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Ubicación y Fecha */}
          {(ubicacion || formattedDate) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-[10.5px]">
              {ubicacion ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  {createElement(ubicacionIcon, { className: "size-3 shrink-0 opacity-80" })}
                  <span className="truncate">{ubicacion.nombre}</span>
                </span>
              ) : null}

              {formattedDate ? (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3 shrink-0 opacity-60" />
                  <span>{formattedDate}</span>
                </span>
              ) : null}
            </div>
          )}

          {/* Descripción preview */}
          {descripcion ? (
            <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed pt-1.5 border-t border-border/40 break-words">
              {descripcion}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
