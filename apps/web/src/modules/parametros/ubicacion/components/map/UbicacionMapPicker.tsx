import { useEffect, useMemo, useRef } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet"
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"

import type { TipoUbicacion } from "../../api/ubicacion.service"
import { createCustomMarkerIcon, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "./leaflet-config"

type UbicacionMapPickerProps = {
  latitud: number | null
  longitud: number | null
  tipo: TipoUbicacion
  onChangeCoords: (lat: number, lng: number) => void
}

function LocationMarker({
  latitud,
  longitud,
  tipo,
  onChangeCoords,
}: UbicacionMapPickerProps) {
  const markerRef = useRef<LeafletMarker | null>(null)

  const map = useMapEvents({
    click(e) {
      onChangeCoords(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      )
    },
  })

  useEffect(() => {
    if (latitud !== null && longitud !== null) {
      map.setView([latitud, longitud], Math.max(map.getZoom(), 13))
    }
  }, [latitud, longitud, map])

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const latLng = marker.getLatLng()
          onChangeCoords(
            Number(latLng.lat.toFixed(6)),
            Number(latLng.lng.toFixed(6)),
          )
        }
      },
    }),
    [onChangeCoords],
  )

  if (latitud === null || longitud === null) {
    return null
  }

  const icon = createCustomMarkerIcon(tipo)

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={[latitud, longitud]}
      ref={markerRef}
      icon={icon}
    />
  )
}

export function UbicacionMapPicker({
  latitud,
  longitud,
  tipo,
  onChangeCoords,
}: UbicacionMapPickerProps) {
  const mapRef = useRef<LeafletMap | null>(null)

  const initialCenter: [number, number] =
    latitud !== null && longitud !== null
      ? [latitud, longitud]
      : DEFAULT_MAP_CENTER

  const initialZoom = latitud !== null && longitud !== null ? 13 : DEFAULT_MAP_ZOOM

  return (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border border-border/80 shadow-inner">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full z-0"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          latitud={latitud}
          longitud={longitud}
          tipo={tipo}
          onChangeCoords={onChangeCoords}
        />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[400] rounded-md bg-background/90 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-xs border border-border/60">
        💡 Haz clic o arrastra el pin para seleccionar coordenadas
      </div>
    </div>
  )
}
