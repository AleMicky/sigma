import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Copy,
  Cpu,
  FileText,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailPanelHeader,
  DetailPanelShell,
  PaginatedList,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useClampPage } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteActividad } from "../api/actividad.mutations"
import { useDeleteActividadAplicacion } from "../api/actividad-aplicacion.mutations"
import { actividadAplicacionQueries } from "../api/actividad-aplicacion.queries"
import type { ActividadAplicacion } from "../api/actividad-aplicacion.service"
import { useDeleteChecklistItem } from "../api/checklist-item.mutations"
import { checklistItemQueries } from "../api/checklist-item.queries"
import type { ChecklistItem } from "../api/checklist-item.service"
import type { ActividadMantenimiento } from "../api/actividad.service"
import { ActividadAplicacionFormDialog } from "./ActividadAplicacionFormDialog"
import { ChecklistItemFormDialog } from "./ChecklistItemFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type ActividadDetailPanelProps = {
  actividad: ActividadMantenimiento | null
  page: number
  search: string
  searchQuery: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onEdit?: (actividad: ActividadMantenimiento) => void
}

export function ActividadDetailPanel({
  actividad,
  page,
  search,
  searchQuery,
  hidePrimaryAction = false,
  onSearchChange,
  onPageChange,
  onEdit,
}: ActividadDetailPanelProps) {
  const [showAddAplicacionDialog, setShowAddAplicacionDialog] = useState(false)
  const [aplicacionToDelete, setAplicacionToDelete] =
    useState<ActividadAplicacion | null>(null)
  const [showDeleteActividadDialog, setShowDeleteActividadDialog] =
    useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Checklist state per application
  const [activeAplicacionForChecklist, setActiveAplicacionForChecklist] =
    useState<ActividadAplicacion | null>(null)
  const [showChecklistDialog, setShowChecklistDialog] = useState(false)
  const [editingChecklistItem, setEditingChecklistItem] =
    useState<ChecklistItem | null>(null)
  const [checklistItemToDelete, setChecklistItemToDelete] =
    useState<ChecklistItem | null>(null)

  const deleteActividadMutation = useDeleteActividad()
  const deleteAplicacionMutation = useDeleteActividadAplicacion()
  const deleteChecklistItemMutation = useDeleteChecklistItem()

  // Consulta de aplicaciones (tipos de activo y componentes asociados)
  const aplicacionesQuery = useQuery({
    ...actividadAplicacionQueries.byActividad(actividad?.id ?? "", {
      page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
    }),
    enabled: Boolean(actividad?.id),
  })

  useClampPage(page, onPageChange, aplicacionesQuery.data?.totalPages)

  const rawAplicaciones = aplicacionesQuery.data?.content ?? []

  const aplicaciones = useMemo(() => {
    if (!searchQuery.trim()) return rawAplicaciones
    const term = searchQuery.trim().toLowerCase()
    return rawAplicaciones.filter(
      (a) =>
        (a.tipoActivo?.nombre?.toLowerCase().includes(term) ?? false) ||
        (a.componente?.nombre?.toLowerCase().includes(term) ?? false),
    )
  }, [rawAplicaciones, searchQuery])

  const totalAplicaciones =
    aplicacionesQuery.data?.totalElements ?? rawAplicaciones.length

  function copyActividadCode() {
    if (!actividad) return
    navigator.clipboard.writeText(actividad.codigo)
    setCopiedCode(true)
    toast.success(`Código "${actividad.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function handleOpenAddChecklistItem(app: ActividadAplicacion) {
    setActiveAplicacionForChecklist(app)
    setEditingChecklistItem(null)
    setShowChecklistDialog(true)
  }

  function handleOpenEditChecklistItem(app: ActividadAplicacion, item: ChecklistItem) {
    setActiveAplicacionForChecklist(app)
    setEditingChecklistItem(item)
    setShowChecklistDialog(true)
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(actividad)}
      emptySelectionMessage="Selecciona una actividad de mantenimiento de la lista para ver su detalle y alcance operativo."
      header={
        actividad ? (
          <DetailPanelHeader
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-heading text-sm sm:text-base font-bold text-foreground">
                  {actividad.nombre}
                </span>
                <div className="flex items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5 border border-border/60">
                  <code className="font-mono text-[11px] font-bold text-foreground">
                    {actividad.codigo}
                  </code>
                  <button
                    type="button"
                    onClick={copyActividadCode}
                    className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground cursor-pointer"
                    title="Copiar código de la actividad"
                  >
                    {copiedCode ? (
                      <Check className="size-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-2.5" />
                    )}
                  </button>
                </div>
              </div>
            }
            subtitle={
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge
                  variant="secondary"
                  className="text-[10px] text-muted-foreground font-medium gap-1 px-1.5 py-0 h-5 border border-border/50"
                >
                  <Layers className="size-2.5" />
                  <span>
                    {totalAplicaciones} tipo{totalAplicaciones !== 1 ? "s" : ""}{" "}
                    asociado{totalAplicaciones !== 1 ? "s" : ""}
                  </span>
                </Badge>
              </div>
            }
            action={
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {onEdit && actividad ? (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => onEdit(actividad)}
                    className="gap-1 h-8 text-xs border-border/80"
                  >
                    <Pencil className="size-3" />
                    <span>Editar</span>
                  </Button>
                ) : null}

                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setShowDeleteActividadDialog(true)}
                  className="gap-1 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  title="Eliminar esta actividad"
                >
                  <Trash2 className="size-3" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            }
          />
        ) : null
      }
      footer={
        <>
          {/* Dialog eliminar actividad */}
          <ConfirmDeleteDialog
            open={showDeleteActividadDialog}
            onOpenChange={setShowDeleteActividadDialog}
            title="Eliminar actividad de mantenimiento"
            description={
              actividad
                ? `¿Seguro que deseas eliminar "${actividad.nombre}"? Sus tipos de activos e ítems de checklist asociados también se desvincularán.`
                : "¿Seguro que deseas eliminar esta actividad?"
            }
            isPending={deleteActividadMutation.isPending}
            onConfirm={async () => {
              if (!actividad) return
              await deleteActividadMutation.mutateAsync(actividad.id)
              setShowDeleteActividadDialog(false)
            }}
          />

          {/* Dialog desvincular aplicación */}
          <ConfirmDeleteDialog
            open={Boolean(aplicacionToDelete)}
            onOpenChange={(open) => {
              if (!open) setAplicacionToDelete(null)
            }}
            title="Eliminar asociación de tipo de activo"
            description={
              aplicacionToDelete
                ? `¿Seguro que deseas desvincular "${aplicacionToDelete.tipoActivo?.nombre ?? "el tipo seleccionado"}" de esta actividad? Sus ítems de checklist también serán eliminados.`
                : "¿Seguro que deseas eliminar esta asociación?"
            }
            isPending={deleteAplicacionMutation.isPending}
            onConfirm={async () => {
              if (!aplicacionToDelete) return
              await deleteAplicacionMutation.mutateAsync(aplicacionToDelete.id)
              setAplicacionToDelete(null)
            }}
          />

          {/* Dialog eliminar ítem de checklist */}
          <ConfirmDeleteDialog
            open={Boolean(checklistItemToDelete)}
            onOpenChange={(open) => {
              if (!open) setChecklistItemToDelete(null)
            }}
            title="Eliminar ítem de checklist"
            description={
              checklistItemToDelete
                ? `¿Seguro que deseas eliminar el ítem "${checklistItemToDelete.nombre}"?`
                : "¿Seguro que deseas eliminar este ítem?"
            }
            isPending={deleteChecklistItemMutation.isPending}
            onConfirm={async () => {
              if (!checklistItemToDelete) return
              await deleteChecklistItemMutation.mutateAsync(checklistItemToDelete.id)
              setChecklistItemToDelete(null)
            }}
          />
        </>
      }
    >
      {actividad ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* SECCIÓN 1: Información General */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <FileText className="size-3.5 text-primary" />
              <h3>Información General</h3>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Descripción
              </span>
              {actividad.descripcion ? (
                <p className="text-xs text-foreground leading-relaxed">
                  {actividad.descripcion}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/70 italic">
                  Sin descripción registrada para esta actividad.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="rounded-lg border border-border/70 bg-card p-2.5 space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Código Identificador
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {actividad.codigo}
                </span>
              </div>
              <div className="rounded-lg border border-border/70 bg-card p-2.5 space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Tipos de Activos Asociados
                </span>
                <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary shrink-0" />
                  <span>
                    {totalAplicaciones} tipo{totalAplicaciones !== 1 ? "s" : ""} configurado{totalAplicaciones !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: Alcance y Checklist por Tipo de Activo */}
          <section className="space-y-3 pt-3 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="size-3.5 text-primary" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Alcance Operativo y Checklist
                </h3>
                <Badge variant="secondary" className="text-[10px] font-semibold h-4 px-1.5">
                  {totalAplicaciones}
                </Badge>
              </div>

              {!hidePrimaryAction && (
                <Button
                  size="sm"
                  type="button"
                  onClick={() => setShowAddAplicacionDialog(true)}
                  className="gap-1 h-7 text-xs self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="size-3" />
                  <span>Asociar Tipo de Activo</span>
                </Button>
              )}
            </div>

            {/* Buscador secundario integrado */}
            <div className="max-w-md">
              <SearchField
                value={search}
                onChange={onSearchChange}
                placeholder="Buscar por tipo o componente..."
                aria-label="Buscar tipo de activo asociado"
              />
            </div>

            {/* Lista de aplicaciones y sus checklists */}
            <div className="min-h-[120px] rounded-lg border border-border/70 overflow-hidden bg-card">
              <PaginatedList
                items={aplicaciones}
                page={
                  aplicacionesQuery.data?.totalPages &&
                  aplicacionesQuery.data.totalPages > 1
                    ? aplicacionesQuery.data
                    : undefined
                }
                isLoading={aplicacionesQuery.isLoading}
                isFetching={aplicacionesQuery.isFetching}
                errorMessage={
                  aplicacionesQuery.isError
                    ? getErrorMessage(aplicacionesQuery.error)
                    : null
                }
                hasSearch={search.trim().length > 0}
                onPageChange={onPageChange}
                getKey={(app) => app.id}
                skeletonRowClassName="h-16"
                listClassName="p-2 space-y-2.5"
                empty={{
                  icon: <Layers className="size-4 text-muted-foreground" />,
                  title: search.trim()
                    ? "Sin resultados para la búsqueda"
                    : "Sin tipos de activos asociados",
                  description: search.trim()
                    ? "Prueba con otros términos de búsqueda."
                    : "Asocia al menos un Tipo de Activo para configurar sus pasos de checklist y habilitar esta actividad.",
                  actionLabel: search.trim()
                    ? undefined
                    : "Asociar Tipo de Activo",
                  onAction: search.trim()
                    ? undefined
                    : () => setShowAddAplicacionDialog(true),
                  searchDescription: "Prueba con otros términos de búsqueda.",
                }}
              >
                {(app: ActividadAplicacion) => (
                  <AplicacionItemCard
                    key={app.id}
                    aplicacion={app}
                    onAddChecklistItem={() => handleOpenAddChecklistItem(app)}
                    onEditChecklistItem={(item) =>
                      handleOpenEditChecklistItem(app, item)
                    }
                    onDeleteChecklistItem={(item) =>
                      setChecklistItemToDelete(item)
                    }
                    onDeleteAplicacion={() => setAplicacionToDelete(app)}
                    deleteAplicacionPending={deleteAplicacionMutation.isPending}
                    deleteChecklistItemPending={
                      deleteChecklistItemMutation.isPending
                    }
                  />
                )}
              </PaginatedList>
            </div>
          </section>

          {/* SECCIÓN 3: Auditoría */}
          <section className="pt-3 border-t space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="size-3" />
              <h3>Auditoría y Trazabilidad</h3>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/15 p-2.5 text-xs">
              <AuditInfo data={actividad} />
            </div>
          </section>
        </div>
      ) : null}

      {/* Form Modal de Asociación */}
      <ActividadAplicacionFormDialog
        actividad={actividad}
        open={showAddAplicacionDialog}
        onOpenChange={setShowAddAplicacionDialog}
      />

      {/* Form Modal de Checklist Item */}
      <ChecklistItemFormDialog
        aplicacion={activeAplicacionForChecklist}
        item={editingChecklistItem}
        open={showChecklistDialog}
        onOpenChange={(isOpen) => {
          setShowChecklistDialog(isOpen)
          if (!isOpen) {
            setEditingChecklistItem(null)
            setActiveAplicacionForChecklist(null)
          }
        }}
      />
    </DetailPanelShell>
  )
}

/**
 * Tarjeta individual para una aplicación de tipo de activo con su checklist asociado
 */
type AplicacionItemCardProps = {
  aplicacion: ActividadAplicacion
  onAddChecklistItem: () => void
  onEditChecklistItem: (item: ChecklistItem) => void
  onDeleteChecklistItem: (item: ChecklistItem) => void
  onDeleteAplicacion: () => void
  deleteAplicacionPending?: boolean
  deleteChecklistItemPending?: boolean
}

function AplicacionItemCard({
  aplicacion,
  onAddChecklistItem,
  onEditChecklistItem,
  onDeleteChecklistItem,
  onDeleteAplicacion,
  deleteAplicacionPending,
  deleteChecklistItemPending,
}: AplicacionItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Consulta de ítems de checklist de esta aplicación
  const checklistQuery = useQuery({
    ...checklistItemQueries.byAplicacionList(aplicacion.id),
    enabled: Boolean(aplicacion.id),
  })

  const checklistItems = checklistQuery.data ?? []
  const totalItems = checklistItems.length

  return (
    <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs">
      {/* Header de la Aplicación */}
      <div className="flex items-center justify-between p-2.5 bg-muted/20 border-b border-border/60 gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left cursor-pointer group min-w-0 flex-1"
        >
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          )}
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
            {aplicacion.componente ? (
              <Cpu className="size-3" />
            ) : (
              <Layers className="size-3" />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                {aplicacion.tipoActivo?.nombre ?? "Tipo no disponible"}
              </span>
              {aplicacion.componente ? (
                <Badge
                  variant="secondary"
                  className="text-[9px] font-medium gap-1 px-1 py-0 h-4 border border-border/50"
                >
                  <Cpu className="size-2 text-muted-foreground" />
                  <span>{aplicacion.componente.nombre}</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[9px] text-muted-foreground font-normal px-1 py-0 h-4 border-dashed"
                >
                  Toda la unidad
                </Badge>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-medium px-1.5 py-0 h-5 gap-1",
              totalItems > 0
                ? "text-primary border-primary/30 bg-primary/5"
                : "text-muted-foreground border-border/60"
            )}
          >
            <CheckSquare className="size-2.5" />
            <span>
              {totalItems} ítem{totalItems !== 1 ? "s" : ""}
            </span>
          </Badge>

          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onAddChecklistItem}
            className="h-6 px-1.5 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
            title="Agregar ítem de checklist"
          >
            <Plus className="size-3" />
            <span className="hidden sm:inline">Ítem</span>
          </Button>

          <RowActions
            className="opacity-100"
            deleteLabel="Desvincular tipo de activo"
            deleteDisabled={deleteAplicacionPending}
            onDelete={onDeleteAplicacion}
          />
        </div>
      </div>

      {/* Checklist items desplegable */}
      {isExpanded && (
        <div className="p-2 space-y-1.5 bg-background/50">
          {checklistQuery.isLoading ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              Cargando checklist...
            </div>
          ) : totalItems === 0 ? (
            <div className="flex items-center justify-between p-2 rounded border border-dashed border-border/60 text-xs text-muted-foreground bg-muted/10">
              <span className="text-[11px]">
                Sin pasos de verificación registrados para este tipo.
              </span>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={onAddChecklistItem}
                className="h-6 text-[10px] gap-1 border-border/80"
              >
                <Plus className="size-2.5" />
                <span>Agregar Ítem</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-1.5 px-2 rounded-md border border-border/60 bg-card hover:bg-muted/30 transition-colors gap-2"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground font-mono text-[9px] font-bold border border-border/60 mt-0.5">
                      {item.orden}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-xs text-foreground">
                          {item.nombre}
                        </span>
                        {item.obligatorio ? (
                          <Badge
                            variant="destructive"
                            className="text-[8px] font-medium px-1 py-0 h-3.5 bg-destructive/10 text-destructive border-destructive/20"
                          >
                            Obligatorio
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[8px] text-muted-foreground font-normal px-1 py-0 h-3.5"
                          >
                            Opcional
                          </Badge>
                        )}
                      </div>
                      {item.descripcion && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  <RowActions
                    className="opacity-100 shrink-0"
                    onEdit={() => onEditChecklistItem(item)}
                    editLabel="Editar ítem"
                    deleteLabel="Eliminar ítem"
                    deleteDisabled={deleteChecklistItemPending}
                    onDelete={() => onDeleteChecklistItem(item)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
