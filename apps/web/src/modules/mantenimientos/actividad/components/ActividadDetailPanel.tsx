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
  Info,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { componenteQueries } from "@/modules/activos/componente/api/componente.queries"
import type { Componente } from "@/modules/activos/componente/api/componente.service"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailPanelHeader,
  DetailPanelShell,
  PaginatedList,
} from "@/shared/components/master-detail"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
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

type EnrichedAplicacion = ActividadAplicacion & {
  tipoActivo?: TipoActivo
  componente?: Componente | null
}

type ActividadDetailPanelProps = {
  actividad: ActividadMantenimiento | null
  hidePrimaryAction?: boolean
  onEdit?: (actividad: ActividadMantenimiento) => void
}

export function ActividadDetailPanel({
  actividad,
  hidePrimaryAction = false,
  onEdit,
}: ActividadDetailPanelProps) {
  const [showAddAplicacionDialog, setShowAddAplicacionDialog] = useState(false)
  const [aplicacionToDelete, setAplicacionToDelete] =
    useState<EnrichedAplicacion | null>(null)
  const [showDeleteActividadDialog, setShowDeleteActividadDialog] =
    useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Checklist modal state
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

  // Queries para catálogo de tipos de activo y componentes
  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({ page: 0, size: 1000 }),
  )
  const componentesQuery = useQuery(
    componenteQueries.list({ page: 0, size: 1000 }),
  )

  const tiposActivoMap = useMemo(() => {
    const list = tiposActivoQuery.data?.content ?? []
    return new Map(list.map((t) => [t.id, t]))
  }, [tiposActivoQuery.data])

  const componentesMap = useMemo(() => {
    const list = componentesQuery.data?.content ?? []
    return new Map(list.map((c) => [c.id, c]))
  }, [componentesQuery.data])

  // Consulta de aplicaciones
  const aplicacionesQuery = useQuery({
    ...actividadAplicacionQueries.byActividad(actividad?.id ?? ""),
    enabled: Boolean(actividad?.id),
  })

  const rawAplicaciones = aplicacionesQuery.data?.content ?? []

  const aplicaciones = useMemo<EnrichedAplicacion[]>(() => {
    return rawAplicaciones.map((app) => {
      const tipoId = app.tipoActivo?.id
      const compId = app.componente?.id
      const tipoFromMap = tipoId ? tiposActivoMap.get(tipoId) : undefined
      const compFromMap = compId ? componentesMap.get(compId) : null

      return {
        ...app,
        tipoActivo:
          tipoFromMap ||
          (app.tipoActivo
            ? {
              id: app.tipoActivo.id,
              nombre: app.tipoActivo.nombre,
              categoriaId: "",
              descripcion: null,
              color: null,
              icono: null,
            }
            : undefined),
        componente:
          compFromMap ||
          (app.componente
            ? {
              id: app.componente.id,
              tipoActivoId: app.tipoActivo?.id ?? "",
              nombre: app.componente.nombre,
              codigo: "",
              descripcion: null,
              activo: true,
            }
            : null),
      }
    })
  }, [rawAplicaciones, tiposActivoMap, componentesMap])

  const totalAplicaciones =
    aplicacionesQuery.data?.totalElements ?? rawAplicaciones.length

  const hasAplicacion = totalAplicaciones > 0

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

  function handleOpenEditChecklistItem(
    app: ActividadAplicacion,
    item: ChecklistItem,
  ) {
    setActiveAplicacionForChecklist(app)
    setEditingChecklistItem(item)
    setShowChecklistDialog(true)
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(actividad)}
      emptySelectionMessage="Selecciona una actividad de mantenimiento de la lista para ver su alcance operativo y checklist de verificación."
      header={
        actividad ? (
          <DetailPanelHeader
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                  <Wrench className="size-4" />
                </span>
                <span className="truncate font-heading text-base sm:text-lg font-bold text-foreground">
                  {actividad.nombre}
                </span>
                <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 border border-border/70">
                  <code className="font-mono text-xs font-bold text-foreground">
                    {actividad.codigo}
                  </code>
                  <button
                    type="button"
                    onClick={copyActividadCode}
                    className="inline-flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground cursor-pointer"
                    title="Copiar código de la actividad"
                  >
                    {copiedCode ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>
            }
            subtitle={
              <div className="flex items-center gap-2 pt-0.5">
                <Badge
                  variant={hasAplicacion ? "secondary" : "outline"}
                  className="text-[11px] text-muted-foreground font-medium gap-1 px-2 py-0.5 border border-border/50"
                >
                  <Layers className="size-3 text-primary" />
                  <span>
                    {hasAplicacion
                      ? "1 alcance configurado"
                      : "Sin alcance configurado"}
                  </span>
                </Badge>
              </div>
            }
            action={
              <div className="flex items-center gap-1.5">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => onEdit(actividad)}
                    className="gap-1.5 h-8 text-xs font-medium"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setShowDeleteActividadDialog(true)}
                  className="gap-1.5 h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  title="Eliminar esta actividad"
                >
                  <Trash2 className="size-3.5" />
                  <span>Eliminar</span>
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
                ? `¿Seguro que deseas eliminar "${actividad.nombre}"? Sus tipos de activos asociados e ítems de checklist se eliminarán permanentemente.`
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
            title="Desvincular alcance de la actividad"
            description={
              aplicacionToDelete
                ? `¿Seguro que deseas desvincular el alcance "${aplicacionToDelete.componente?.nombre || aplicacionToDelete.tipoActivo?.nombre || "asignado"}"? Sus pasos de verificación asociados también se eliminarán.`
                : "¿Seguro que deseas eliminar esta asignación?"
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
            title="Eliminar paso de checklist"
            description={
              checklistItemToDelete
                ? `¿Seguro que deseas eliminar el paso "${checklistItemToDelete.nombre}"?`
                : "¿Seguro que deseas eliminar este paso?"
            }
            isPending={deleteChecklistItemMutation.isPending}
            onConfirm={async () => {
              if (!checklistItemToDelete) return
              await deleteChecklistItemMutation.mutateAsync(
                checklistItemToDelete.id,
              )
              setChecklistItemToDelete(null)
            }}
          />
        </>
      }
    >
      {actividad ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Descripción general compacta */}
          {actividad.descripcion && (
            <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-muted/25 px-3.5 py-2.5 text-xs text-foreground/90">
              <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">{actividad.descripcion}</p>
            </div>
          )}

          {/* SECCIÓN: Alcance y Checklist */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Alcance Operativo & Checklist
                </h3>
                <Badge
                  variant={hasAplicacion ? "secondary" : "outline"}
                  className="text-[10px] font-bold h-4 px-1.5"
                >
                  {hasAplicacion ? "1 Asignado" : "0"}
                </Badge>
              </div>

              {!hidePrimaryAction && !hasAplicacion && (
                <Button
                  size="sm"
                  type="button"
                  onClick={() => setShowAddAplicacionDialog(true)}
                  className="gap-1.5 h-8 text-xs font-semibold shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="size-3.5" />
                  <span>Asociar Alcance (Tipo / Componente)</span>
                </Button>
              )}
            </div>

            {/* Lista de aplicaciones */}
            <div className="rounded-lg border border-border/70 overflow-hidden bg-card">
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
                onPageChange={() => {}}
                getKey={(app) => app.id}
                skeletonRowClassName="h-16"
                listClassName="p-2.5 space-y-2.5"
                empty={{
                  icon: <Layers className="size-5 text-muted-foreground" />,
                  title: "Sin alcance configurado",
                  description:
                    "Asocia un Tipo de Activo y opcionalmente un Componente para definir sus pasos de verificación.",
                  actionLabel: "Asociar Alcance",
                  onAction: () => setShowAddAplicacionDialog(true),
                }}
              >
                {(app: EnrichedAplicacion) => (
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
                    deleteAplicacionPending={
                      deleteAplicacionMutation.isPending
                    }
                    deleteChecklistItemPending={
                      deleteChecklistItemMutation.isPending
                    }
                  />
                )}
              </PaginatedList>
            </div>
          </section>

          {/* SECCIÓN: Auditoría compacta */}
          <section className="pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              <FileText className="size-3" />
              <span>Auditoría</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/15 p-2 text-xs">
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
 * Tarjeta individual de alcance con énfasis en Componente / Tipo de Activo
 */
type AplicacionItemCardProps = {
  aplicacion: EnrichedAplicacion
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

  const tipo = aplicacion.tipoActivo
  const componente = aplicacion.componente
  const color = tipo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const TipoIcon = getTipoActivoIcon(tipo?.icono)

  return (
    <div className="rounded-lg border border-border/80 bg-card shadow-2xs overflow-hidden transition-all">
      {/* Header de la Aplicación */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/20 border-b border-border/60 gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 text-left cursor-pointer group min-w-0 flex-1"
        >
          {isExpanded ? (
            <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          )}

          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
            style={{ backgroundColor: componente ? "var(--primary)" : color }}
          >
            {componente ? (
              <Cpu className="size-4" />
            ) : (
              <TipoIcon className="size-3.5" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            {componente ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                  {componente.nombre}
                </span>
                {componente.codigo && (
                  <code className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                    {componente.codigo}
                  </code>
                )}
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium gap-1 px-1.5 py-0 h-4.5 border border-border/60"
                >
                  <Layers className="size-2.5 text-primary" />
                  <span>{tipo?.nombre || "Tipo de Activo"}</span>
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                  {tipo?.nombre || "Tipo de Activo"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground font-normal px-1.5 py-0 h-4.5 border-dashed"
                >
                  Toda la unidad (Sin componente)
                </Badge>
              </div>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold px-2 py-0 h-5 gap-1",
              totalItems > 0
                ? "text-primary border-primary/30 bg-primary/5"
                : "text-muted-foreground border-border/60",
            )}
          >
            <CheckSquare className="size-3" />
            <span>
              {totalItems} paso{totalItems !== 1 ? "s" : ""}
            </span>
          </Badge>

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onAddChecklistItem}
            className="h-7 px-2 text-xs gap-1 text-primary hover:bg-primary/10 border-primary/30 font-medium"
            title="Agregar paso de verificación"
          >
            <Plus className="size-3" />
            <span>Paso</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onDeleteAplicacion}
            disabled={deleteAplicacionPending}
            className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Desvincular este alcance"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Checklist desplegable */}
      {isExpanded && (
        <div className="p-2.5 bg-background/50">
          {checklistQuery.isLoading ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              Cargando checklist...
            </div>
          ) : totalItems === 0 ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border/70 text-xs text-muted-foreground bg-muted/10">
              <span className="text-xs">
                Sin pasos de verificación registrados para este alcance.
              </span>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={onAddChecklistItem}
                className="h-7 text-xs gap-1 border-border/80 font-medium"
              >
                <Plus className="size-3" />
                <span>Agregar Paso</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md border border-border/60 bg-card hover:bg-muted/20 hover:border-border transition-colors gap-2.5"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground font-mono text-[10px] font-bold border border-border/70 mt-0.5">
                      {item.orden}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-foreground">
                          {item.nombre}
                        </span>
                      </div>
                      {item.descripcion && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onEditChecklistItem(item)}
                      className="size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Editar paso"
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onDeleteChecklistItem(item)}
                      disabled={deleteChecklistItemPending}
                      className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Eliminar paso"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
