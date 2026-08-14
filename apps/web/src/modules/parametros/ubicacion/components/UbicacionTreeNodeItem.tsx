import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { useDeleteUbicacion } from "../api/ubicacion.mutations"
import type { Ubicacion, UbicacionTreeNode } from "../api/ubicacion.service"
import { TipoUbicacionBadge } from "./TipoUbicacionBadge"

type UbicacionTreeNodeItemProps = {
  node: UbicacionTreeNode
  level?: number
  defaultExpanded?: boolean
  searchQuery?: string
  onEdit: (ubicacion: Ubicacion) => void
  onAddChild: (parent: UbicacionTreeNode) => void
  onQuickView: (id: string) => void
}

export function UbicacionTreeNodeItem({
  node,
  level = 0,
  defaultExpanded = true,
  searchQuery = "",
  onEdit,
  onAddChild,
  onQuickView,
}: UbicacionTreeNodeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteMutation = useDeleteUbicacion()

  const hasChildren = Boolean(node.hijos && node.hijos.length > 0)
  const childrenCount = node.hijos ? node.hijos.length : 0

  // Convert node to Ubicacion partial object for onEdit action
  const ubicacionObj: Ubicacion = {
    id: node.id,
    codigo: node.codigo,
    nombre: node.nombre,
    tipo: node.tipo,
    ubicacionPadreId: node.ubicacionPadreId,
    descripcion: null,
    direccion: null,
    latitud: null,
    longitud: null,
    createdAt: "",
    updatedAt: "",
    createdBy: "",
    updatedBy: "",
  }

  const isHighlighted =
    searchQuery.trim().length > 0 &&
    (node.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.codigo.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <li className="flex flex-col min-w-0">
      <div
        className={cn(
          "group relative flex items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-sm transition-all duration-150 hover:border-border/60 hover:bg-accent/40",
          isHighlighted && "bg-primary/10 border-primary/30 font-medium",
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Expand/Collapse Toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={expanded ? "Colapsar subárbol" : "Expandir subárbol"}
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          ) : (
            <span className="size-6 shrink-0" />
          )}

          {/* Node Name & Code */}
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <button
              type="button"
              onClick={() => onQuickView(node.id)}
              className="text-left font-medium text-foreground hover:text-primary transition-colors truncate"
            >
              {node.nombre}
            </button>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground border border-border/40 shrink-0">
              {node.codigo}
            </code>
          </div>

          {/* Type Badge */}
          <TipoUbicacionBadge tipo={node.tipo} className="shrink-0 hidden sm:inline-flex" />

          {/* Children Counter */}
          {hasChildren ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
              {childrenCount} {childrenCount === 1 ? "hijo" : "hijos"}
            </span>
          ) : null}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
          <Button
            size="icon-xs"
            variant="ghost"
            title="Agregar sub-ubicación"
            onClick={() => onAddChild(node)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver detalles"
            onClick={() => onQuickView(node.id)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Eye className="size-3.5" />
          </Button>

          <RowActions
            className="shrink-0"
            editLabel="Editar ubicación"
            deleteLabel="Eliminar ubicación"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(ubicacionObj)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>
      </div>

      {/* Recursive Children List */}
      {hasChildren && expanded ? (
        <ul className="relative ml-3 flex flex-col border-l border-border/50 pl-1 mt-0.5 gap-0.5">
          {node.hijos.map((childNode) => (
            <UbicacionTreeNodeItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onQuickView={onQuickView}
            />
          ))}
        </ul>
      ) : null}

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar ubicación"
        description={`¿Seguro que deseas eliminar "${node.nombre}"? Si tiene ubicaciones hijas, podrían verse afectadas.`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(node.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}
