import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Filter,
  FolderTree,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react"

import { menuQueries } from "@/modules/seguridad/menu/api/menu.queries"
import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"
import { DynamicLucideIcon } from "@/modules/seguridad/menu/components/DynamicLucideIcon"
import { EmptyState } from "@/shared/components/empty-state"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

import { useAsignarMenusRol } from "../api/rol.mutations"
import { rolQueries } from "../api/rol.queries"
import type { Rol } from "../api/rol.service"
import { getFriendlyRoleName } from "../utils/rol.utils"

type MenuFilterMode = "all" | "assigned" | "unassigned"

type RolMenuDetailPanelProps = {
  rol: Rol | null
  onBackToMaster?: () => void
  onOpenDetailDialog?: (rol: Rol) => void
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
  filterMode: MenuFilterMode,
  selectedIds: Set<string>,
): MenuTreeNode[] {
  const query = searchQuery.toLowerCase().trim()

  function filterNode(node: MenuTreeNode): MenuTreeNode | null {
    const descendantIds = getDescendantIds(node)
    const isNodeSelected = selectedIds.has(node.id)
    const hasSelectedDescendants = descendantIds.some((id) => selectedIds.has(id))

    // Filter by Assignment Mode
    let passesFilterMode = true
    if (filterMode === "assigned") {
      passesFilterMode = isNodeSelected || hasSelectedDescendants
    } else if (filterMode === "unassigned") {
      const allSelected = descendantIds.every((id) => selectedIds.has(id))
      passesFilterMode = !allSelected
    }

    if (!passesFilterMode) return null

    // Search query matching
    const matchesSelf =
      !query ||
      node.nombre.toLowerCase().includes(query) ||
      node.codigo.toLowerCase().includes(query) ||
      Boolean(node.ruta && node.ruta.toLowerCase().includes(query))

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

function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) {
    if (!b.has(item)) return false
  }
  return true
}

export function RolMenuDetailPanel({
  rol,
  onBackToMaster,
  onOpenDetailDialog,
}: RolMenuDetailPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState<MenuFilterMode>("all")
  const [copiedCode, setCopiedCode] = useState(false)

  const menuArbolQuery = useQuery(menuQueries.arbol())
  const rolMenuIdsQuery = useQuery({
    ...rolQueries.menuIds(rol?.id ?? ""),
    enabled: Boolean(rol?.id),
  })

  const asignarMutation = useAsignarMenusRol()

  // Reset/sync state when role changes or query data arrives
  useEffect(() => {
    if (rol && rolMenuIdsQuery.data) {
      const loaded = new Set(rolMenuIdsQuery.data)
      setSelectedIds(loaded)
      setInitialIds(loaded)
    } else if (!rol) {
      setSelectedIds(new Set())
      setInitialIds(new Set())
    }
  }, [rol?.id, rolMenuIdsQuery.data])

  // Initialize expanded nodes
  useEffect(() => {
    if (menuArbolQuery.data) {
      const allIds = getAllMenuIds(menuArbolQuery.data)
      setExpandedIds(new Set(allIds))
    }
  }, [menuArbolQuery.data])

  const allAvailableNodes = menuArbolQuery.data ?? []
  const allAvailableIds = useMemo(
    () => getAllMenuIds(allAvailableNodes),
    [allAvailableNodes],
  )

  const filteredNodes = useMemo(
    () => filterTree(allAvailableNodes, searchQuery, filterMode, selectedIds),
    [allAvailableNodes, searchQuery, filterMode, selectedIds],
  )

  const isDirty = useMemo(
    () => !areSetsEqual(selectedIds, initialIds),
    [selectedIds, initialIds],
  )

  const coveragePercent = useMemo(() => {
    if (allAvailableIds.length === 0) return 0
    return Math.round((selectedIds.size / allAvailableIds.length) * 100)
  }, [selectedIds.size, allAvailableIds.length])

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

  function handleResetChanges() {
    setSelectedIds(new Set(initialIds))
  }

  function handleCopyCode() {
    if (!rol?.codigo) return
    void navigator.clipboard.writeText(rol.codigo)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 1800)
  }

  async function handleSave() {
    if (!rol) return
    try {
      await asignarMutation.mutateAsync({
        id: rol.id,
        menuIds: Array.from(selectedIds),
      })
      setInitialIds(new Set(selectedIds))
    } catch {
      // Error toast managed by mutation
    }
  }

  // Keyboard shortcut Ctrl+S / Cmd+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (isDirty && !asignarMutation.isPending) {
          void handleSave()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDirty, asignarMutation.isPending, handleSave])

  // If no role is selected, render placeholder state
  if (!rol) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6 text-center">
        <EmptyState
          icon={<Shield className="size-10 text-muted-foreground/50" />}
          title="Ningún rol seleccionado"
          description="Selecciona un rol de la lista izquierda para auditar y gestionar sus menús asignados."
        />
      </div>
    )
  }

  const isLoadingData =
    menuArbolQuery.isLoading || rolMenuIdsQuery.isLoading

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
      {/* Header Premium del Rol Seleccionado */}
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-border/70 bg-gradient-to-b from-muted/30 to-muted/10 px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Botón Volver en móvil + Avatar y Título del Rol */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {onBackToMaster && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackToMaster}
                className="size-7 shrink-0 lg:hidden cursor-pointer"
                title="Volver a la lista de roles"
              >
                <ArrowLeft className="size-3.5" />
              </Button>
            )}

            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shadow-2xs">
              <Shield className="size-4.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                {getFriendlyRoleName(rol)}
              </h2>

              {/* Botón de copia de código con animación */}
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copiar código de rol"
                className="group flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary cursor-pointer"
              >
                <span>{rol.codigo}</span>
                {copiedCode ? (
                  <Check className="size-2.5 text-emerald-500" />
                ) : (
                  <Copy className="size-2.5 opacity-60 group-hover:opacity-100" />
                )}
              </button>

              <Badge
                variant={rol.activo ? "outline" : "destructive"}
                className={cn(
                  "text-[9.5px] py-0 px-1.5 font-medium h-4.5",
                  rol.activo && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
                )}
              >
                {rol.activo ? (
                  <CheckCircle2 className="size-2.5 mr-0.5" />
                ) : (
                  <XCircle className="size-2.5 mr-0.5" />
                )}
                {rol.activo ? "Activo" : "Inactivo"}
              </Badge>

              {rol.keycloakRoleId && (
                <span className="hidden xl:inline-flex items-center gap-1 font-mono text-[9.5px] text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                  <KeyRound className="size-2.5 text-amber-500" />
                  <span className="truncate max-w-[120px]">{rol.keycloakRoleId}</span>
                </span>
              )}
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenDetailDialog && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenDetailDialog(rol)}
                className="h-7 gap-1 text-[11px] px-2.5 cursor-pointer border-border/80 hover:bg-muted"
                title="Ver identificadores técnicos y registro de auditoría"
              >
                <Eye className="size-3 text-muted-foreground" />
                <span className="hidden sm:inline">Auditoría / Ficha</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleSave}
              disabled={asignarMutation.isPending || isLoadingData || !isDirty}
              className={cn(
                "h-7 gap-1.5 text-[11px] px-3 font-semibold transition-all cursor-pointer",
                isDirty && "shadow-xs ring-2 ring-primary/20",
              )}
              title="Guardar permisos (Ctrl+S / ⌘S)"
            >
              {asignarMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Save className="size-3" />
              )}
              <span>Guardar</span>
              <kbd className="hidden md:inline-block ml-0.5 text-[9px] opacity-70 bg-primary-foreground/20 px-1 rounded font-mono">
                ⌘S
              </kbd>
            </Button>
          </div>
        </div>

        {/* Barra de progreso de cobertura de menús */}
        <div className="flex flex-col gap-1 pt-1 border-t border-border/40">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span className="font-medium text-foreground">
                {selectedIds.size} de {allAvailableIds.length} menús asignados
              </span>
              <span className="text-muted-foreground/60">({coveragePercent}%)</span>
            </div>

            {isDirty && (
              <span className="flex items-center gap-1 text-[10.5px] font-medium text-amber-600 dark:text-amber-400 animate-pulse">
                <AlertTriangle className="size-3" />
                Cambios pendientes
              </span>
            )}
          </div>

          {/* Mini barra de progreso */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                coveragePercent === 100
                  ? "bg-emerald-500"
                  : coveragePercent > 0
                    ? "bg-primary"
                    : "bg-muted-foreground/30",
              )}
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Barra de Herramientas, Filtros y Búsqueda */}
      <div className="shrink-0 px-3.5 py-2 border-b border-border/70 bg-card/60 space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Buscador de menús */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el árbol por nombre, código o ruta…"
              className="pl-7 pr-7 text-xs h-7.5 bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Filtro de asignación (Todos / Asignados / No asignados) */}
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5 text-[11px] border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={cn(
                "px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer",
                filterMode === "all"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("assigned")}
              className={cn(
                "px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1",
                filterMode === "assigned"
                  ? "bg-card text-primary shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Check className="size-2.5" />
              <span>Asignados</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("unassigned")}
              className={cn(
                "px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1",
                filterMode === "unassigned"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <X className="size-2.5" />
              <span>Sin asignar</span>
            </button>
          </div>
        </div>

        {/* Acciones rápidas de selección y expansión */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectAll}
              className="hover:text-primary transition-colors cursor-pointer font-medium"
            >
              Seleccionar todos
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="hover:text-primary transition-colors cursor-pointer font-medium"
            >
              Limpiar selección
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExpandAll}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Expandir todo
            </button>
            <span>•</span>
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

      {/* Árbol Jerárquico de Menús */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-0.5 overscroll-contain">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2.5 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs font-medium">Cargando árbol de permisos…</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
            <FolderTree className="size-8 stroke-1 text-muted-foreground/50" />
            <p className="text-xs font-semibold text-foreground">No se encontraron menús</p>
            <p className="text-[11px] text-muted-foreground/70 max-w-xs">
              {searchQuery || filterMode !== "all"
                ? "Ningún elemento coincide con los filtros aplicados."
                : "No hay menús disponibles en el sistema."}
            </p>
            {(searchQuery || filterMode !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setFilterMode("all")
                }}
                className="h-7 text-xs gap-1 mt-1 cursor-pointer"
              >
                <Filter className="size-3" />
                <span>Restablecer filtros</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
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

      {/* Banner flotante de cambios sin guardar */}
      {isDirty && (
        <div className="shrink-0 border-t border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
            <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Tienes modificaciones pendientes de guardar</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetChanges}
              disabled={asignarMutation.isPending}
              className="h-6.5 text-[11px] px-2 text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 cursor-pointer"
            >
              <RotateCcw className="size-2.5 mr-1" />
              <span>Deshacer</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={asignarMutation.isPending}
              className="h-6.5 text-[11px] px-2.5 gap-1 font-semibold cursor-pointer shadow-xs"
            >
              {asignarMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Save className="size-3" />
              )}
              <span>Guardar cambios</span>
            </Button>
          </div>
        </div>
      )}
    </div>
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
  const checkboxRef = useRef<HTMLInputElement>(null)
  const hasChildren = node.hijos && node.hijos.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelfSelected = selectedIds.has(node.id)

  const descendantIds = useMemo(() => getDescendantIds(node), [node])
  const selectedDescendantsCount = useMemo(
    () => descendantIds.filter((id) => selectedIds.has(id)).length,
    [descendantIds, selectedIds],
  )

  const isAllDescendantsSelected =
    descendantIds.length > 0 && selectedDescendantsCount === descendantIds.length
  const isIndeterminate =
    hasChildren && selectedDescendantsCount > 0 && !isAllDescendantsSelected

  // Handle native checkbox indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const isChecked = hasChildren ? isAllDescendantsSelected : isSelfSelected

  return (
    <div className="flex flex-col select-none">
      <div
        className={cn(
          "group flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs",
          "hover:bg-muted/60",
          isChecked && "bg-primary/[0.04]",
          isIndeterminate && "bg-amber-500/[0.03]",
        )}
        style={{ paddingLeft: `${Math.max(level * 16 + 6, 6)}px` }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {/* Botón expandir/colapsar */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="size-4.5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <span className="size-4.5" />
          )}

          {/* Checkbox y etiqueta */}
          <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onSelectNode(node, e.target.checked)}
              className="size-3.5 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
            />

            {/* Icono del Menú */}
            <div
              className={cn(
                "flex size-5.5 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors",
                isChecked
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : isIndeterminate
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : "bg-muted/40 border-border/50",
              )}
            >
              <DynamicLucideIcon
                name={node.icono ?? undefined}
                className="size-3"
                fallback={FolderTree}
              />
            </div>

            {/* Nombre y Código */}
            <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
              <span
                className={cn(
                  "truncate text-xs transition-colors",
                  isChecked
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {node.nombre}
              </span>
              <code className="text-[9px] text-muted-foreground/80 bg-muted px-1 py-0.2 rounded shrink-0 font-mono">
                {node.codigo}
              </code>
            </div>
          </label>
        </div>

        {/* Ruta y Contador de Hijos */}
        <div className="flex items-center gap-1.5 shrink-0">
          {node.ruta && (
            <span className="hidden sm:inline-block font-mono text-[9.5px] text-muted-foreground/60 truncate max-w-[140px]">
              {node.ruta}
            </span>
          )}
          {hasChildren && (
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] py-0 px-1 font-mono h-4",
                isAllDescendantsSelected
                  ? "border-primary/40 text-primary bg-primary/5 font-semibold"
                  : isIndeterminate
                    ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-medium"
                    : "text-muted-foreground/70",
              )}
            >
              {selectedDescendantsCount}/{descendantIds.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Nodos hijos recursivos con línea guía vertical */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5 border-l border-border/50 ml-3.5 pl-1 my-0.5">
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
