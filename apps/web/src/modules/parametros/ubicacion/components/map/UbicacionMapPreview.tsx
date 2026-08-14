import { MapContainer, Marker, TileLayer } from "react-leaflet"

import type { TipoUbicacion } from "../../api/ubicacion.service"
import { createCustomMarkerIcon } from "./leaflet-config"

type UbicacionMapPreviewProps = {
  latitud: number
  longitud: number
  tipo: TipoUbicacion
}

export function UbicacionMapPreview({
  latitud,
  longitud,
  tipo,
}: UbicacionMapPreviewProps) {
  const position: [number, number] = [latitud, longitud]
  const icon = createCustomMarkerIcon(tipo)

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-border/80 shadow-xs">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full z-0 pointer-events-none"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon} />
      </MapContainer>
    </div>
  )
}
