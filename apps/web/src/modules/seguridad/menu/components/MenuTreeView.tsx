import { useMemo } from "react"
import { FolderTree, Plus } from "lucide-react"

import { EmptyState } from "@/shared/components/empty-state"
import { Button } from "@/shared/components/ui/button"

import type { Menu, MenuTreeNode } from "../api/menu.service"
import { MenuTreeNodeItem } from "./MenuTreeNodeItem"

type MenuTreeViewProps = {
  treeNodes: MenuTreeNode[]
  searchQuery?: string
  statusFilter?: "all" | "active" | "inactive"
  expandedAll?: boolean
  permisosCountByMenuId?: Map<string, number>
  onEdit: (menu: Menu) => void
  onAddChild: (parent: MenuTreeNode) => void
  onQuickView: (id: string) => void
  onOpenCreate: () => void
  onManagePermisos?: (menu: Menu) => void
}

export function MenuTreeView({
  treeNodes,
  searchQuery = "",
  statusFilter = "all",
  expandedAll = true,
  permisosCountByMenuId,
  onEdit,
  onAddChild,
  onQuickView,
  onOpenCreate,
  onManagePermisos,
}: MenuTreeViewProps) {
  // Recursive filter helper
  const filteredTree = useMemo(() => {
    const filterNodes = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
      return nodes
        .map((node) => {
          const query = searchQuery.trim().toLowerCase()
          const matchesSearch =
            !query ||
            node.nombre.toLowerCase().includes(query) ||
            node.codigo.toLowerCase().includes(query) ||
            (node.ruta && node.ruta.toLowerCase().includes(query))

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && node.activo) ||
            (statusFilter === "inactive" && !node.activo)

          const filteredChildren = node.hijos ? filterNodes(node.hijos) : []

          if ((matchesSearch && matchesStatus) || filteredChildren.length > 0) {
            return {
              ...node,
              hijos: filteredChildren,
            }
          }
          return null
        })
        .filter((n): n is MenuTreeNode => n !== null)
    }

    return filterNodes(treeNodes)
  }, [treeNodes, searchQuery, statusFilter])

  const hasFilter =
    searchQuery.trim().length > 0 || statusFilter !== "all"

  if (filteredTree.length === 0) {
    return (
      <EmptyState
        icon={<FolderTree className="size-5 text-muted-foreground" />}
        title={hasFilter ? "Sin resultados en el árbol" : "No hay menús configurados"}
        description={
          hasFilter
            ? "Prueba modificando los términos de búsqueda o el filtro de estado."
            : "Crea el primer módulo de menú raíz para estructurar la navegación del sistema."
        }
        action={
          <Button size="sm" type="button" onClick={onOpenCreate} className="gap-1.5 cursor-pointer">
            <Plus className="size-4" />
            <span>Crear Menú Raíz</span>
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <FolderTree className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Jerarquía y Submenús
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            ({filteredTree.length} {filteredTree.length === 1 ? "raíz" : "raíces"})
          </span>
        </div>
      </div>

      {/* Tree Nodes List */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <ul className="flex flex-col gap-1" key={expandedAll ? "expanded" : "collapsed"}>
          {filteredTree.map((node) => (
            <MenuTreeNodeItem
              key={node.id}
              node={node}
              level={0}
              defaultExpanded={expandedAll}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              permisosCountByMenuId={permisosCountByMenuId}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onQuickView={onQuickView}
              onManagePermisos={onManagePermisos}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
