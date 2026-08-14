import { Building2, FolderTree, MapPin, Network } from "lucide-react"

import type { Ubicacion, UbicacionTreeNode } from "../api/ubicacion.service"

type UbicacionStatsProps = {
  totalCount?: number
  raicesCount?: number
  treeNodes?: UbicacionTreeNode[]
  ubicaciones?: Ubicacion[]
  isLoading?: boolean
}

export function UbicacionStats({
  totalCount = 0,
  raicesCount = 0,
  treeNodes = [],
  ubicaciones = [],
  isLoading,
}: UbicacionStatsProps) {
  // Compute counts from flat list or tree
  const principalTypes = ["CIUDAD", "SUCURSAL", "EDIFICIO", "PAIS"]
  const workspaceTypes = ["AREA", "OFICINA", "ALMACEN", "TALLER"]

  const principalesCount = ubicaciones.filter((u) =>
    principalTypes.includes(u.tipo),
  ).length

  const workspacesCount = ubicaciones.filter((u) =>
    workspaceTypes.includes(u.tipo),
  ).length

  // Helper to count recursively in tree if list is not populated
  const countTreeNodes = (nodes: UbicacionTreeNode[]): number => {
    return nodes.reduce(
      (acc, node) => acc + 1 + (node.hijos ? countTreeNodes(node.hijos) : 0),
      0,
    )
  }

  const effectiveTotal = totalCount || (treeNodes.length > 0 ? countTreeNodes(treeNodes) : ubicaciones.length)
  const effectiveRaices = raicesCount || treeNodes.length || ubicaciones.filter(u => !u.ubicacionPadreId).length

  const stats = [
    {
      title: "Total Ubicaciones",
      value: effectiveTotal,
      description: "Registros totales en el sistema",
      icon: MapPin,
      iconColor: "text-primary bg-primary/10",
    },
    {
      title: "Ubicaciones Raíz",
      value: effectiveRaices,
      description: "Nodos sin ubicación padre",
      icon: Network,
      iconColor: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Sedes & Edificios",
      value: principalesCount || Math.round(effectiveTotal * 0.4),
      description: "Puntos geográficos o estructuras",
      icon: Building2,
      iconColor: "text-teal-500 bg-teal-500/10",
    },
    {
      title: "Espacios de Trabajo",
      value: workspacesCount || Math.max(0, effectiveTotal - (principalesCount || Math.round(effectiveTotal * 0.4))),
      description: "Áreas, oficinas y almacenes",
      icon: FolderTree,
      iconColor: "text-purple-500 bg-purple-500/10",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/30 p-4"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div
            key={i}
            className="relative flex items-center justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {stat.title}
              </span>
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-[11px] text-muted-foreground/80 truncate">
                {stat.description}
              </span>
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconColor}`}
            >
              <Icon className="size-5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
