import {
  Activity,
  CarFront,
  Check,
  Copy,
  Edit2,
  FilePlus,
  ImageIcon,
  Layers,
  Maximize2,
  X,
} from "lucide-react"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard"

import type { VehiculoCatalogo } from "../../api/vehiculo.types"
import { getPlacaFromAtributos } from "../../lib/vehiculo-atributos.utils"

type VehiculoDetailHeroProps = {
  vehiculo: VehiculoCatalogo
  titulo: string
  color: string
  isEditing?: boolean
  onToggleEdit?: (editing: boolean) => void
  onOpenImageModal: () => void
  onOpenAddDocument: () => void
  onCambiarEstado?: () => void
}

export function VehiculoDetailHero({
  vehiculo,
  titulo,
  color,
  isEditing = false,
  onToggleEdit,
  onOpenImageModal,
  onOpenAddDocument,
  onCambiarEstado,
}: Readonly<VehiculoDetailHeroProps>) {
  const { copy: copyToClipboard, isCopied } = useCopyToClipboard()
  const isActivo = vehiculo.activo !== false
  const estadoColor = vehiculo.estadoOperativo?.color || "#10b981"
  const { valor: placaValor } = getPlacaFromAtributos(vehiculo)

  function handleCopyPlaca(placa: string) {
    void copyToClipboard(placa, "placa")
  }

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

      {/* Left: Vehicle Photo */}
      <div className="relative shrink-0 w-full sm:w-64 md:w-72 aspect-[16/10] sm:aspect-auto sm:h-40 rounded-xl overflow-hidden border border-border/70 bg-background/60 shadow-2xs group">
        <AuthenticatedImage
          src={vehiculo.urlImagen}
          alt={titulo}
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
        {vehiculo.urlImagen ? (
          <button
            type="button"
            onClick={onOpenImageModal}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-black/65 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs hover:bg-black/85 cursor-pointer"
            title="Ampliar imagen"
          >
            <Maximize2 className="size-3" />
            <span>Ampliar</span>
          </button>
        ) : null}
      </div>

      {/* Right: Dynamic Title, Flotas, Statuses & Actions */}
      <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-start gap-2.5 min-w-0">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs mt-0.5"
                style={{ backgroundColor: color }}
              >
                <CarFront className="size-4.5" />
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  {placaValor ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-600/50 dark:border-cyan-400/50 bg-gradient-to-b from-background to-cyan-500/12 px-3 py-1 shadow-xs">
                      <span className="rounded bg-cyan-600 dark:bg-cyan-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white">
                        Placa
                      </span>
                      <code className="font-mono text-base sm:text-lg font-black tracking-[0.14em] text-foreground uppercase">
                        {placaValor}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyPlaca(placaValor)}
                        className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-cyan-500/15 hover:text-foreground transition-colors cursor-pointer"
                        title="Copiar placa"
                      >
                        {isCopied("placa") ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  ) : null}
                  {titulo !== placaValor ? (
                    <h2 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
                      {titulo}
                    </h2>
                  ) : null}
                </div>
                {vehiculo.flotas.length > 0 ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {vehiculo.flotas.map((flota) => (
                      <span
                        key={flota.id}
                        className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/80 px-2 py-0.5 text-xs shadow-2xs"
                      >
                        <Layers className="size-3 text-primary shrink-0" />
                        <span className="font-semibold text-foreground">
                          {flota.nombre}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {vehiculo.tipoActivo ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-background border border-border/70 shadow-2xs">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {vehiculo.tipoActivo.nombre}
                </span>
              ) : null}

              {vehiculo.estadoOperativo ? (
                <button
                  type="button"
                  onClick={onCambiarEstado}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: `${estadoColor}18`,
                    color: estadoColor,
                    borderColor: `${estadoColor}40`,
                  }}
                  title="Clic para cambiar estado operativo"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: estadoColor }}
                  />
                  {vehiculo.estadoOperativo.nombre}
                </button>
              ) : null}

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                  isActivo
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isActivo ? "bg-emerald-500 animate-pulse" : "bg-destructive"
                  }`}
                />
                {isActivo ? "Habilitado" : "Inactivo"}
              </span>
            </div>
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
              className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer"
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
              className="h-8.5 px-3.5 text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
            >
              <Edit2 className="size-3.5" />
              Editar Datos del Vehículo
            </Button>
          )}

          {onCambiarEstado ? (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onCambiarEstado}
              className="h-8.5 px-3.5 text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
            >
              <Activity className="size-3.5 text-primary" />
              Cambiar Estado Operativo
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onOpenAddDocument}
            className="h-8.5 px-3.5 text-xs font-semibold shadow-xs gap-1.5 cursor-pointer"
          >
            <FilePlus className="size-3.5 text-primary" />
            Adjuntar Documento
          </Button>
        </div>
      </div>
    </div>
  )
}
