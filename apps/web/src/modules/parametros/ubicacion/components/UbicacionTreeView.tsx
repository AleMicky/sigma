import { useState } from "react"
import { ChevronsDown, ChevronsUp, FolderTree } from "lucide-react"

import { EmptyState } from "@/shared/components/empty-state"
import { Button } from "@/shared/components/ui/button"

import type { Ubicacion, UbicacionTreeNode } from "../api/ubicacion.service"
import { UbicacionTreeNodeItem } from "./UbicacionTreeNodeItem"

type UbicacionTreeViewProps = {
  treeNodes: UbicacionTreeNode[]
  searchQuery?: string
  tipoFilter?: string
  onEdit: (ubicacion: Ubicacion) => void
  onAddChild: (parent: UbicacionTreeNode) => void
  onQuickView: (id: string) => void
  onOpenCreate: () => void
}

export function UbicacionTreeView({
  treeNodes,
  searchQuery = "",
  tipoFilter = "",
  onEdit,
  onAddChild,
  onQuickView,
  onOpenCreate,
}: UbicacionTreeViewProps) {
  const [expandAll, setExpandAll] = useState(true)

  // Recursive filter helper
  const filterNodes = (nodes: UbicacionTreeNode[]): UbicacionTreeNode[] => {
    return nodes
      .map((node) => {
        const matchesSearch =
          !searchQuery.trim() ||
          node.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.codigo.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTipo =
          !tipoFilter || tipoFilter === "__all__" || node.tipo === tipoFilter

        const filteredChildren = node.hijos ? filterNodes(node.hijos) : []

        if ((matchesSearch && matchesTipo) || filteredChildren.length > 0) {
          return {
            ...node,
            hijos: filteredChildren,
          }
        }
        return null
      })
      .filter((n): n is UbicacionTreeNode => n !== null)
  }

  const filteredTree = filterNodes(treeNodes)

  if (filteredTree.length === 0) {
    return (
      <EmptyState
        icon={<FolderTree className="size-4 text-muted-foreground" />}
        title={searchQuery.trim() || (tipoFilter && tipoFilter !== "__all__") ? "Sin resultados" : "No hay ubicaciones"}
        description={
          searchQuery.trim() || (tipoFilter && tipoFilter !== "__all__")
            ? "Prueba ajustando la búsqueda o los filtros."
            : "Comienza creando tu primera ubicación jerárquica (ej: País o Ciudad)."
        }
        action={
          <Button size="sm" type="button" onClick={onOpenCreate}>
            Crear ubicación
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      {/* Header Toolbar for Tree Controls */}
      <div className="flex items-center justify-between border-b pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <FolderTree className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Estructura Jerárquica de Ubicaciones
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={() => setExpandAll(true)}
            className="text-xs"
          >
            <ChevronsDown className="size-3.5" />
            Expandir todo
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setExpandAll(false)}
            className="text-xs"
          >
            <ChevronsUp className="size-3.5" />
            Colapsar todo
          </Button>
        </div>
      </div>

      {/* Tree Nodes List */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <ul className="flex flex-col gap-1" key={expandAll ? "expanded" : "collapsed"}>
          {filteredTree.map((node) => (
            <UbicacionTreeNodeItem
              key={node.id}
              node={node}
              level={0}
              defaultExpanded={expandAll}
              searchQuery={searchQuery}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onQuickView={onQuickView}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
