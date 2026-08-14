import { useMemo } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import { Eye, MapPin, Navigation } from "lucide-react"

import { EmptyState } from "@/shared/components/empty-state"
import { Button } from "@/shared/components/ui/button"

import type { Ubicacion } from "../../api/ubicacion.service"
import { TipoUbicacionBadge } from "../TipoUbicacionBadge"
import { createCustomMarkerIcon, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "./leaflet-config"

type UbicacionMapViewProps = {
  ubicaciones: Ubicacion[]
  onEdit: (ubicacion: Ubicacion) => void
  onQuickView?: (id: string) => void
  onOpenCreate: () => void
}

export function UbicacionMapView({
  ubicaciones,
  onEdit,
  onQuickView,
  onOpenCreate,
}: UbicacionMapViewProps) {
  // Filter locations with valid coordinates
  const validLocations = useMemo(() => {
    return ubicaciones.filter(
      (u) => u.latitud !== null && u.longitud !== null,
    )
  }, [ubicaciones])

  // Calculate center of all valid markers
  const center: [number, number] = useMemo(() => {
    if (validLocations.length === 0) return DEFAULT_MAP_CENTER

    const sumLat = validLocations.reduce((sum, loc) => sum + (loc.latitud ?? 0), 0)
    const sumLng = validLocations.reduce((sum, loc) => sum + (loc.longitud ?? 0), 0)

    return [
      sumLat / validLocations.length,
      sumLng / validLocations.length,
    ]
  }, [validLocations])

  if (validLocations.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="size-4 text-muted-foreground" />}
        title="Sin coordenadas GPS"
        description="Ninguna ubicación registrada tiene latitud y longitud configuradas para mostrar en el mapa."
        action={
          <Button size="sm" type="button" onClick={onOpenCreate}>
            Crear o editar ubicación con GPS
          </Button>
        }
      />
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <MapContainer
        center={center}
        zoom={validLocations.length === 1 ? 12 : DEFAULT_MAP_ZOOM}
        scrollWheelZoom={true}
        attributionControl={false}
        className="h-full w-full z-0 min-h-[400px]"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validLocations.map((loc) => {
          const position: [number, number] = [loc.latitud!, loc.longitud!]
          const icon = createCustomMarkerIcon(loc.tipo)

          return (
            <Marker key={loc.id} position={position} icon={icon}>
              <Popup className="leaflet-custom-popup">
                <div className="flex flex-col gap-2 p-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40">
                      {loc.codigo}
                    </code>
                    <TipoUbicacionBadge tipo={loc.tipo} />
                  </div>

                  <h3 className="font-heading font-semibold text-foreground text-sm leading-snug">
                    {loc.nombre}
                  </h3>

                  {loc.direccion ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{loc.direccion}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Navigation className="size-3 shrink-0 text-primary" />
                    <span>{loc.latitud}, {loc.longitud}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t mt-1">
                    {onQuickView ? (
                      <button
                        type="button"
                        onClick={() => onQuickView(loc.id)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Eye className="size-3" />
                        Ver detalle
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onEdit(loc)}
                      className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
