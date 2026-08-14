import type { ElementType } from "react"
import {
  Building,
  Building2,
  Globe,
  Grid,
  Layers,
  Map,
  MapPin,
  Monitor,
  Store,
  Warehouse,
  Wrench,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import type { TipoUbicacion } from "../api/ubicacion.service"

export type TipoUbicacionConfig = {
  label: string
  icon: ElementType
  badgeClass: string
  color: string
}

export const TIPO_UBICACION_CONFIG: Record<TipoUbicacion, TipoUbicacionConfig> = {
  PAIS: {
    label: "País",
    icon: Globe,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    color: "#3b82f6",
  },
  DEPARTAMENTO: {
    label: "Departamento",
    icon: Map,
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    color: "#06b6d4",
  },
  CIUDAD: {
    label: "Ciudad",
    icon: Building2,
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    color: "#14b8a6",
  },
  SUCURSAL: {
    label: "Sucursal",
    icon: Store,
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    color: "#6366f1",
  },
  EDIFICIO: {
    label: "Edificio",
    icon: Building,
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    color: "#8b5cf6",
  },
  PLANTA: {
    label: "Planta",
    icon: Layers,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    color: "#a855f7",
  },
  AREA: {
    label: "Área",
    icon: Grid,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    color: "#f59e0b",
  },
  OFICINA: {
    label: "Oficina",
    icon: Monitor,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    color: "#10b981",
  },
  ALMACEN: {
    label: "Almacén",
    icon: Warehouse,
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    color: "#f97316",
  },
  TALLER: {
    label: "Taller",
    icon: Wrench,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    color: "#f43f5e",
  },
  OTRO: {
    label: "Otro",
    icon: MapPin,
    badgeClass: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    color: "#6b7280",
  },
}

type TipoUbicacionBadgeProps = {
  tipo: TipoUbicacion
  showIcon?: boolean
  className?: string
}

export function TipoUbicacionBadge({
  tipo,
  showIcon = true,
  className,
}: TipoUbicacionBadgeProps) {
  const config = TIPO_UBICACION_CONFIG[tipo] || TIPO_UBICACION_CONFIG.OTRO
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors shrink-0",
        config.badgeClass,
        className,
      )}
    >
      {showIcon ? <Icon className="size-3.5 shrink-0" /> : null}
      <span>{config.label}</span>
    </span>
  )
}
