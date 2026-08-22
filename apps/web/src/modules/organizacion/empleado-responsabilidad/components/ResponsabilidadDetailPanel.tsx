import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Award,
  Calendar,
  Pencil,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react"

import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { Responsabilidad } from "../../responsabilidad/api/responsabilidad.service"
import { useDeleteEmpleadoResponsabilidad } from "../api/empleado-responsabilidad.mutations"
import { empleadoResponsabilidadQueries } from "../api/empleado-responsabilidad.queries"
import type { EmpleadoResponsabilidad } from "../api/empleado-responsabilidad.service"
import { EmpleadoResponsabilidadFormDialog } from "./EmpleadoResponsabilidadFormDialog"

type ResponsabilidadDetailPanelProps = {
  responsabilidad: Responsabilidad | null
  onEditResponsabilidad?: (responsabilidad: Responsabilidad) => void
  onCloseMobileDetail?: () => void
}

function isVigente(fechaInicio: string, fechaFin: string | null): boolean {
  const hoy = new Date().toISOString().split("T")[0]
  if (fechaInicio > hoy) return false
  if (!fechaFin) return true
  return fechaFin >= hoy
}

export function ResponsabilidadDetailPanel({
  responsabilidad,
  onEditResponsabilidad,
  onCloseMobileDetail,
}: ResponsabilidadDetailPanelProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<EmpleadoResponsabilidad | null>(null)
  const [deletingItem, setDeletingItem] =
    useState<EmpleadoResponsabilidad | null>(null)

  const deleteMutation = useDeleteEmpleadoResponsabilidad()

  const asignacionesQuery = useQuery({
    ...empleadoResponsabilidadQueries.list({
      responsabilidadId: responsabilidad?.id,
      size: 100,
      sortBy: "fechaInicio",
      direction: "DESC",
    }),
    enabled: Boolean(responsabilidad?.id),
  })

  const asignaciones = asignacionesQuery.data?.content ?? []

  function openCreate() {
    setEditingItem(null)
    setFormOpen(true)
  }

  function openEdit(item: EmpleadoResponsabilidad) {
    setEditingItem(item)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingItem) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Handled by toast
    }
  }

  if (!responsabilidad) {
    return (
      <div className="flex h-full min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground shadow-2xs">
          <Award className="size-7 opacity-70" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Ninguna responsabilidad seleccionada
        </h3>
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
          Selecciona una responsabilidad del catálogo en el panel izquierdo para visualizar sus datos y administrar los empleados asignados.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
      {/* Encabezado del Detalle Maestro */}
      <div className="border-b border-border/80 bg-muted/20 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
              <Award className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {responsabilidad.nombre}
                </h2>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                  {responsabilidad.codigo}
                </code>
              </div>
              {responsabilidad.descripcion ? (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {responsabilidad.descripcion}
                </p>
              ) : (
                <p className="mt-1 text-xs italic text-muted-foreground/60">
                  Sin descripción registrada
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onCloseMobileDetail && (
              <Button
                variant="outline"
                size="xs"
                onClick={onCloseMobileDetail}
                className="md:hidden"
              >
                Volver
              </Button>
            )}
            {onEditResponsabilidad && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onEditResponsabilidad(responsabilidad)}
                className="gap-1"
              >
                <Pencil className="size-3" />
                <span className="hidden sm:inline">Editar Datos</span>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <AuditInfo data={responsabilidad} compact />
        </div>
      </div>

      {/* Barra de Herramientas de Empleados Asignados */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <span className="text-xs font-medium text-foreground">
            Empleados Asignados
          </span>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
            {asignaciones.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton
            size="xs"
            onRefresh={() => asignacionesQuery.refetch()}
            isRefreshing={asignacionesQuery.isFetching}
          />
          <Button size="xs" onClick={openCreate} className="gap-1 shadow-2xs">
            <Plus className="size-3.5" />
            <span>Asignar Empleado</span>
          </Button>
        </div>
      </div>

      {/* Lista de Empleados Asignados */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {asignacionesQuery.isLoading ? (
          <ListSkeleton rows={4} rowClassName="h-16 rounded-xl" />
        ) : asignacionesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(asignacionesQuery.error)}
            className="text-destructive py-6"
          />
        ) : asignaciones.length === 0 ? (
          <EmptyState
            icon={<Users className="size-4 text-muted-foreground" />}
            title="Sin empleados asignados"
            description={`Actualmente no hay colaboradores con la responsabilidad "${responsabilidad.nombre}".`}
            action={
              <Button size="sm" onClick={openCreate} className="gap-1.5">
                <Plus className="size-4" />
                Asignar Primer Empleado
              </Button>
            }
            className="py-8"
          />
        ) : (
          <ul className="space-y-2.5">
            {asignaciones.map((item) => {
              const empleadoNombre =
                item.empleadoInfo?.nombreCompleto ||
                `Empleado (${item.empleadoId})`
              const empleadoCodigo = item.empleadoInfo?.codigo
              const activa = isVigente(item.fechaInicio, item.fechaFin)

              return (
                <li
                  key={item.id}
                  className="group flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs sm:p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <User className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                          {empleadoNombre}
                        </span>
                        {empleadoCodigo ? (
                          <code className="text-[10px] text-muted-foreground font-mono">
                            {empleadoCodigo}
                          </code>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(item)}
                        className="size-7 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Editar periodo</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeletingItem(item)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Eliminar asignación</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="size-3.5 text-muted-foreground/70" />
                      <span>
                        {item.fechaInicio}
                        {item.fechaFin
                          ? ` al ${item.fechaFin}`
                          : " (Indefinido / Vigente)"}
                      </span>
                    </div>

                    <Badge
                      variant={activa ? "default" : "outline"}
                      className={cn(
                        "text-[10px] py-0 px-2 font-normal",
                        activa
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "text-muted-foreground border-border",
                      )}
                    >
                      {activa ? "Vigente" : "Finalizado"}
                    </Badge>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <EmpleadoResponsabilidadFormDialog
        key={editingItem?.id ?? `new-asignacion-${responsabilidad.id}`}
        responsabilidadId={responsabilidad.id}
        responsabilidadNombre={responsabilidad.nombre}
        open={formOpen}
        onOpenChange={setFormOpen}
        asignacion={editingItem}
        onSuccess={() => {
          asignacionesQuery.refetch()
        }}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null)
        }}
        title="Eliminar asignación de empleado"
        description="¿Seguro que deseas remover a este empleado de la responsabilidad?"
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
