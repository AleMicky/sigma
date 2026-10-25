import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, HelpCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { permisoQueries } from "@/modules/seguridad/permiso/api/permiso.queries"
import { MenuPermisosSheet } from "@/modules/seguridad/permiso/components/MenuPermisosSheet"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import { menuQueries } from "../api/menu.queries"
import type { Menu, MenuTreeNode } from "../api/menu.service"
import { MenuDetailDialog } from "../components/MenuDetailDialog"
import {
  MenuFilterToolbar,
  type MenuStatusFilter,
  type MenuViewMode,
} from "../components/MenuFilterToolbar"
import { MenuFormSheet } from "../components/MenuFormSheet"
import { MenuHelpModal } from "../components/MenuHelpModal"
import { MenuTableView } from "../components/MenuTableView"
import { MenuTreeView } from "../components/MenuTreeView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const EMPTY_MENUS: Menu[] = []
const EMPTY_TREE_NODES: MenuTreeNode[] = []
const EMPTY_PERMISOS: { menuId: string }[] = []

function buildPermisosCountMap(permisos: { menuId: string }[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const p of permisos) {
    map.set(p.menuId, (map.get(p.menuId) ?? 0) + 1)
  }
  return map
}

function buildParentsMap(menus: Menu[]): Map<string, Menu> {
  const map = new Map<string, Menu>()
  for (const m of menus) {
    map.set(m.id, m)
  }
  return map
}

function findMenuById(menus: Menu[], id: string | null): Menu | null {
  if (!id) return null
  return menus.find((m) => m.id === id) ?? null
}

function findParentMenu(
  menu: Menu | null,
  parentsById: Map<string, Menu>,
): Menu | null {
  if (!menu?.menuPadreId) return null
  return parentsById.get(menu.menuPadreId) ?? null
}

function filterMenusByStatus(
  menus: Menu[],
  statusFilter: MenuStatusFilter,
): Menu[] {
  if (statusFilter === "all") return menus
  const wantActive = statusFilter === "active"
  return menus.filter((m) => m.activo === wantActive)
}

type MenuTreeSectionProps = {
  isLoading: boolean
  error: unknown
  treeNodes: MenuTreeNode[]
  searchQuery: string
  statusFilter: MenuStatusFilter
  expandedAll: boolean
  permisosCountByMenuId: Map<string, number>
  onEdit: (menu: Menu) => void
  onAddChild: (parent: MenuTreeNode) => void
  onQuickView: (id: string) => void
  onOpenCreate: () => void
  onManagePermisos: (menu: Menu) => void
}

function MenuTreeSection({
  isLoading,
  error,
  treeNodes,
  searchQuery,
  statusFilter,
  expandedAll,
  permisosCountByMenuId,
  onEdit,
  onAddChild,
  onQuickView,
  onOpenCreate,
  onManagePermisos,
}: Readonly<MenuTreeSectionProps>) {
  if (isLoading) {
    return <ListSkeleton rows={7} rowClassName="h-12 rounded-lg" />
  }

  if (error) {
    return (
      <EmptyState
        title={getErrorMessage(error)}
        className="text-destructive"
      />
    )
  }

  return (
    <MenuTreeView
      treeNodes={treeNodes}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      expandedAll={expandedAll}
      permisosCountByMenuId={permisosCountByMenuId}
      onEdit={onEdit}
      onAddChild={onAddChild}
      onQuickView={onQuickView}
      onOpenCreate={onOpenCreate}
      onManagePermisos={onManagePermisos}
    />
  )
}

type MenuTableEmptyStateProps = {
  hasActiveFilters: boolean
  onResetFilters: () => void
  onOpenCreate: () => void
}

function MenuTableEmptyState({
  hasActiveFilters,
  onResetFilters,
  onOpenCreate,
}: Readonly<MenuTableEmptyStateProps>) {
  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={<FolderTree className="size-5 text-muted-foreground" />}
        title="Sin resultados"
        description="Prueba con otra búsqueda o restablece los filtros."
        action={
          <Button size="sm" type="button" onClick={onResetFilters}>
            Limpiar filtros
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={<FolderTree className="size-5 text-muted-foreground" />}
      title="No hay menús disponibles"
      description="Crea tu primer menú para configurar el árbol de navegación."
      action={
        <Button size="sm" type="button" onClick={onOpenCreate} className="gap-1.5">
          <Plus className="size-4" />
          Crear Menú
        </Button>
      }
    />
  )
}

type MenuTableSectionProps = {
  isLoading: boolean
  isFetching: boolean
  error: unknown
  menus: Menu[]
  pageData?: PageResponse<Menu>
  hasActiveFilters: boolean
  parentsById: Map<string, Menu>
  permisosCountByMenuId: Map<string, number>
  onPageChange: (page: number) => void
  onResetFilters: () => void
  onOpenCreate: () => void
  onEdit: (menu: Menu) => void
  onQuickView: (id: string) => void
  onManagePermisos: (menu: Menu) => void
}

function MenuTableSection({
  isLoading,
  isFetching,
  error,
  menus,
  pageData,
  hasActiveFilters,
  parentsById,
  permisosCountByMenuId,
  onPageChange,
  onResetFilters,
  onOpenCreate,
  onEdit,
  onQuickView,
  onManagePermisos,
}: Readonly<MenuTableSectionProps>) {
  if (isLoading) {
    return <ListSkeleton rows={8} rowClassName="h-14 rounded-lg" />
  }

  if (error) {
    return (
      <EmptyState
        title={getErrorMessage(error)}
        className="text-destructive"
      />
    )
  }

  if (menus.length === 0) {
    return (
      <MenuTableEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
        onOpenCreate={onOpenCreate}
      />
    )
  }

  return (
    <>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
          isFetching && "opacity-70",
        )}
      >
        <MenuTableView
          menus={menus}
          parentsById={parentsById}
          permisosCountByMenuId={permisosCountByMenuId}
          onEdit={onEdit}
          onQuickView={onQuickView}
          onManagePermisos={onManagePermisos}
        />
      </div>

      {pageData && (
        <Pagination
          page={pageData}
          onPageChange={onPageChange}
          className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
        />
      )}
    </>
  )
}

export function MenusPage() {
  const [viewMode, setViewMode] = useState<MenuViewMode>("tree")
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Menu | null>(null)
  const [presetParentId, setPresetParentId] = useState<string | null>(null)
  const [quickViewId, setQuickViewId] = useState<string | null>(null)
  const [permisosMenu, setPermisosMenu] = useState<Menu | null>(null)
  const [treeExpandedAll, setTreeExpandedAll] = useState(true)

  const search = usePaginatedSearch()

  // Queries
  const arbolQuery = useQuery(menuQueries.arbol())
  const allListQuery = useQuery(menuQueries.allList())
  const allPermisosQuery = useQuery(permisoQueries.allList())
  const paginatedListQuery = useQuery(
    menuQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const treeNodes = arbolQuery.data ?? EMPTY_TREE_NODES
  const allMenus = allListQuery.data ?? EMPTY_MENUS
  const allPermisos = allPermisosQuery.data ?? EMPTY_PERMISOS
  const paginatedMenus = paginatedListQuery.data?.content ?? EMPTY_MENUS

  // Permissions count per menu
  const permisosCountByMenuId = useMemo(
    () => buildPermisosCountMap(allPermisos),
    [allPermisos],
  )

  // Create lookup maps for parent menu lookup
  const parentsById = useMemo(
    () => buildParentsMap(allMenus),
    [allMenus],
  )

  // Selected menu for quick view dialog
  const selectedQuickViewMenu = useMemo(
    () => findMenuById(allMenus, quickViewId),
    [allMenus, quickViewId],
  )

  const selectedQuickViewParent = useMemo(
    () => findParentMenu(selectedQuickViewMenu, parentsById),
    [selectedQuickViewMenu, parentsById],
  )

  useClampPage(
    search.page,
    search.setPage,
    paginatedListQuery.data?.totalPages,
  )

  function openCreate(parentId?: string | null) {
    setEditing(null)
    setPresetParentId(parentId ?? null)
    setDialogOpen(true)
  }

  function openEdit(menu: Menu) {
    setEditing(menu)
    setPresetParentId(null)
    setDialogOpen(true)
  }

  function handleAddChildNode(parentNode: MenuTreeNode) {
    openCreate(parentNode.id)
  }

  function handleManagePermisos(menu: Menu) {
    setPermisosMenu(menu)
  }

  function handleCloseQuickView(open: boolean) {
    if (!open) {
      setQuickViewId(null)
    }
  }

  function handleClosePermisos(open: boolean) {
    if (!open) {
      setPermisosMenu(null)
    }
  }

  function handleFormSuccess() {
    if (!editing) {
      search.setPage(0)
    }
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || statusFilter !== "all",
  )

  function resetFilters() {
    search.setSearch("")
    setStatusFilter("all")
  }

  // Filter list for table view if status filter active
  const filteredTableMenus = useMemo(
    () => filterMenusByStatus(paginatedMenus, statusFilter),
    [paginatedMenus, statusFilter],
  )

  const allQueries = [
    arbolQuery,
    allListQuery,
    paginatedListQuery,
    allPermisosQuery,
  ]

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-3 sm:gap-3 sm:py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
                <FolderTree className="size-4 sm:size-4.5" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                  Administración de Menús
                </h1>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton size="sm" queries={allQueries} />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
              >
                <HelpCircle className="size-4 text-primary" />
                <span className="sr-only sm:not-sr-only">Guía</span>
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => openCreate()}
                className="gap-1"
              >
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Estructura jerárquica, iconos, rutas, orden y permisos de seguridad por menú.
          </p>
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <RefreshButton size="sm" queries={allQueries} />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted cursor-pointer"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Estructura</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={() => openCreate()}
            className="gap-1.5 cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Crear Menú Raíz</span>
          </Button>
        </div>
      </header>

      {/* Filter & View Mode Toolbar */}
      <MenuFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onExpandAll={() => setTreeExpandedAll(true)}
        onCollapseAll={() => setTreeExpandedAll(false)}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {viewMode === "tree" ? (
          <MenuTreeSection
            isLoading={arbolQuery.isLoading}
            error={arbolQuery.error}
            treeNodes={treeNodes}
            searchQuery={search.search}
            statusFilter={statusFilter}
            expandedAll={treeExpandedAll}
            permisosCountByMenuId={permisosCountByMenuId}
            onEdit={openEdit}
            onAddChild={handleAddChildNode}
            onQuickView={(id) => setQuickViewId(id)}
            onOpenCreate={() => openCreate()}
            onManagePermisos={handleManagePermisos}
          />
        ) : (
          <MenuTableSection
            isLoading={paginatedListQuery.isLoading}
            isFetching={paginatedListQuery.isFetching}
            error={paginatedListQuery.error}
            menus={filteredTableMenus}
            pageData={paginatedListQuery.data}
            hasActiveFilters={hasActiveFilters}
            parentsById={parentsById}
            permisosCountByMenuId={permisosCountByMenuId}
            onPageChange={search.setPage}
            onResetFilters={resetFilters}
            onOpenCreate={() => openCreate()}
            onEdit={openEdit}
            onQuickView={(id) => setQuickViewId(id)}
            onManagePermisos={handleManagePermisos}
          />
        )}
      </div>

      {/* Form Drawer Sheet */}
      <MenuFormSheet
        key={`${editing?.id ?? "new"}-${presetParentId ?? "root"}-${dialogOpen ? "open" : "closed"}-${allMenus.length}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menu={editing}
        parentMenuId={presetParentId}
        availableMenus={allMenus}
        onSuccess={handleFormSuccess}
      />

      {/* Quick View Dialog */}
      <MenuDetailDialog
        open={Boolean(quickViewId)}
        onOpenChange={handleCloseQuickView}
        menu={selectedQuickViewMenu}
        parentMenu={selectedQuickViewParent}
        allMenus={allMenus}
        onEdit={openEdit}
        onManagePermisos={handleManagePermisos}
      />

      {/* Permissions Management Sheet */}
      <MenuPermisosSheet
        key={`permisos-${permisosMenu?.id ?? "closed"}-${permisosMenu ? "open" : "closed"}`}
        open={Boolean(permisosMenu)}
        onOpenChange={handleClosePermisos}
        menu={permisosMenu}
      />

      {/* Structural Hierarchy Help Modal */}
      <MenuHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />
    </PageShell>
  )
}

