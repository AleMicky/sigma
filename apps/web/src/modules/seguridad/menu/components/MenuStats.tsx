import { useMemo } from "react"
import { CheckCircle2, FolderTree, Layers, ShieldAlert, Sparkles } from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

import type { Menu, MenuTreeNode } from "../api/menu.service"

type MenuStatsProps = {
  treeNodes?: MenuTreeNode[]
  menusList?: Menu[]
  raicesCount?: number
  totalCount?: number
  isLoading?: boolean
}

export function MenuStats({
  treeNodes = [],
  menusList = [],
  raicesCount,
  totalCount,
  isLoading = false,
}: MenuStatsProps) {
  const stats = useMemo(() => {
    let maxDepth = 0

    function calculateDepth(nodes: MenuTreeNode[], currentDepth: number) {
      if (nodes.length === 0) return
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth
      }
      for (const node of nodes) {
        if (node.hijos && node.hijos.length > 0) {
          calculateDepth(node.hijos, currentDepth + 1)
        }
      }
    }

    calculateDepth(treeNodes, 1)

    const total = totalCount ?? menusList.length
    const raices = raicesCount ?? treeNodes.length
    const activos = menusList.filter((m) => m.activo).length
    const inactivos = menusList.filter((m) => !m.activo).length

    return {
      total,
      raices,
      activos,
      inactivos,
      maxDepth,
    }
  }, [treeNodes, menusList, raicesCount, totalCount])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Total Menús */}
      <Card className="shadow-2xs border-border/80 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Total Menús
            </p>
            <p className="text-xl font-bold tracking-tight">{stats.total}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <FolderTree className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* Menús Raíz */}
      <Card className="shadow-2xs border-border/80 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Módulos Raíz
            </p>
            <p className="text-xl font-bold tracking-tight">{stats.raices}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Layers className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* Activos */}
      <Card className="shadow-2xs border-border/80 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              Activos
            </p>
            <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.activos}
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="size-4.5" />
          </div>
        </CardContent>
      </Card>

      {/* Profundidad / Inactivos */}
      <Card className="shadow-2xs border-border/80 bg-card/60 backdrop-blur-sm">
        <CardContent className="p-3.5 flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider">
              {stats.inactivos > 0 ? "Inactivos" : "Niveles de Árbol"}
            </p>
            <p className="text-xl font-bold tracking-tight">
              {stats.inactivos > 0 ? (
                <span className="text-destructive">{stats.inactivos}</span>
              ) : (
                `${stats.maxDepth} ${stats.maxDepth === 1 ? "nivel" : "niveles"}`
              )}
            </p>
          </div>
          <div
            className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${
              stats.inactivos > 0
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {stats.inactivos > 0 ? (
              <ShieldAlert className="size-4.5" />
            ) : (
              <Sparkles className="size-4.5" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
