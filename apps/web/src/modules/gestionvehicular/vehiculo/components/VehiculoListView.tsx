import { Link } from "@tanstack/react-router"
import {
  Calendar,
  CarFront,
  Check,
  ChevronRight,
  Copy,
  Layers,
  MapPin,
  Maximize2,
} from "lucide-react"
import { routes } from "@/app/config/routes"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard"
import { cn } from "@/shared/lib/utils"

import type { VehiculoCatalogo } from "../api/vehiculo.types"
import {
  getAtributosVisibles,
  getPlacaFromAtributos,
  getVehiculoTituloDinamico,
  isPlacaAtributo,
} from "../lib/vehiculo-atributos.utils"

type VehiculoListViewProps = {
  vehiculos: VehiculoCatalogo[]
  onPreviewImage: (vehiculo: VehiculoCatalogo) => void
}

function formatDateShort(dateStr?: string | null): string | null {
  if (!dateStr) return null
  const parts = dateStr.split("-")
  const date =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function VehiculoListView({
  vehiculos,
  onPreviewImage,
}: Readonly<VehiculoListViewProps>) {
  const { copy: copyToClipboard, isCopied: isPlacaCopiada } =
    useCopyToClipboard()

  function handleCopyPlaca(vehiculoId: string, placa: string) {
    void copyToClipboard(placa, vehiculoId)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card divide-y divide-border/60 shadow-2xs">
      {vehiculos.map((v) => {
        const isActivo = v.activo !== false
        const accentColor = v.tipoActivo?.color || "#06B6D4"
        const estadoColor = v.estadoOperativo?.color || "#10B981"
        const estadoNombre = v.estadoOperativo?.nombre || "Operativo"
        const formattedDate = formatDateShort(v.fechaAdquisicion)
        const isCopied = isPlacaCopiada(v.id)
        const atributosVisibles = getAtributosVisibles(v)
        const { valor: placaValor } = getPlacaFromAtributos(v)
        const titulo = getVehiculoTituloDinamico(v)
        const otrosAtributos = placaValor
          ? atributosVisibles.filter((attr) => !isPlacaAtributo(attr))
          : atributosVisibles

        return (
          <div
            key={v.id}
            className={cn(
              "group relative flex flex-col sm:flex-row sm:items-stretch gap-3.5 sm:gap-4 p-3.5 sm:p-4 pl-4 sm:pl-5 transition-colors hover:bg-muted/25",
              !isActivo && "bg-muted/15 opacity-85",
            )}
          >
            {/* Indicador lateral sutil del estado operativo */}
            <span
              aria-hidden
              className="absolute inset-y-3 left-1.5 w-1 rounded-full transition-opacity opacity-70 group-hover:opacity-100"
              style={{ backgroundColor: estadoColor }}
            />

            {/* Imagen panorámica a la izquierda */}
            <div className="relative w-full sm:w-44 md:w-52 h-40 sm:h-auto sm:min-h-[124px] shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30 shadow-2xs">
              {v.urlImagen ? (
                <AuthenticatedImage
                  src={v.urlImagen}
                  alt={titulo}
                  className={cn(
                    "size-full object-cover transition-transform duration-300 group-hover:scale-105",
                    !isActivo && "grayscale-[0.3] opacity-80",
                  )}
                  fallbackClassName="size-full flex items-center justify-center bg-muted/40"
                  fallback={
                    <div
                      className="flex size-full flex-col items-center justify-center gap-1"
                      style={{
                        background: `radial-gradient(circle at center, ${accentColor}1f 0%, transparent 75%)`,
                      }}
                    >
                      <CarFront
                        className="size-8 opacity-70"
                        style={{ color: accentColor }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        Sin imagen
                      </span>
                    </div>
                  }
                />
              ) : (
                <div
                  className="flex size-full flex-col items-center justify-center gap-1.5"
                  style={{
                    background: `radial-gradient(circle at center, ${accentColor}1c 0%, transparent 75%)`,
                  }}
                >
                  <div
                    className="flex size-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    <CarFront className="size-5" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Sin imagen
                  </span>
                </div>
              )}

              {v.urlImagen ? (
                <button
                  type="button"
                  onClick={() => onPreviewImage(v)}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-black/65 px-2 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-xs transition-all group-hover:opacity-100 hover:bg-black/85 cursor-pointer"
                  title="Ampliar imagen"
                >
                  <Maximize2 className="size-3" />
                  <span>Ampliar</span>
                </button>
              ) : null}
            </div>

            {/* Contenido principal + Placa destacada + atributos visibles */}
            <div className="flex flex-1 flex-col justify-between gap-2.5 min-w-0">
              {/* Fila superior: Placa estilo matrícula + título + estados + acción */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2.5">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {placaValor ? (
                      <div className="inline-flex items-center gap-2 rounded-lg border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-gradient-to-b from-background to-cyan-500/10 px-2.5 py-1 shadow-xs">
                        <span className="rounded bg-cyan-600 dark:bg-cyan-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white">
                          Placa
                        </span>
                        <code className="font-mono text-sm sm:text-base font-black tracking-[0.12em] text-foreground uppercase">
                          {placaValor}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyPlaca(v.id, placaValor)}
                          className="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-cyan-500/15 hover:text-foreground transition-colors cursor-pointer"
                          title="Copiar placa"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-lg border border-dashed border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-medium italic text-muted-foreground">
                        Sin placa registrada
                      </span>
                    )}

                    {titulo !== placaValor ? (
                      <Link
                        to={routes.gestionVehicular.vehiculoDetalle(v.id)}
                        className="font-heading text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors truncate"
                        title={titulo}
                      >
                        {titulo}
                      </Link>
                    ) : null}
                  </div>

                  {/* Metadatos: ubicación, flotas y fecha */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    {v.ubicacion ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-blue-700 dark:text-blue-400 font-medium">
                        <MapPin className="size-3 shrink-0" />
                        <span>{v.ubicacion.nombre}</span>
                      </span>
                    ) : null}

                    {v.flotas.map((flota) => (
                      <span
                        key={flota.id}
                        className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/50 px-2 py-0.5 text-foreground/85 font-medium"
                      >
                        <Layers className="size-3 shrink-0 text-primary" />
                        <span>{flota.nombre}</span>
                      </span>
                    ))}

                    {formattedDate ? (
                      <span className="inline-flex items-center gap-1 px-1">
                        <Calendar className="size-3 shrink-0 opacity-70" />
                        <span>Adq. {formattedDate}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Estados + CTA Ficha */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold"
                    style={{
                      backgroundColor: `${estadoColor}15`,
                      borderColor: `${estadoColor}40`,
                      color: estadoColor,
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: estadoColor }}
                    />
                    {estadoNombre}
                  </span>

                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5.5 px-2 text-[10px] font-semibold gap-1",
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
                    {isActivo ? "Habilitado" : "Inactivo"}
                  </Badge>

                  <Button
                    size="xs"
                    variant="outline"
                    render={
                      <Link
                        to={routes.gestionVehicular.vehiculoDetalle(v.id)}
                      />
                    }
                    className="h-7 px-2.5 text-xs font-semibold gap-1 hover:border-primary/50 hover:text-primary"
                  >
                    <span>Ver ficha</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Atributos dinámicos visibles restantes del vehículo */}
              {otrosAtributos.length > 0 ? (
                <dl className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1.5 pt-2.5 border-t border-border/50">
                  {otrosAtributos.map((attr) => {
                    const displayValue = attr.valorFormateado ?? attr.valor
                    const isWide =
                      attr.tipoDatoCodigo === "TEXTAREA" ||
                      attr.tipoDatoCodigo === "MULTISELECT"

                    return (
                      <div
                        key={attr.atributoId}
                        className={cn(
                          "flex flex-col gap-0.5 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-1.5 min-w-0 transition-colors group-hover:bg-background/80",
                          isWide && "col-span-2",
                        )}
                      >
                        <dt
                          className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate"
                          title={attr.etiqueta}
                        >
                          {attr.etiqueta}
                        </dt>
                        <dd
                          className={cn(
                            "text-xs",
                            displayValue
                              ? "font-semibold text-foreground"
                              : "italic text-muted-foreground/60",
                            attr.tipoDatoCodigo === "TEXTAREA"
                              ? "whitespace-pre-wrap line-clamp-2 font-normal"
                              : "truncate",
                          )}
                          title={displayValue ?? "Sin registrar"}
                        >
                          {displayValue || "—"}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
