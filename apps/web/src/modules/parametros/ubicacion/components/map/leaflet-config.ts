import L from "leaflet"
import "leaflet/dist/leaflet.css"

import { TIPO_UBICACION_CONFIG } from "../TipoUbicacionBadge"
import type { TipoUbicacion } from "../../api/ubicacion.service"

// Create a custom SVG marker icon based on location type
export function createCustomMarkerIcon(tipo: TipoUbicacion) {
  const config = TIPO_UBICACION_CONFIG[tipo] || TIPO_UBICACION_CONFIG.OTRO
  const color = config.color

  const svgHtml = `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      items-center;
      justify-content: center;
      background-color: ${color};
      border: 2px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
    ">
      <div style="
        transform: rotate(45deg);
        width: 12px;
        height: 12px;
        background-color: #ffffff;
        border-radius: 50%;
      "></div>
    </div>
  `

  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Default center coordinates (e.g., Colombia / Latin America default)
export const DEFAULT_MAP_CENTER: [number, number] = [4.711, -74.0721]
export const DEFAULT_MAP_ZOOM = 6
