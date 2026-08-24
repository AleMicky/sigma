import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  CheckSquare,
  Copy,
  Globe2,
  Layers,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  DetailPanelHeader,
  DetailPanelShell,
} from "@/shared/components/master-detail"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { SearchField } from "@/shared/components/search-field"

import { useDeleteActividadAplicacion } from "../api/actividad-aplicacion.mutations"
import { actividadAplicacionQueries } from "../api/actividad-aplicacion.queries"
import type { ActividadAplicacion } from "../api/actividad-aplicacion.service"
import type { ActividadMantenimiento } from "../api/actividad.service"
import { ActividadAplicacionFormDialog } from "./ActividadAplicacionFormDialog"

type ActividadDetailPanelProps = {
  actividad: ActividadMantenimiento | null
  search: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
}

export function ActividadDetailPanel({
  actividad,
  search,
  hidePrimaryAction = false,
  onSearchChange,
}: ActividadDetailPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [aplicacionToDelete, setAplicacionToDelete] =
    useState<ActividadAplicacion | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const deleteMutation = useDeleteActividadAplicacion()

  const aplicacionesQuery = useQuery({
    ...actividadAplicacionQueries.byActividad(actividad?.id ?? ""),
    enabled: Boolean(actividad?.id),
  })

  const rawAplicaciones = aplicacionesQuery.data?.content ?? []

  const filteredAplicaciones = useMemo(() => {
    if (!search.trim()) return rawAplicaciones
    const term = search.toLowerCase()
    return rawAplicaciones.filter(
      (a) =>
        a.tipoActivo?.nombre.toLowerCase().includes(term) ||
        a.componente?.nombre.toLowerCase().includes(term),
    )
  }, [rawAplicaciones, search])

  const totalAplicaciones = rawAplicaciones.length

  function copyActividadCode() {
    if (!actividad) return
    navigator.clipboard.writeText(actividad.codigo)
    setCopiedCode(true)
    toast.success(`Código de actividad "${actividad.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(actividad)}
      emptySelectionMessage="Selecciona una actividad de mantenimiento de la lista para ver su alcance y tipos de activos asociados."
      header={
        actividad ? (
          <DetailPanelHeader
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate">{actividad.nombre}</span>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <Layers className="size-3 text-muted-foreground" />
                  {totalAplicaciones}{" "}
                  {totalAplicaciones === 1
                    ? "tipo asociado"
                    : "tipos asociados"}
                </Badge>
              </div>
            }
            subtitle={
              <div className="flex flex-col gap-2 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="w-fit max-w-full truncate rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                    {actividad.codigo}
                  </code>
                  <button
                    type="button"
                    onClick={copyActividadCode}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                    title="Copiar código de la actividad"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-emerald-500">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copiar código</span>
                      </>
                    )}
                  </button>

                  {actividad.aplicaTodosTiposActivo ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium gap-1 px-2 py-0.5"
                    >
                      <Globe2 className="size-3" />
                      <span>Aplica a Todos los Activos</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[11px] text-muted-foreground gap-1 px-2 py-0.5"
                    >
                      <Layers className="size-3" />
                      <span>Por Tipo de Activo</span>
                    </Badge>
                  )}

                  {actividad.requiereChecklist && (
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-medium gap-1 px-2 py-0.5"
                    >
                      <CheckSquare className="size-3" />
                      <span>Checklist Requerido</span>
                    </Badge>
                  )}
                </div>

                {actividad.descripcion ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {actividad.descripcion}
                  </p>
                ) : null}
              </div>
            }
            meta={
              <div className="border-t pt-2 text-xs text-muted-foreground">
                <AuditInfo data={actividad} />
              </div>
            }
          />
        ) : null
      }
      footer={
        <ConfirmDeleteDialog
          open={Boolean(aplicacionToDelete)}
          onOpenChange={(open) => {
            if (!open) setAplicacionToDelete(null)
          }}
          title="Eliminar asociación de tipo de activo"
          description={
            aplicacionToDelete
              ? `¿Seguro que deseas desvincular el tipo de activo "${aplicacionToDelete.tipoActivo.nombre}" de esta actividad?`
              : "¿Seguro que deseas eliminar esta asociación?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!aplicacionToDelete) return
            await deleteMutation.mutateAsync(aplicacionToDelete.id)
            setAplicacionToDelete(null)
          }}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {/* Banner informativo si es global */}
        {actividad?.aplicaTodosTiposActivo ? (
          <div className="shrink-0 border-b bg-emerald-500/5 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Globe2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Actividad Global:</strong> Aplica a todos los tipos de activos automáticamente. Puedes asociar tipos específicos aquí si deseas definir componentes particulares.
            </span>
          </div>
        ) : null}

        {/* Toolbar de búsqueda y acción */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 bg-muted/10">
          <div className="min-w-0 flex-1 max-w-sm">
            <SearchField
              value={search}
              onChange={onSearchChange}
              placeholder="Buscar por tipo de activo o componente…"
              aria-label="Buscar tipo de activo asociado"
              className="h-8 text-xs"
            />
          </div>

          {!hidePrimaryAction ? (
            <Button
              size="sm"
              type="button"
              onClick={() => setShowAddDialog(true)}
              className="shrink-0 gap-1 text-xs h-8 shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Asociar Tipo de Activo</span>
            </Button>
          ) : null}
        </div>

        {/* Contenido de la lista de aplicaciones */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          {aplicacionesQuery.isLoading ? (
            <ListSkeleton rows={3} rowClassName="h-14 rounded-xl" />
          ) : aplicacionesQuery.isError ? (
            <EmptyState
              title={getErrorMessage(aplicacionesQuery.error)}
              className="text-destructive"
            />
          ) : filteredAplicaciones.length === 0 ? (
            <EmptyState
              icon={<Layers className="size-8 text-muted-foreground/60" />}
              title={
                search.trim()
                  ? "Sin tipos coincidentes con la búsqueda"
                  : "Sin tipos de activos asociados"
              }
              description={
                search.trim()
                  ? "Prueba con otros términos de búsqueda."
                  : actividad?.aplicaTodosTiposActivo
                    ? "Esta actividad está activa para todos los activos. Asocia tipos de activos específicos si requieres delimitar componentes."
                    : "Asocia al menos un Tipo de Activo para habilitar esta actividad en los planes y órdenes de trabajo."
              }
              action={
                search.trim() ? undefined : (
                  <Button
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                    className="gap-1.5"
                  >
                    <Plus className="size-4" />
                    Asociar Primer Tipo de Activo
                  </Button>
                )
              }
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <div className="flex flex-col gap-2.5">
                {filteredAplicaciones.map((app) => (
                  <div
                    key={app.id}
                    className="group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs hover:border-primary/40 hover:bg-muted/10 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                        <Layers className="size-4" />
                      </span>

                      <div className="flex flex-col min-w-0 flex-1 gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            {app.tipoActivo.nombre}
                          </span>

                          {app.componente ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium gap-1 px-1.5 py-0"
                            >
                              <span>Comp: {app.componente.nombre}</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground font-normal px-1.5 py-0"
                            >
                              Toda la unidad
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => setAplicacionToDelete(app)}
                      title="Eliminar asociación"
                      className="size-7 opacity-80 hover:opacity-100 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal de Asociación */}
      <ActividadAplicacionFormDialog
        actividad={actividad}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </DetailPanelShell>
  )
}
