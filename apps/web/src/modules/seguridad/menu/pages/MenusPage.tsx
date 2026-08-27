import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, HelpCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
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

export function MenusPage() {
  const [viewMode, setViewMode] = useState<MenuViewMode>("tree")
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Menu | null>(null)
  const [presetParentId, setPresetParentId] = useState<string | null>(null)
  const [quickViewId, setQuickViewId] = useState<string | null>(null)
  const [treeExpandedAll, setTreeExpandedAll] = useState(true)

  const search = usePaginatedSearch()

  // Queries
  const arbolQuery = useQuery(menuQueries.arbol())
  const allListQuery = useQuery(menuQueries.allList())
  const paginatedListQuery = useQuery(
    menuQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const treeNodes = arbolQuery.data ?? []
  const allMenus = allListQuery.data ?? []
  const paginatedMenus = paginatedListQuery.data?.content ?? []

  // Create lookup maps for parent menu lookup
  const parentsById = useMemo(() => {
    const map = new Map<string, Menu>()
    for (const m of allMenus) {
      map.set(m.id, m)
    }
    return map
  }, [allMenus])

  // Selected menu for quick view dialog
  const selectedQuickViewMenu = useMemo(() => {
    if (!quickViewId) return null
    return allMenus.find((m) => m.id === quickViewId) ?? null
  }, [quickViewId, allMenus])

  const selectedQuickViewParent = useMemo(() => {
    if (!selectedQuickViewMenu?.menuPadreId) return null
    return parentsById.get(selectedQuickViewMenu.menuPadreId) ?? null
  }, [selectedQuickViewMenu, parentsById])

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

  const hasActiveFilters = Boolean(
    search.search.trim() || statusFilter !== "all",
  )

  function resetFilters() {
    search.setSearch("")
    setStatusFilter("all")
  }

  // Filter list for table view if status filter active
  const filteredTableMenus = useMemo(() => {
    if (statusFilter === "all") return paginatedMenus
    return paginatedMenus.filter((m) =>
      statusFilter === "active" ? m.activo : !m.activo,
    )
  }, [paginatedMenus, statusFilter])

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
                <FolderTree className="size-5 sm:size-5.5" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Administración de Menús
                </h1>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                queries={[arbolQuery, allListQuery, paginatedListQuery]}
              />
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

          <p className="text-sm text-muted-foreground">
            Estructura jerárquica, iconos, rutas y orden de los elementos del menú de navegación.
          </p>
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            queries={[arbolQuery, allListQuery, paginatedListQuery]}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Estructura</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={() => openCreate()}
            className="gap-1.5"
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
          arbolQuery.isLoading ? (
            <ListSkeleton rows={7} rowClassName="h-12 rounded-lg" />
          ) : arbolQuery.isError ? (
            <EmptyState
              title={getErrorMessage(arbolQuery.error)}
              className="text-destructive"
            />
          ) : (
            <MenuTreeView
              treeNodes={treeNodes}
              searchQuery={search.search}
              statusFilter={statusFilter}
              expandedAll={treeExpandedAll}
              onEdit={openEdit}
              onAddChild={handleAddChildNode}
              onQuickView={(id) => setQuickViewId(id)}
              onOpenCreate={() => openCreate()}
            />
          )
        ) : paginatedListQuery.isLoading ? (
          <ListSkeleton rows={8} rowClassName="h-14 rounded-lg" />
        ) : paginatedListQuery.isError ? (
          <EmptyState
            title={getErrorMessage(paginatedListQuery.error)}
            className="text-destructive"
          />
        ) : filteredTableMenus.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="size-5 text-muted-foreground" />}
            title={hasActiveFilters ? "Sin resultados" : "No hay menús disponibles"}
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o restablece los filtros."
                : "Crea tu primer menú para configurar el árbol de navegación."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={() => openCreate()} className="gap-1.5">
                  <Plus className="size-4" />
                  Crear Menú
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                paginatedListQuery.isFetching && "opacity-70",
              )}
            >
              <MenuTableView
                menus={filteredTableMenus}
                parentsById={parentsById}
                onEdit={openEdit}
                onQuickView={(id) => setQuickViewId(id)}
              />
            </div>

            {paginatedListQuery.data && (
              <Pagination
                page={paginatedListQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            )}
          </>
        )}
      </div>

      {/* Form Drawer Sheet */}
      <MenuFormSheet
        key={editing?.id ?? presetParentId ?? "new-menu"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menu={editing}
        parentMenuId={presetParentId}
        availableMenus={allMenus}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Dialog */}
      <MenuDetailDialog
        open={Boolean(quickViewId)}
        onOpenChange={(open) => !open && setQuickViewId(null)}
        menu={selectedQuickViewMenu}
        parentMenu={selectedQuickViewParent}
        allMenus={allMenus}
        onEdit={openEdit}
      />

      {/* Structural Hierarchy Help Modal */}
      <MenuHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />
    </PageShell>
  )
}
