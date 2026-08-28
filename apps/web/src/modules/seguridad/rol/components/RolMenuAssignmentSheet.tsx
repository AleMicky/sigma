import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  Loader2,
  Lock,
  Save,
  Search,
  Shield,
  X,
} from "lucide-react"

import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { DynamicLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"

import { useAsignarMenusRol } from "../api/rol.mutations"
import { rolQueries } from "../api/rol.queries"
import type { Rol } from "../api/rol.service"

type RolMenuAssignmentSheetProps = {
  rol: Rol | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getAllMenuIds(nodes: MenuTreeNode[]): string[] {
  const ids: string[] = []
  function traverse(nodeList: MenuTreeNode[]) {
    for (const node of nodeList) {
      ids.push(node.id)
      if (node.hijos && node.hijos.length > 0) {
        traverse(node.hijos)
      }
    }
  }
  traverse(nodes)
  return ids
}

function getDescendantIds(node: MenuTreeNode): string[] {
  const ids: string[] = [node.id]
  if (node.hijos && node.hijos.length > 0) {
    for (const child of node.hijos) {
      ids.push(...getDescendantIds(child))
    }
  }
  return ids
}

function filterTree(
  nodes: MenuTreeNode[],
  searchQuery: string,
): MenuTreeNode[] {
  if (!searchQuery.trim()) return nodes

  const query = searchQuery.toLowerCase().trim()

  function filterNode(node: MenuTreeNode): MenuTreeNode | null {
    const matchesSelf =
      node.nombre.toLowerCase().includes(query) ||
      node.codigo.toLowerCase().includes(query) ||
      (node.ruta && node.ruta.toLowerCase().includes(query))

    const filteredChildren = (node.hijos || [])
      .map(filterNode)
      .filter((n): n is MenuTreeNode => n !== null)

    if (matchesSelf || filteredChildren.length > 0) {
      return {
        ...node,
        hijos: filteredChildren,
      }
    }

    return null
  }

  return nodes
    .map(filterNode)
    .filter((n): n is MenuTreeNode => n !== null)
}

export function RolMenuAssignmentSheet({
  rol,
  open,
  onOpenChange,
}: RolMenuAssignmentSheetProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const menuArbolQuery = useQuery(menuQueries.arbol())
  const rolMenuIdsQuery = useQuery({
    ...rolQueries.menuIds(rol?.id ?? ""),
    enabled: Boolean(rol?.id && open),
  })

  const asignarMutation = useAsignarMenusRol()

  // Reset/sync state when opening with fresh data
  useEffect(() => {
    if (open && rolMenuIdsQuery.data) {
      setSelectedIds(new Set(rolMenuIdsQuery.data))
    }
  }, [open, rolMenuIdsQuery.data])

  // Initialize expanded nodes
  useEffect(() => {
    if (open && menuArbolQuery.data) {
      const allIds = getAllMenuIds(menuArbolQuery.data)
      setExpandedIds(new Set(allIds))
    }
  }, [open, menuArbolQuery.data])

  const allAvailableNodes = menuArbolQuery.data ?? []
  const allAvailableIds = useMemo(
    () => getAllMenuIds(allAvailableNodes),
    [allAvailableNodes],
  )

  const filteredNodes = useMemo(
    () => filterTree(allAvailableNodes, searchQuery),
    [allAvailableNodes, searchQuery],
  )

  function toggleNode(nodeId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  function handleSelectNode(node: MenuTreeNode, checked: boolean) {
    const descendantIds = getDescendantIds(node)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        descendantIds.forEach((id) => next.add(id))
      } else {
        descendantIds.forEach((id) => next.delete(id))
      }
      return next
    })
  }

  function handleSelectAll() {
    setSelectedIds(new Set(allAvailableIds))
  }

  function handleDeselectAll() {
    setSelectedIds(new Set())
  }

  function handleExpandAll() {
    setExpandedIds(new Set(allAvailableIds))
  }

  function handleCollapseAll() {
    setExpandedIds(new Set())
  }

  async function handleSave() {
    if (!rol) return
    try {
      await asignarMutation.mutateAsync({
        id: rol.id,
        menuIds: Array.from(selectedIds),
      })
      onOpenChange(false)
    } catch {
      // Handled by mutation onError toast
    }
  }

  if (!rol) return null

  const isLoadingData =
    menuArbolQuery.isLoading || (rolMenuIdsQuery.isLoading && open)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl p-0 flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Shield className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl font-bold truncate">
                  Asignar Menús al Rol
                </SheetTitle>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground font-semibold">
                  {rol.codigo}
                </code>
              </div>
              <SheetDescription className="text-xs text-muted-foreground truncate">
                Rol: <span className="font-semibold text-foreground">{rol.nombre || rol.codigo}</span>
              </SheetDescription>
            </div>
          </div>

          {/* Counter and status bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 text-xs font-mono">
                <Lock className="size-3 text-primary" />
                <span>
                  {selectedIds.size} de {allAvailableIds.length} menús asignados
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleSelectAll}
              >
                Seleccionar todos
              </Button>
              <span className="text-muted-foreground/40">•</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleDeselectAll}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Controls and Search */}
        <div className="p-4 border-b bg-card space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar menús por nombre, código o ruta…"
              className="pl-9 pr-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Árbol de navegación y accesos:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Expandir todo
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Colapsar todo
              </button>
            </div>
          </div>
        </div>

        {/* Tree Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs">Cargando árbol de menús y permisos…</p>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
              <FolderTree className="size-8 stroke-1" />
              <p className="text-xs font-medium">No se encontraron menús</p>
              <p className="text-[11px] text-muted-foreground/70">
                Prueba buscando con otro término.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNodes.map((node) => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  level={0}
                  selectedIds={selectedIds}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleNode}
                  onSelectNode={handleSelectNode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={asignarMutation.isPending || isLoadingData}
            className="gap-1.5"
          >
            {asignarMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>Guardar Permisos</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

type TreeNodeItemProps = {
  node: MenuTreeNode
  level: number
  selectedIds: Set<string>
  expandedIds: Set<string>
  onToggleExpand: (nodeId: string) => void
  onSelectNode: (node: MenuTreeNode, checked: boolean) => void
}

function TreeNodeItem({
  node,
  level,
  selectedIds,
  expandedIds,
  onToggleExpand,
  onSelectNode,
}: TreeNodeItemProps) {
  const hasChildren = node.hijos && node.hijos.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedIds.has(node.id)

  // Calculate if children are partially or fully selected
  const descendantIds = useMemo(() => getDescendantIds(node), [node])
  const selectedDescendantsCount = useMemo(
    () => descendantIds.filter((id) => selectedIds.has(id)).length,
    [descendantIds, selectedIds],
  )

  return (
    <div className="flex flex-col select-none">
      <div
        className={cn(
          "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-muted/60 text-xs",
          isSelected && "bg-primary/5 font-medium",
        )}
        style={{ paddingLeft: `${Math.max(level * 18 + 8, 8)}px` }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <span className="size-5" />
          )}

          {/* Checkbox Trigger */}
          <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectNode(node, e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
            />

            {/* Menu Icon */}
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md border text-muted-foreground",
                isSelected
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/40 border-border/50",
              )}
            >
              <DynamicLucideIcon
                name={node.icono ?? undefined}
                className="size-3.5"
                fallback={FolderTree}
              />
            </div>

            {/* Name and Code */}
            <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
              <span
                className={cn(
                  "truncate text-foreground text-xs",
                  isSelected && "font-semibold text-primary",
                )}
              >
                {node.nombre}
              </span>
              <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded shrink-0 font-mono">
                {node.codigo}
              </code>
            </div>
          </label>
        </div>

        {/* Route & Children Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {node.ruta && (
            <span className="hidden sm:inline-block font-mono text-[10px] text-muted-foreground/70 truncate max-w-[140px]">
              {node.ruta}
            </span>
          )}
          {hasChildren && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] py-0 px-1.5 font-mono",
                selectedDescendantsCount > 0
                  ? "border-primary/40 text-primary bg-primary/5"
                  : "text-muted-foreground",
              )}
            >
              {selectedDescendantsCount}/{descendantIds.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5 border-l border-border/40 ml-4 pl-1">
          {node.hijos.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  )
}
