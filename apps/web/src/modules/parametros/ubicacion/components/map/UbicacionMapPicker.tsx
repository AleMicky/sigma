import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet"
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"
import { Crosshair, Loader2, Search, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"

import type { TipoUbicacion } from "../../api/ubicacion.service"
import { createCustomMarkerIcon, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "./leaflet-config"

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

type UbicacionMapPickerProps = {
  latitud: number | null
  longitud: number | null
  tipo: TipoUbicacion
  direccion?: string
  onChangeCoords: (lat: number, lng: number) => void
}

function LocationMarker({
  latitud,
  longitud,
  tipo,
  onChangeCoords,
}: Omit<UbicacionMapPickerProps, "direccion">) {
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
      map.setView([latitud, longitud], Math.max(map.getZoom(), 14))
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
  direccion = "",
  onChangeCoords,
}: UbicacionMapPickerProps) {
  const mapRef = useRef<LeafletMap | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const initialCenter: [number, number] =
    latitud !== null && longitud !== null
      ? [latitud, longitud]
      : DEFAULT_MAP_CENTER

  const initialZoom = latitud !== null && longitud !== null ? 14 : DEFAULT_MAP_ZOOM

  // Automatically sync search query with direccion prop when user clicks "Buscar dirección"
  useEffect(() => {
    if (direccion && !searchQuery) {
      setSearchQuery(direccion)
    }
  }, [direccion, searchQuery])

  // Get current device GPS location using browser navigator.geolocation
  function handleUseMyLocation() {
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización.")
      return
    }

    setIsLocating(true)

    const applyPos = (pos: GeolocationPosition) => {
      setIsLocating(false)
      const lat = Number(pos.coords.latitude.toFixed(6))
      const lng = Number(pos.coords.longitude.toFixed(6))
      onChangeCoords(lat, lng)
    }

    navigator.geolocation.getCurrentPosition(
      applyPos,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setIsLocating(false)
          setGeoError("Permiso de ubicación denegado en tu navegador o sistema.")
        } else {
          // Retry with low accuracy (Wi-Fi/IP location for laptops without hardware GPS)
          navigator.geolocation.getCurrentPosition(
            applyPos,
            () => {
              setIsLocating(false)
              setGeoError(
                "No se pudo obtener la ubicación. Comprueba los permisos de ubicación de tu navegador o escribe la dirección en el buscador superior.",
              )
            },
            { enableHighAccuracy: false, timeout: 10000 },
          )
        }
      },
      { enableHighAccuracy: true, timeout: 5000 },
    )
  }

  // Search address using free OpenStreetMap Nominatim Geocoding API
  async function handleSearchAddress(queryToSearch?: string) {
    const q = (queryToSearch ?? searchQuery).trim()
    if (!q) return

    setIsSearching(true)
    setGeoError(null)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
      )
      const data: NominatimResult[] = await res.json()
      setSearchResults(data)
      if (data.length === 0) {
        setGeoError("No se encontraron resultados para la búsqueda.")
      }
    } catch {
      setGeoError("Error al consultar el servicio de mapa.")
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectSearchResult(result: NominatimResult) {
    const lat = Number(parseFloat(result.lat).toFixed(6))
    const lng = Number(parseFloat(result.lon).toFixed(6))
    onChangeCoords(lat, lng)
    setSearchResults([])
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2.5 overflow-hidden">
      {/* Top Helper Toolbar: Geolocation & Address Search */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Address Search Bar */}
        <div className="relative flex flex-1 items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearchAddress()
                }
              }}
              placeholder="Buscar ciudad o dirección en el mapa..."
              className="h-8 pl-8 pr-7 text-xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSearchResults([])
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </div>

          <Button
            type="button"
            size="xs"
            variant="secondary"
            onClick={() => handleSearchAddress()}
            disabled={isSearching || !searchQuery.trim()}
            className="h-8 shrink-0 text-xs"
          >
            {isSearching ? <Loader2 className="size-3 animate-spin" /> : "Buscar"}
          </Button>
        </div>

        {/* Current Location GPS Button */}
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="h-8 shrink-0 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
        >
          {isLocating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Crosshair className="size-3.5" />
          )}
          <span>Usar mi GPS actual</span>
        </Button>
      </div>

      {/* Search Results Dropdown List */}
      {searchResults.length > 0 ? (
        <div className="rounded-lg border border-border bg-popover p-1 shadow-md">
          <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            Resultados sugeridos:
          </div>
          <ul className="flex flex-col gap-0.5">
            {searchResults.map((item) => (
              <li key={item.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left rounded-md px-2.5 py-1.5 text-xs hover:bg-accent transition-colors truncate font-medium text-foreground"
                >
                  {item.display_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Error or Info Feedback */}
      {geoError ? (
        <span className="text-xs font-medium text-destructive">{geoError}</span>
      ) : null}

      {/* Interactive Map */}
      <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] w-full overflow-hidden rounded-xl border border-border/80 shadow-inner">
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

        <div className="absolute bottom-2 left-2 right-2 z-[400] flex items-center justify-between rounded-md bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-xs border border-border/60">
          <span>💡 Haz clic en cualquier lugar del mapa o usa la búsqueda superior</span>
          {latitud !== null && longitud !== null ? (
            <span className="font-mono font-medium text-foreground">
              GPS: {latitud}, {longitud}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
