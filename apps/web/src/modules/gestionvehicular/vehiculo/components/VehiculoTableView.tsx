import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  CarFront,
  Check,
  ChevronRight,
  Copy,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { VehiculoCatalogo } from "../api/vehiculo.types"
import {
  getAtributosVisibles,
  getPlacaFromAtributos,
  getVehiculoTituloDinamico,
  isPlacaAtributo,
} from "../lib/vehiculo-atributos.utils"

type VehiculoTableViewProps = {
  vehiculos: VehiculoCatalogo[]
  onPreviewImage: (vehiculo: VehiculoCatalogo) => void
}

type DynamicColumn = {
  atributoId: string
  etiqueta: string
  orden: number
}

export function VehiculoTableView({
  vehiculos,
  onPreviewImage,
}: Readonly<VehiculoTableViewProps>) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const dynamicColumns = useMemo<DynamicColumn[]>(() => {
    const map = new Map<string, DynamicColumn>()
    for (const v of vehiculos) {
      for (const attr of getAtributosVisibles(v)) {
        if (isPlacaAtributo(attr)) continue
        if (!map.has(attr.atributoId)) {
          map.set(attr.atributoId, {
            atributoId: attr.atributoId,
            etiqueta: attr.etiqueta,
            orden: attr.orden,
          })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.orden - b.orden)
  }, [vehiculos])

  function handleCopyPlaca(vehiculoId: string, placa: string) {
    void navigator.clipboard.writeText(placa)
    setCopiedId(vehiculoId)
    toast.success(`Placa "${placa}" copiada`)
    setTimeout(() => setCopiedId(null), 1800)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="border-b border-border/70 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 bg-muted/95 backdrop-blur-xs py-3 px-3 w-[72px]">
                Imagen
              </th>
              <th className="sticky left-[72px] z-20 bg-muted/95 backdrop-blur-xs py-3 px-3 min-w-[165px] border-r border-border/60">
                Placa
              </th>
              <th className="py-3 px-3 min-w-[175px]">Vehículo</th>
              <th className="py-3 px-3 min-w-[140px]">Estado</th>
              <th className="py-3 px-3 min-w-[160px]">Ubicación / Flota</th>
              {dynamicColumns.map((col) => (
                <th
                  key={col.atributoId}
                  className="py-3 px-3 min-w-[120px] whitespace-nowrap"
                >
                  {col.etiqueta}
                </th>
              ))}
              <th className="py-3 px-3 text-right whitespace-nowrap">Ficha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {vehiculos.map((v) => {
              const isActivo = v.activo !== false
              const estadoColor = v.estadoOperativo?.color || "#10B981"
              const estadoNombre = v.estadoOperativo?.nombre || "Operativo"
              const atributosVisibles = getAtributosVisibles(v)
              const { valor: placaValor } = getPlacaFromAtributos(v)
              const titulo = getVehiculoTituloDinamico(v)
              const isCopied = copiedId === v.id
              const attrById = new Map(
                atributosVisibles.map((a) => [a.atributoId, a]),
              )

              return (
                <tr
                  key={v.id}
                  className={cn(
                    "group transition-colors hover:bg-muted/25",
                    !isActivo && "opacity-75",
                  )}
                >
                  {/* Sticky Imagen */}
                  <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/25 transition-colors py-2.5 px-3">
                    <button
                      type="button"
                      disabled={!v.urlImagen}
                      onClick={() => v.urlImagen && onPreviewImage(v)}
                      className={cn(
                        "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/40 shadow-2xs",
                        v.urlImagen &&
                          "cursor-pointer hover:border-primary/50 hover:scale-105 transition-transform",
                      )}
                      title={v.urlImagen ? "Ampliar imagen" : "Sin imagen"}
                    >
                      {v.urlImagen ? (
                        <AuthenticatedImage
                          src={v.urlImagen}
                          alt={titulo}
                          className="size-full object-cover"
                          fallback={
                            <CarFront className="size-4 text-muted-foreground/60" />
                          }
                        />
                      ) : (
                        <CarFront className="size-4 text-muted-foreground/60" />
                      )}
                    </button>
                  </td>

                  {/* Sticky Placa destacada (desde atributos) */}
                  <td className="sticky left-[72px] z-10 bg-card group-hover:bg-muted/25 transition-colors py-2.5 px-3 whitespace-nowrap border-r border-border/50">
                    {placaValor ? (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-gradient-to-b from-background to-cyan-500/10 px-2 py-0.5 shadow-2xs">
                        <Link
                          to={routes.gestionVehicular.vehiculoDetalle(v.id)}
                          className="font-mono text-xs sm:text-sm font-black tracking-[0.1em] text-foreground hover:text-cyan-700 dark:hover:text-cyan-300 uppercase transition-colors"
                          title={`Ver ficha — Placa ${placaValor}`}
                        >
                          {placaValor}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopyPlaca(v.id, placaValor)}
                          className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Copiar placa"
                        >
                          {isCopied ? (
                            <Check className="size-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-2.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] italic text-muted-foreground/60">
                        Sin placa
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    <Link
                      to={routes.gestionVehicular.vehiculoDetalle(v.id)}
                      className="font-semibold text-foreground hover:text-primary transition-colors block truncate max-w-[220px]"
                      title={titulo}
                    >
                      {titulo}
                    </Link>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor: `${estadoColor}15`,
                          borderColor: `${estadoColor}40`,
                          color: estadoColor,
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: estadoColor }}
                        />
                        {estadoNombre}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-4 px-1.5 text-[9px] font-medium",
                          isActivo
                            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "border-amber-500/30 text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {isActivo ? "Habilitado" : "Inactivo"}
                      </Badge>
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      {v.ubicacion ? (
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <MapPin className="size-3 text-primary shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {v.ubicacion.nombre}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70 italic">
                          Sin ubicación
                        </span>
                      )}
                      {v.flotas.length > 0 ? (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                          {v.flotas.map((f) => f.nombre).join(", ")}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {dynamicColumns.map((col) => {
                    const attr = attrById.get(col.atributoId)
                    const value = attr?.valorFormateado ?? attr?.valor
                    return (
                      <td key={col.atributoId} className="py-2.5 px-3">
                        {value ? (
                          <span
                            className="block max-w-[180px] truncate font-medium text-foreground"
                            title={value}
                          >
                            {value}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/45">—</span>
                        )}
                      </td>
                    )
                  })}

                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <Button
                      size="xs"
                      variant="ghost"
                      render={
                        <Link
                          to={routes.gestionVehicular.vehiculoDetalle(v.id)}
                        />
                      }
                      className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 gap-0.5"
                    >
                      <span>Ficha</span>
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
