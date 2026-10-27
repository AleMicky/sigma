import { useEffect, useMemo, useState } from "react"
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Gauge,
  Maximize2,
  Navigation,
  User,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

import type { BitacoraVehicular, SalidaVehicular, SalidaVehicularEvento } from "../api/salida-vehicular.types"

export interface GeoWaypoint {
  id: string
  lat: number
  lng: number
  tipo: "EVENTO" | "BITACORA"
  categoria: string
  titulo: string
  descripcion?: string | null
  fechaHora: string
  kilometraje?: number | null
  empleadoNombre?: string | null
  isStart?: boolean
  isEnd?: boolean
  isLatest?: boolean
  isIncidente?: boolean
  isNovedad?: boolean
  orderIndex: number
}

interface SalidaVehicularRouteMapProps {
  salida: SalidaVehicular
  eventos: SalidaVehicularEvento[]
  bitacoras: BitacoraVehicular[]
  className?: string
  height?: string
}

// Controller to smoothly fit bounds or fly to target
function MapViewController({
  points,
  focusPoint,
}: {
  points: [number, number][]
  focusPoint: [number, number] | null
}) {
  const map = useMap()

  useEffect(() => {
    if (focusPoint) {
      map.flyTo(focusPoint, 15, { duration: 1 })
      return
    }

    if (points.length === 0) return

    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 16,
      animate: true,
    })
  }, [map, points, focusPoint])

  return null
}

function createPointIcon(point: GeoWaypoint) {
  if (point.isLatest) {
    return L.divIcon({
      className: "custom-live-marker",
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(37, 99, 235, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(37,99,235,0.45); display: flex; align-items: center; justify-content: center; color: #ffffff;">
            <svg style="width: 17px; height: 17px;" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 2l7 19-7-4-7 4 7-19z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    })
  }

  let bgColor = "#2563eb"
  let content = `${point.orderIndex}`

  if (point.isStart) {
    bgColor = "#059669" // emerald
    content = `<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
  } else if (point.isIncidente) {
    bgColor = "#dc2626" // red
    content = `<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
  } else if (point.isNovedad) {
    bgColor = "#d97706" // amber
    content = `<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
  } else if (point.isEnd) {
    bgColor = "#0f172a" // slate
    content = `<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`
  }

  return L.divIcon({
    className: "custom-point-marker",
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background-color: ${bgColor}; border: 2px solid #ffffff; border-radius: 9999px; box-shadow: 0 3px 8px rgba(0,0,0,0.25); color: #ffffff; font-weight: 700; font-size: 11px; font-family: ui-monospace, monospace;">
        ${content}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export function SalidaVehicularRouteMap({
  salida,
  eventos,
  bitacoras,
  className,
  height = "h-[480px]",
}: SalidaVehicularRouteMapProps) {
  const [filterType, setFilterType] = useState<"ALL" | "EVENTOS" | "BITACORAS">("ALL")
  const [focusPoint, setFocusPoint] = useState<[number, number] | null>(null)

  // Normalizar y ordenar todos los puntos cronológicamente
  const allWaypoints: GeoWaypoint[] = useMemo(() => {
    const list: GeoWaypoint[] = []

    // 1. Eventos de la salida
    eventos.forEach((e) => {
      if (e.latitud != null && e.longitud != null) {
        const estadoUpper = (e.tipoEvento || "").toUpperCase()
        list.push({
          id: `ev-${e.id}`,
          lat: Number(e.latitud),
          lng: Number(e.longitud),
          tipo: "EVENTO",
          categoria: e.tipoEvento,
          titulo: e.tipoEvento.replace(/_/g, " "),
          descripcion: e.observacion,
          fechaHora: e.fechaHora || e.createdAt,
          kilometraje: e.kilometraje,
          empleadoNombre: e.empleadoNombre,
          isStart: estadoUpper.includes("SALIDA") && !estadoUpper.includes("RETORNO"),
          isEnd: estadoUpper.includes("FINAL") || estadoUpper.includes("COMPLET") || estadoUpper.includes("BASE"),
          orderIndex: 0,
        })
      }
    })

    // 2. Bitácoras con GPS
    bitacoras.forEach((b) => {
      if (b.latitud != null && b.longitud != null) {
        const tipoUpper = (b.tipo || "").toUpperCase()
        list.push({
          id: `bit-${b.id}`,
          lat: Number(b.latitud),
          lng: Number(b.longitud),
          tipo: "BITACORA",
          categoria: b.tipo,
          titulo: `Bitácora: ${b.tipo}`,
          descripcion: b.descripcion,
          fechaHora: b.fechaHora || b.createdAt,
          kilometraje: null,
          empleadoNombre: b.empleadoNombre,
          isIncidente: tipoUpper.includes("INCIDENTE"),
          isNovedad: tipoUpper.includes("NOVEDAD"),
          orderIndex: 0,
        })
      }
    })

    // Ordenar cronológicamente (más antiguo primero)
    list.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())

    // Asignar orderIndex y marcar el último
    list.forEach((item, idx) => {
      item.orderIndex = idx + 1
      if (idx === list.length - 1) {
        item.isLatest = true
      }
    })

    return list
  }, [eventos, bitacoras])

  // Filtrado según selección del usuario
  const visibleWaypoints = useMemo(() => {
    if (filterType === "EVENTOS") return allWaypoints.filter((w) => w.tipo === "EVENTO")
    if (filterType === "BITACORAS") return allWaypoints.filter((w) => w.tipo === "BITACORA")
    return allWaypoints
  }, [allWaypoints, filterType])

  // Lista de coordenadas para trazar la polyline
  const polylineCoords = useMemo<[number, number][]>(() => {
    return allWaypoints.map((w) => [w.lat, w.lng])
  }, [allWaypoints])

  const latestPoint = useMemo(() => {
    return allWaypoints.find((w) => w.isLatest)
  }, [allWaypoints])

  const defaultCenter: [number, number] = useMemo(() => {
    if (latestPoint) return [latestPoint.lat, latestPoint.lng]
    if (allWaypoints.length > 0) return [allWaypoints[0].lat, allWaypoints[0].lng]
    return [-16.5, -68.15] // Default La Paz / Bolivia
  }, [latestPoint, allWaypoints])

  const handleCopyCoords = (lat: number, lng: number) => {
    void navigator.clipboard.writeText(`${lat}, ${lng}`)
    toast.success("Coordenadas copiadas al portapapeles")
  }

  const handleResetView = () => {
    setFocusPoint(null)
  }

  const handleFocusLatest = () => {
    if (latestPoint) {
      setFocusPoint([latestPoint.lat, latestPoint.lng])
    }
  }

  const googleMapsUrl = latestPoint
    ? `https://www.google.com/maps/search/?api=1&query=${latestPoint.lat},${latestPoint.lng}`
    : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(salida.origen)}&destination=${encodeURIComponent(salida.destino)}`

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-"
    try {
      return new Date(dateStr).toLocaleString("es-BO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className={cn("border-border/70 shadow-2xs overflow-hidden flex flex-col", className)}>
      {/* 1. BARRA SUPERIOR DE ESTADO Y CONTROLES */}
      <div className="p-3 sm:p-4 border-b border-border/60 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Compass className="size-4 text-primary" />
              Seguimiento Satelital y Recorrido GPS
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold gap-1",
                allWaypoints.length > 0
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  allWaypoints.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                )}
              />
              {allWaypoints.length} punto{allWaypoints.length === 1 ? "" : "s"} GPS
            </Badge>

            {latestPoint && (
              <span className="text-[11px] font-mono text-muted-foreground">
                Último reporte: {formatDate(latestPoint.fechaHora)}
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Trayecto de {salida.origen} hacia {salida.destino} &bull; Vehículo{" "}
            <strong className="text-foreground">{salida.placa ?? "S/P"}</strong>
          </p>
        </div>

        {/* Acciones y filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de capas / filtros */}
          <div className="inline-flex rounded-lg p-0.5 bg-muted border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                filterType === "ALL"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Todos ({allWaypoints.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("EVENTOS")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                filterType === "EVENTOS"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Hitos ({eventos.filter((e) => e.latitud != null).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("BITACORAS")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                filterType === "BITACORAS"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Bitácora ({bitacoras.filter((b) => b.latitud != null).length})
            </button>
          </div>

          {/* Botones de acción rápida */}
          {latestPoint && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFocusLatest}
              className="text-xs h-7 gap-1 cursor-pointer bg-card hover:bg-muted"
              title="Centrar en la última posición registrada"
            >
              <Navigation className="size-3 text-primary" />
              <span className="hidden sm:inline">Última Posición</span>
            </Button>
          )}

          {allWaypoints.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="text-xs h-7 gap-1 cursor-pointer bg-card hover:bg-muted"
              title="Ver todo el recorrido"
            >
              <Maximize2 className="size-3" />
              <span className="hidden sm:inline">Ver Ruta</span>
            </Button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
            title="Abrir en Google Maps"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>
      </div>

      {/* 2. CONTENEDOR DEL MAPA */}
      <div className={cn("relative w-full z-0", height)}>
        {allWaypoints.length === 0 ? (
          <div className="absolute inset-0 z-10 bg-background/85 backdrop-blur-xs flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-3 p-6 rounded-2xl border border-dashed border-border/80 bg-card/90 shadow-sm">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Compass className="size-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Sin coordenadas GPS registradas aún
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Los puntos geográficos se trazan de forma automática cuando el conductor marca los
                hitos del viaje (Salida, Llegada a destino, Retorno) o registra una novedad en la bitácora.
              </p>
              <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-medium">
                <span className="size-2 rounded-full bg-amber-500" />
                <span>Geolocalización automática activa en el dispositivo</span>
              </div>
            </div>
          </div>
        ) : null}

        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          attributionControl={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapViewController points={polylineCoords} focusPoint={focusPoint} />

          {/* Polyline del recorrido */}
          {polylineCoords.length >= 2 && (
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: "#2563eb",
                weight: 4,
                opacity: 0.85,
                lineJoin: "round",
                dashArray: salida.estado.includes("FINALIZ") ? undefined : "6, 8",
              }}
            />
          )}

          {/* Marcadores de waypoints */}
          {visibleWaypoints.map((pt) => {
            const icon = createPointIcon(pt)
            return (
              <Marker key={pt.id} position={[pt.lat, pt.lng]} icon={icon}>
                <Popup className="leaflet-custom-popup">
                  <div className="p-1 space-y-2 min-w-[220px] max-w-[280px]">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 border",
                          pt.isIncidente && "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
                          pt.isNovedad && "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                          pt.isStart && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                          !pt.isIncidente && !pt.isNovedad && !pt.isStart && "bg-primary/15 text-primary border-primary/30"
                        )}
                      >
                        {pt.isLatest ? "Última Posición" : pt.categoria}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {formatDate(pt.fechaHora)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-snug">
                        {pt.titulo}
                      </h4>
                      {pt.descripcion && (
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {pt.descripcion}
                        </p>
                      )}
                    </div>

                    {pt.kilometraje != null && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-muted/40 p-1.5 rounded-md border border-border/40 font-mono">
                        <Gauge className="size-3 text-primary" />
                        <span>Odómetro: {pt.kilometraje.toLocaleString()} km</span>
                      </div>
                    )}

                    {pt.empleadoNombre && (
                      <div className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                        <User className="size-3 text-muted-foreground/70" />
                        <span className="truncate">Por: {pt.empleadoNombre}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-muted-foreground">
                        {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCoords(pt.lat, pt.lng)}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                      >
                        <Copy className="size-2.5" />
                        Copiar
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {/* 3. LEYENDA FLOTANTE EN ESQUINA INFERIOR */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-card/95 backdrop-blur-md rounded-xl p-2.5 border border-border/80 shadow-md text-[11px] space-y-1.5 hidden sm:block">
          <span className="font-bold text-foreground text-[10px] uppercase tracking-wider block">
            Leyenda de Ruta
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Salida</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-blue-600 shrink-0" />
              <span>Hito Operativo</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Novedad</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-600 shrink-0" />
              <span>Incidente</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
