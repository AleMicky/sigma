import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  Copy,
  Cpu,
  FileText,
  Globe2,
  Info,
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
  DetailListItem,
  DetailPanelHeader,
  DetailPanelShell,
  PaginatedList,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useClampPage } from "@/shared/hooks/use-paginated-search"

import { useDeleteActividad } from "../api/actividad.mutations"
import { useDeleteActividadAplicacion } from "../api/actividad-aplicacion.mutations"
import { actividadAplicacionQueries } from "../api/actividad-aplicacion.queries"
import type { ActividadAplicacion } from "../api/actividad-aplicacion.service"
import type { ActividadMantenimiento } from "../api/actividad.service"
import { ActividadAplicacionFormDialog } from "./ActividadAplicacionFormDialog"

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
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [aplicacionToDelete, setAplicacionToDelete] =
    useState<ActividadAplicacion | null>(null)
  const [showDeleteActividadDialog, setShowDeleteActividadDialog] =
    useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const deleteActividadMutation = useDeleteActividad()
  const deleteAplicacionMutation = useDeleteActividadAplicacion()

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

  const totalElements =
    aplicacionesQuery.data?.totalElements ?? rawAplicaciones.length

  function copyActividadCode() {
    if (!actividad) return
    navigator.clipboard.writeText(actividad.codigo)
    setCopiedCode(true)
    toast.success(
      `Código "${actividad.codigo}" copiado al portapapeles`,
    )
    setTimeout(() => setCopiedCode(false), 2000)
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
                {actividad.aplicaTodosTiposActivo ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium gap-1 px-1.5 py-0 h-5"
                  >
                    <Globe2 className="size-2.5" />
                    <span>Global (Todos los activos)</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-[10px] text-muted-foreground font-medium gap-1 px-1.5 py-0 h-5 border border-border/50"
                  >
                    <Layers className="size-2.5" />
                    <span>Por tipo de activo</span>
                  </Badge>
                )}
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
                ? `¿Seguro que deseas eliminar "${actividad.nombre}"? Sus tipos de activos asociados también se desvincularán.`
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
                ? `¿Seguro que deseas desvincular "${aplicacionToDelete.tipoActivo?.nombre ?? "el tipo seleccionado"}" de esta actividad?`
                : "¿Seguro que deseas eliminar esta asociación?"
            }
            isPending={deleteAplicacionMutation.isPending}
            onConfirm={async () => {
              if (!aplicacionToDelete) return
              await deleteAplicacionMutation.mutateAsync(aplicacionToDelete.id)
              setAplicacionToDelete(null)
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
                  Alcance Operativo
                </span>
                <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  {actividad.aplicaTodosTiposActivo ? (
                    <>
                      <Globe2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Global (Aplica a todos los activos)</span>
                    </>
                  ) : (
                    <>
                      <Layers className="size-3.5 text-muted-foreground shrink-0" />
                      <span>Por tipo de activo específico</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: Tipos de Activo Asociados */}
          <section className="space-y-3 pt-3 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="size-3.5 text-primary" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Tipos de Activo Asociados
                </h3>
                <Badge variant="secondary" className="text-[10px] font-semibold h-4 px-1.5">
                  {totalElements}
                </Badge>
              </div>

              {!hidePrimaryAction && (
                <Button
                  size="sm"
                  type="button"
                  onClick={() => setShowAddDialog(true)}
                  className="gap-1 h-7 text-xs self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="size-3" />
                  <span>Asociar Tipo</span>
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

            {/* Banner explicativo sutil si es global */}
            {actividad.aplicaTodosTiposActivo && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <Globe2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-tight">
                  <strong>Actividad Global:</strong> Esta actividad aplica a todos los tipos de activo. Los registros listados abajo definen subcomponentes particulares.
                </span>
              </div>
            )}

            {/* Lista de asociaciones */}
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
                skeletonRowClassName="h-11"
                listClassName="p-2 space-y-1.5"
                empty={{
                  icon: <Layers className="size-4 text-muted-foreground" />,
                  title: search.trim()
                    ? "Sin resultados para la búsqueda"
                    : "Sin tipos de activos asociados",
                  description: search.trim()
                    ? "Prueba con otros términos de búsqueda."
                    : actividad.aplicaTodosTiposActivo
                      ? "Aplica universalmente. Asocia tipos si requieres delimitar componentes específicos."
                      : "Asocia al menos un Tipo de Activo para habilitar esta actividad en los planes y órdenes.",
                  actionLabel: search.trim()
                    ? undefined
                    : "Asociar Tipo de Activo",
                  onAction: search.trim()
                    ? undefined
                    : () => setShowAddDialog(true),
                  searchDescription: "Prueba con otros términos de búsqueda.",
                }}
              >
                {(app: ActividadAplicacion) => (
                  <DetailListItem
                    key={app.id}
                    leading={
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                        {app.componente ? (
                          <Cpu className="size-3" />
                        ) : (
                          <Layers className="size-3" />
                        )}
                      </span>
                    }
                    title={
                      <span className="font-medium text-xs text-foreground">
                        {app.tipoActivo?.nombre ?? "Tipo no disponible"}
                      </span>
                    }
                    subtitle={
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {app.componente ? (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-medium gap-1 px-1 py-0 h-4 border border-border/50"
                          >
                            <Cpu className="size-2 text-muted-foreground" />
                            <span>{app.componente.nombre}</span>
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
                    }
                    meta={<AuditInfo data={app} compact />}
                    actions={
                      <RowActions
                        className="opacity-100 md:opacity-100"
                        deleteLabel="Desvincular tipo de activo"
                        deleteDisabled={deleteAplicacionMutation.isPending}
                        onDelete={() => setAplicacionToDelete(app)}
                      />
                    }
                  />
                )}
              </PaginatedList>
            </div>
          </section>

          {/* SECCIÓN 3: Auditoría */}
          <section className="pt-3 border-t space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Info className="size-3" />
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
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </DetailPanelShell>
  )
}
