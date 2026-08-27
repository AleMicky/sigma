import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Link as LinkIcon,
  Plus,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { useDeleteMenu } from "../api/menu.mutations"
import type { Menu, MenuTreeNode } from "../api/menu.service"
import { DynamicLucideIcon } from "./DynamicLucideIcon"

type MenuTreeNodeItemProps = {
  node: MenuTreeNode
  level?: number
  defaultExpanded?: boolean
  searchQuery?: string
  statusFilter?: "all" | "active" | "inactive"
  onEdit: (menu: Menu) => void
  onAddChild: (parent: MenuTreeNode) => void
  onQuickView: (id: string) => void
}

export function MenuTreeNodeItem({
  node,
  level = 0,
  defaultExpanded = true,
  searchQuery = "",
  statusFilter = "all",
  onEdit,
  onAddChild,
  onQuickView,
}: MenuTreeNodeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteMutation = useDeleteMenu()

  const hasChildren = Boolean(node.hijos && node.hijos.length > 0)
  const childrenCount = node.hijos ? node.hijos.length : 0

  // Adapter for onEdit callback
  const menuObj: Menu = {
    id: node.id,
    menuPadreId: node.menuPadreId,
    codigo: node.codigo,
    nombre: node.nombre,
    icono: node.icono,
    ruta: node.ruta,
    orden: node.orden,
    activo: node.activo,
    createdAt: "",
    updatedAt: "",
    createdBy: "",
    updatedBy: "",
  }

  const query = searchQuery.trim().toLowerCase()
  const isHighlighted =
    query.length > 0 &&
    (node.nombre.toLowerCase().includes(query) ||
      node.codigo.toLowerCase().includes(query) ||
      (node.ruta && node.ruta.toLowerCase().includes(query)))

  return (
    <li className="flex flex-col min-w-0">
      <div
        className={cn(
          "group relative flex items-center justify-between gap-2 rounded-xl border border-transparent px-3 py-2 text-sm transition-all duration-150 hover:border-border/80 hover:bg-accent/40",
          !node.activo && "opacity-60 hover:opacity-100 bg-muted/20",
          isHighlighted && "bg-primary/10 border-primary/40 font-medium shadow-2xs",
        )}
        style={{ paddingLeft: `${level * 22 + 10}px` }}
      >
        {/* Left Side: Toggle button, Icon, Name, Code, Route, Active status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Expand/Collapse Toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={expanded ? "Colapsar submenús" : "Expandir submenús"}
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          ) : (
            <span className="size-6 shrink-0 flex items-center justify-center">
              <span className="size-1.5 rounded-full bg-border" />
            </span>
          )}

          {/* Menu Icon Badge */}
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border shrink-0 transition-colors",
              level === 0
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-muted/80 border-border text-muted-foreground",
            )}
          >
            <DynamicLucideIcon name={node.icono ?? undefined} className="size-3.5" />
          </div>

          {/* Name and Code */}
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

            {/* Route link preview */}
            {node.ruta && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 font-mono truncate max-w-[200px]">
                <LinkIcon className="size-2.5 shrink-0 opacity-60" />
                <span className="truncate">{node.ruta}</span>
              </span>
            )}
          </div>

          {/* Orden badge */}
          <span className="hidden lg:inline-flex rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono shrink-0">
            Ord: {node.orden}
          </span>

          {/* Children Counter */}
          {hasChildren ? (
            <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0 border border-border/40">
              {childrenCount} {childrenCount === 1 ? "submenú" : "submenús"}
            </span>
          ) : null}

          {/* Active status */}
          {!node.activo && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-destructive/40 text-destructive shrink-0">
              Inactivo
            </Badge>
          )}
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            size="icon-xs"
            variant="ghost"
            title="Agregar submenú hijo"
            onClick={() => onAddChild(node)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Plus className="size-3.5" />
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            title="Ver detalles del menú"
            onClick={() => onQuickView(node.id)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Eye className="size-3.5" />
          </Button>

          <RowActions
            className="shrink-0"
            editLabel="Editar menú"
            deleteLabel="Eliminar menú"
            deleteDisabled={deleteMutation.isPending}
            onEdit={() => onEdit(menuObj)}
            onDelete={() => setConfirmOpen(true)}
          />
        </div>
      </div>

      {/* Recursive Children List */}
      {hasChildren && expanded ? (
        <ul className="relative ml-4 flex flex-col border-l border-border/50 pl-1 mt-0.5 gap-0.5">
          {node.hijos.map((childNode) => (
            <MenuTreeNodeItem
              key={childNode.id}
              node={childNode}
              level={level + 1}
              defaultExpanded={defaultExpanded}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
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
        title="Eliminar menú"
        description={`¿Seguro que deseas eliminar el menú "${node.nombre}"? Si tiene submenús asociados, el servidor denegará la acción.`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(node.id)
          setConfirmOpen(false)
        }}
      />
    </li>
  )
}
