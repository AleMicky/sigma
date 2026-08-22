import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  Plus,
  Users,
} from "lucide-react"

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
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useClampPage } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import type { Responsabilidad } from "../../responsabilidad/api/responsabilidad.service"
import { useDeleteEmpleadoResponsabilidad } from "../api/empleado-responsabilidad.mutations"
import { empleadoResponsabilidadQueries } from "../api/empleado-responsabilidad.queries"
import type { EmpleadoResponsabilidad } from "../api/empleado-responsabilidad.service"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type ResponsabilidadDetailPanelProps = {
  responsabilidad: Responsabilidad | null
  itemPage: number
  search: string
  searchQuery: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onAssignEmpleado: () => void
  onEditAsignacion: (asignacion: EmpleadoResponsabilidad) => void
}

function isVigente(fechaInicio: string, fechaFin: string | null): boolean {
  const hoy = new Date().toISOString().split("T")[0]
  if (fechaInicio > hoy) return false
  if (!fechaFin) return true
  return fechaFin >= hoy
}

function getInitials(name: string): string {
  if (!name) return "EM"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function ResponsabilidadDetailPanel({
  responsabilidad,
  itemPage,
  search,
  searchQuery,
  hidePrimaryAction = false,
  onSearchChange,
  onPageChange,
  onAssignEmpleado,
  onEditAsignacion,
}: ResponsabilidadDetailPanelProps) {
  const [deletingItem, setDeletingItem] =
    useState<EmpleadoResponsabilidad | null>(null)

  const deleteMutation = useDeleteEmpleadoResponsabilidad()

  const asignacionesQuery = useQuery({
    ...empleadoResponsabilidadQueries.list({
      responsabilidadId: responsabilidad?.id,
      page: itemPage,
      size: PAGE_SIZE,
      sortBy: "fechaInicio",
      direction: "DESC",
      ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
    }),
    enabled: Boolean(responsabilidad?.id),
  })

  useClampPage(itemPage, onPageChange, asignacionesQuery.data?.totalPages)

  const asignaciones = asignacionesQuery.data?.content ?? []
  const totalElements =
    asignacionesQuery.data?.totalElements ?? asignaciones.length

  async function handleDelete() {
    if (!deletingItem) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
      asignacionesQuery.refetch()
    } catch {
      // Handled by toast
    }
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(responsabilidad)}
      emptySelectionMessage="Selecciona una responsabilidad organizacional de la lista para gestionar sus colaboradores asignados."
      header={
        responsabilidad ? (
          <DetailPanelHeader
            title={
              <div className="flex items-center gap-2">
                <span className="truncate">{responsabilidad.nombre}</span>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <Users className="size-3 text-muted-foreground" />
                  {totalElements}{" "}
                  {totalElements === 1 ? "asignado" : "asignados"}
                </Badge>
              </div>
            }
            subtitle={
              <div className="flex items-center gap-2 pt-0.5">
                <code className="w-fit max-w-full truncate rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {responsabilidad.codigo}
                </code>
              </div>
            }
            meta={<AuditInfo data={responsabilidad} />}
            action={
              !hidePrimaryAction ? (
                <Button
                  size="sm"
                  type="button"
                  className="w-full shrink-0 sm:w-auto gap-1 shadow-2xs"
                  onClick={onAssignEmpleado}
                >
                  <Plus className="size-3.5" />
                  <span>Asignar empleado</span>
                </Button>
              ) : null
            }
            search={{
              value: search,
              onChange: onSearchChange,
              placeholder: "Buscar colaborador asignado…",
              "aria-label": "Buscar colaboradores asignados",
            }}
          />
        ) : null
      }
      footer={
        <ConfirmDeleteDialog
          open={Boolean(deletingItem)}
          onOpenChange={(open) => {
            if (!open) setDeletingItem(null)
          }}
          title="Eliminar asignación de empleado"
          description="¿Seguro que deseas remover a este empleado de la responsabilidad organizacional?"
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
        />
      }
    >
      <PaginatedList
        items={asignaciones}
        page={asignacionesQuery.data}
        isLoading={asignacionesQuery.isLoading}
        isFetching={asignacionesQuery.isFetching}
        errorMessage={
          asignacionesQuery.isError
            ? getErrorMessage(asignacionesQuery.error)
            : null
        }
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(item) => item.id}
        skeletonRowClassName="h-14"
        listClassName="sm:p-3 space-y-2"
        empty={{
          icon: <Users className="size-5 text-muted-foreground" />,
          title: "Sin colaboradores asignados",
          description: `Actualmente no hay ningún colaborador con la responsabilidad "${responsabilidad?.nombre}".`,
          actionLabel: "Asignar empleado",
          onAction: onAssignEmpleado,
          searchDescription: "Prueba con otro nombre o código de búsqueda.",
        }}
      >
        {(item) => {
          const empleadoNombre =
            item.empleadoInfo?.nombreCompleto ||
            `Empleado (${item.empleadoId})`
          const empleadoCodigo = item.empleadoInfo?.codigo
          const activa = isVigente(item.fechaInicio, item.fechaFin)
          const initials = getInitials(empleadoNombre)

          return (
            <DetailListItem
              leading={
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs border shadow-2xs",
                    activa
                      ? "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {initials}
                </div>
              }
              title={
                <div className="flex items-center gap-2 min-w-0">
                  {empleadoCodigo ? (
                    <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {empleadoCodigo}
                    </code>
                  ) : null}
                  <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {empleadoNombre}
                  </span>
                </div>
              }
              subtitle={
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground pt-0.5">
                  <div className="flex items-center gap-1 font-medium text-muted-foreground">
                    <Calendar className="size-3 text-primary shrink-0" />
                    <span>
                      {item.fechaInicio}
                      {item.fechaFin
                        ? ` al ${item.fechaFin}`
                        : " (Indefinido / Vigente)"}
                    </span>
                  </div>

                  <span className="text-muted-foreground/40 font-bold">•</span>

                  <Badge
                    variant={activa ? "default" : "outline"}
                    className={cn(
                      "text-[10px] py-0 px-1.5 font-normal shrink-0",
                      activa
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : "text-muted-foreground border-border bg-muted/40",
                    )}
                  >
                    {activa ? "Vigente" : "Finalizado"}
                  </Badge>
                </div>
              }
              meta={<AuditInfo data={item} compact />}
              actions={
                <RowActions
                  editLabel="Editar asignación"
                  deleteLabel="Eliminar asignación"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEditAsignacion(item)}
                  onDelete={() => setDeletingItem(item)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </DetailPanelShell>
  )
}
