import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  FileText,
  Layers,
  MoreHorizontal,
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
import { TipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
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
  onEdit?: (actividad: ActividadMantenimiento) => void
  onPrev?: () => void
  onNext?: () => void
  onBack?: () => void
}

export function ActividadDetailPanel({
  actividad,
  onEdit,
  onPrev,
  onNext,
  onBack,
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

  if (!actividad) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background/50">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground mb-3 shadow-2xs">
          <Wrench className="size-6" />
        </div>
        <h3 className="font-semibold text-sm text-foreground">
          Ninguna actividad seleccionada
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Selecciona una actividad del catálogo izquierdo para ver su alcance operativo y checklist de verificación.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background overflow-y-auto">
      {/* 1. Breadcrumbs & Top Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-4 py-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {onBack && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onBack}
              className="size-6.5 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
          )}
          <span className="hover:text-foreground transition-colors cursor-pointer text-xs">
            Actividades
          </span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground truncate max-w-[240px] text-xs">
            {actividad.nombre}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {onPrev && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onPrev}
              className="size-6.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Actividad anterior"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
          )}
          {onNext && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onNext}
              className="size-6.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Siguiente actividad"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(actividad)}
              className="size-6.5 rounded-lg text-muted-foreground hover:text-foreground ml-0.5 cursor-pointer"
              title="Editar actividad"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-4.5 w-full max-w-5xl">
        {/* Header Block with Icon + Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {/* Top Icon Badge */}
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-2xs">
              <Wrench className="size-4" />
            </div>

            {/* Supertitle */}
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                PROCEDIMIENTO DE MANTENIMIENTO
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {actividad.nombre}
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {actividad.descripcion ||
                "Procedimiento estandarizado para la ejecución de tareas de mantenimiento preventivo y correctivo de unidades vehiculares y componentes."}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(actividad)}
                className="gap-1.5 rounded-lg border-border/80 text-xs font-semibold px-2.5 py-1 h-7.5 hover:bg-muted shadow-2xs cursor-pointer"
              >
                <Pencil className="size-3" />
                Editar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteActividadDialog(true)}
              className="gap-1.5 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold px-2.5 py-1 h-7.5 shadow-2xs cursor-pointer"
              title="Eliminar actividad"
            >
              <Trash2 className="size-3" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* 3. Metadata Grid Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl border border-border/60 bg-muted/15 p-0.5 divide-y sm:divide-y-0 sm:divide-x divide-border/50 shadow-2xs">
          {/* Código Identificador */}
          <div className="flex flex-col gap-1 p-2.5">
            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              CÓDIGO IDENTIFICADOR
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 border border-border/70">
                <code className="font-mono text-xs font-bold text-foreground">
                  {actividad.codigo}
                </code>
                <button
                  type="button"
                  onClick={copyActividadCode}
                  className="inline-flex size-3.5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                  title="Copiar código"
                >
                  {copiedCode ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                {copiedCode ? "Copiado!" : "Referencia"}
              </span>
            </div>
          </div>

          {/* Alcance Operativo */}
          <div className="flex flex-col gap-1 p-2.5">
            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              ALCANCE CONFIGURADO
            </span>
            <div className="flex items-center gap-2 h-6">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  hasAplicacion ? "bg-emerald-500" : "bg-zinc-400",
                )}
              />
              <span className="text-xs font-semibold text-foreground">
                {hasAplicacion
                  ? `${totalAplicaciones} ${totalAplicaciones === 1 ? "Alcance asignado" : "Alcances asignados"}`
                  : "Sin alcance configurado"}
              </span>
            </div>
          </div>

          {/* Estado de Checklist */}
          <div className="flex flex-col gap-1 p-2.5">
            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              ESTADO DEL PROCEDIMIENTO
            </span>
            <div className="flex items-center gap-2 h-6">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                Activo / Estandarizado
              </span>
            </div>
          </div>
        </div>

        {/* 4. SECCIÓN: Alcance Operativo & Checklist */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="size-3.5 text-blue-500" />
              <h3 className="text-xs font-bold tracking-tight text-foreground uppercase">
                Alcance Operativo & Checklist
              </h3>
              <Badge
                variant={hasAplicacion ? "secondary" : "outline"}
                className="text-[9.5px] font-bold h-4.5 px-1.5 ml-0.5"
              >
                {hasAplicacion ? `${totalAplicaciones} Asignado` : "0"}
              </Badge>
            </div>

            {!hasAplicacion && (
              <Button
                size="sm"
                onClick={() => setShowAddAplicacionDialog(true)}
                className="gap-1.5 text-xs font-semibold h-7.5 rounded-lg shadow-2xs cursor-pointer px-2.5"
              >
                <Plus className="size-3" />
                Asociar Alcance
              </Button>
            )}
          </div>

          {/* Lista de Aplicaciones / Alcances */}
          {aplicacionesQuery.isLoading ? (
            <div className="rounded-xl border border-border/60 p-6 text-center text-xs text-muted-foreground bg-card">
              Cargando alcance operativo...
            </div>
          ) : aplicacionesQuery.isError ? (
            <div className="rounded-xl border border-destructive/40 p-4 text-center text-xs text-destructive bg-destructive/5">
              {getErrorMessage(aplicacionesQuery.error)}
            </div>
          ) : !hasAplicacion ? (
            <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Layers className="size-4" />
              </div>
              <div className="space-y-0.5 max-w-sm">
                <p className="text-xs font-bold text-foreground">
                  Sin alcance operativo configurado
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Asocia un Tipo de Activo y opcionalmente un Componente para definir sus pasos de verificación.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddAplicacionDialog(true)}
                className="gap-1 text-xs font-semibold h-7 rounded-lg shadow-2xs cursor-pointer px-2.5 mt-1"
              >
                <Plus className="size-3" />
                Asociar Alcance
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {aplicaciones.map((app) => (
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
                  deleteChecklistItemPending={deleteChecklistItemMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* 5. SECCIÓN: Auditoría */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wider">
            <FileText className="size-3" />
            <span>Auditoría y Trazabilidad</span>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/15 p-2.5 text-xs">
            <AuditInfo data={actividad} />
          </div>
        </div>
      </div>

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
      {aplicacionToDelete && (
        <ConfirmDeleteDialog
          open={Boolean(aplicacionToDelete)}
          onOpenChange={(open) => {
            if (!open) setAplicacionToDelete(null)
          }}
          title="Desvincular alcance de la actividad"
          description={`¿Seguro que deseas desvincular el alcance "${aplicacionToDelete.componente?.nombre || aplicacionToDelete.tipoActivo?.nombre || "asignado"}"? Sus pasos de verificación asociados también se eliminarán.`}
          isPending={deleteAplicacionMutation.isPending}
          onConfirm={async () => {
            if (!aplicacionToDelete) return
            await deleteAplicacionMutation.mutateAsync(aplicacionToDelete.id)
            setAplicacionToDelete(null)
          }}
        />
      )}

      {/* Dialog eliminar ítem de checklist */}
      {checklistItemToDelete && (
        <ConfirmDeleteDialog
          open={Boolean(checklistItemToDelete)}
          onOpenChange={(open) => {
            if (!open) setChecklistItemToDelete(null)
          }}
          title="Eliminar paso de checklist"
          description={`¿Seguro que deseas eliminar el paso "${checklistItemToDelete.nombre}"?`}
          isPending={deleteChecklistItemMutation.isPending}
          onConfirm={async () => {
            if (!checklistItemToDelete) return
            await deleteChecklistItemMutation.mutateAsync(
              checklistItemToDelete.id,
            )
            setChecklistItemToDelete(null)
          }}
        />
      )}

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
    </div>
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

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 shadow-2xs overflow-hidden transition-all hover:border-border">
      {/* Header de la Aplicación */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border/50 gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 text-left cursor-pointer group min-w-0 flex-1"
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-transform" />
          )}

          <div
            className="flex size-7.5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs transition-transform group-hover:scale-105"
            style={{ backgroundColor: componente ? "var(--primary)" : color }}
          >
            {componente ? (
              <Cpu className="size-3.5" />
            ) : (
              <TipoActivoIcon name={tipo?.icono} className="size-3.5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {componente ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {componente.nombre}
                </span>
                {componente.codigo && (
                  <code className="text-[9.5px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
                    {componente.codigo}
                  </code>
                )}
                <Badge
                  variant="secondary"
                  className="text-[9.5px] font-medium gap-1 px-1.5 py-0 h-4 border border-border/60"
                >
                  <Layers className="size-2.5 text-primary" />
                  <span>{tipo?.nombre || "Tipo de Activo"}</span>
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {tipo?.nombre || "Tipo de Activo"}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9.5px] text-muted-foreground font-normal px-1.5 py-0 h-4 border-dashed"
                >
                  Toda la unidad
                </Badge>
              </div>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-[9.5px] font-semibold px-1.5 py-0 h-4.5 gap-1",
              totalItems > 0
                ? "text-primary border-primary/30 bg-primary/5"
                : "text-muted-foreground border-border/60",
            )}
          >
            <CheckSquare className="size-2.5" />
            <span>
              {totalItems} paso{totalItems !== 1 ? "s" : ""}
            </span>
          </Badge>

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onAddChecklistItem}
            className="h-6 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10 border-primary/30 font-medium rounded-lg shadow-2xs cursor-pointer"
            title="Agregar paso de verificación"
          >
            <Plus className="size-2.5" />
            <span>Paso</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onDeleteAplicacion}
            disabled={deleteAplicacionPending}
            className="size-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
            title="Desvincular este alcance"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* Checklist desplegable */}
      {isExpanded && (
        <div className="p-2 bg-muted/5">
          {checklistQuery.isLoading ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Cargando pasos de verificación...
            </div>
          ) : totalItems === 0 ? (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-border/70 text-xs text-muted-foreground bg-muted/10">
              <span className="text-[11px]">
                Sin pasos de verificación registrados.
              </span>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={onAddChecklistItem}
                className="h-6 text-[11px] gap-1 border-border/80 font-medium rounded-lg cursor-pointer px-2"
              >
                <Plus className="size-2.5" />
                <span>Agregar Paso</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card/80 hover:bg-muted/30 hover:border-border/80 transition-all gap-2 shadow-2xs group"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <span className="flex size-4.5 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground font-mono text-[9px] font-bold border border-border/70 mt-0.5">
                      {item.orden}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-foreground">
                          {item.nombre}
                        </span>
                      </div>
                      {item.descripcion && (
                        <p className="text-[10.5px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onEditChecklistItem(item)}
                      className="size-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                      title="Editar paso"
                    >
                      <Pencil className="size-2.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onDeleteChecklistItem(item)}
                      disabled={deleteChecklistItemPending}
                      className="size-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                      title="Eliminar paso"
                    >
                      <Trash2 className="size-2.5" />
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
