import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  ListOrdered,
  Plus,
  ShieldCheck,
  UserCheck,
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

import type { GrupoAprobador } from "../../grupo-aprobador/api/grupo-aprobador.service"
import { useDeleteGrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.mutations"
import { grupoAprobadorDetalleQueries } from "../api/grupo-aprobador-detalle.queries"
import type { GrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.service"
import type { TipoAprobador } from "../schemas/grupo-aprobador-detalle.schema"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type GrupoAprobadorDetailPanelProps = {
  grupo: GrupoAprobador | null
  itemPage: number
  search: string
  searchQuery: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onAddAprobador: () => void
  onEditAprobador: (detalle: GrupoAprobadorDetalle) => void
}

function getTipoIcon(tipo: TipoAprobador) {
  switch (tipo) {
    case "EMPLEADO":
      return <UserCheck className="size-3.5 text-blue-500" />
    case "CARGO":
      return <Briefcase className="size-3.5 text-purple-500" />
    case "UNIDAD":
      return <Building className="size-3.5 text-emerald-500" />
    case "RESPONSABILIDAD":
      return <Award className="size-3.5 text-amber-500" />
  }
}

function getTipoLabel(tipo: TipoAprobador) {
  switch (tipo) {
    case "EMPLEADO":
      return "Empleado"
    case "CARGO":
      return "Cargo"
    case "UNIDAD":
      return "Unidad"
    case "RESPONSABILIDAD":
      return "Responsabilidad"
  }
}

export function GrupoAprobadorDetailPanel({
  grupo,
  itemPage,
  search,
  searchQuery,
  hidePrimaryAction = false,
  onSearchChange,
  onPageChange,
  onAddAprobador,
  onEditAprobador,
}: GrupoAprobadorDetailPanelProps) {
  const [deletingItem, setDeletingItem] =
    useState<GrupoAprobadorDetalle | null>(null)

  const deleteMutation = useDeleteGrupoAprobadorDetalle(grupo?.id ?? "")

  const detallesQuery = useQuery({
    ...grupoAprobadorDetalleQueries.list(grupo?.id ?? "", {
      page: itemPage,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
    }),
    enabled: Boolean(grupo?.id),
  })

  useClampPage(itemPage, onPageChange, detallesQuery.data?.totalPages)

  const detalles = detallesQuery.data?.content ?? []
  const totalElements = detallesQuery.data?.totalElements ?? detalles.length

  async function handleDelete() {
    if (!deletingItem || !grupo) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
      detallesQuery.refetch()
    } catch {
      // Handled by toast/mutation
    }
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(grupo)}
      emptySelectionMessage="Selecciona un grupo aprobador de la lista para gestionar sus pasos y reglas de validación."
      header={
        grupo ? (
          <DetailPanelHeader
            title={
              <div className="flex items-center gap-2">
                <span className="truncate">{grupo.nombre}</span>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <ListOrdered className="size-3 text-muted-foreground" />
                  {totalElements} {totalElements === 1 ? "paso" : "pasos"}
                </Badge>
              </div>
            }
            subtitle={
              <div className="flex items-center gap-2 pt-0.5">
                <code className="w-fit max-w-full truncate rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {grupo.codigo}
                </code>
              </div>
            }
            meta={<AuditInfo data={grupo} />}
            action={
              !hidePrimaryAction ? (
                <Button
                  size="sm"
                  type="button"
                  className="w-full shrink-0 sm:w-auto gap-1 shadow-2xs"
                  onClick={onAddAprobador}
                >
                  <Plus className="size-3.5" />
                  <span>Agregar aprobador</span>
                </Button>
              ) : null
            }
            search={{
              value: search,
              onChange: onSearchChange,
              placeholder: "Buscar aprobador…",
              "aria-label": "Buscar aprobadores en el grupo",
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
          title="Eliminar aprobador del grupo"
          description="¿Seguro que deseas remover este paso de aprobación del grupo?"
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
        />
      }
    >
      <PaginatedList
        items={detalles}
        page={detallesQuery.data}
        isLoading={detallesQuery.isLoading}
        isFetching={detallesQuery.isFetching}
        errorMessage={
          detallesQuery.isError
            ? getErrorMessage(detallesQuery.error)
            : null
        }
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(item) => item.id}
        skeletonRowClassName="h-14"
        listClassName="sm:p-3 space-y-2"
        empty={{
          icon: <ShieldCheck className="size-5 text-muted-foreground" />,
          title: "Sin aprobadores configurados",
          description: `Este grupo aún no tiene aprobadores definidos. Agrega el primer paso de validación.`,
          actionLabel: "Agregar aprobador",
          onAction: onAddAprobador,
          searchDescription: "Prueba con otro término de búsqueda.",
        }}
      >
        {(det) => {
          const targetName =
            det.tipoAprobador === "EMPLEADO"
              ? det.empleadoInfo?.nombreCompleto ||
                `Empleado (${det.empleadoId})`
              : det.tipoAprobador === "CARGO"
                ? det.cargoInfo?.nombre || `Cargo (${det.cargoId})`
                : det.tipoAprobador === "UNIDAD"
                  ? det.unidadInfo?.nombre || `Unidad (${det.unidadId})`
                  : det.responsabilidadInfo?.nombre ||
                    `Responsabilidad (${det.responsabilidadId})`

          const targetCodigo =
            det.tipoAprobador === "EMPLEADO"
              ? det.empleadoInfo?.codigo
              : det.tipoAprobador === "CARGO"
                ? det.cargoInfo?.codigo
                : det.tipoAprobador === "UNIDAD"
                  ? det.unidadInfo?.codigo
                  : det.responsabilidadInfo?.codigo

          return (
            <DetailListItem
              leading={
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-xs font-bold text-primary ring-1 ring-primary/20"
                  title={`Secuencia #${det.orden}`}
                >
                  #{det.orden}
                </div>
              }
              title={
                <div className="flex items-center gap-2 min-w-0">
                  {targetCodigo ? (
                    <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {targetCodigo}
                    </code>
                  ) : null}
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getTipoIcon(det.tipoAprobador)}
                    <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                      {targetName}
                    </span>
                  </div>
                </div>
              }
              subtitle={
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground pt-0.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0 px-1.5 font-normal"
                  >
                    Tipo: {getTipoLabel(det.tipoAprobador)}
                  </Badge>

                  <span className="text-muted-foreground/40 font-bold">•</span>

                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground bg-background/80"
                  >
                    Alcance:{" "}
                    {det.alcance === "GLOBAL"
                      ? "Global"
                      : det.unidadInfo?.nombre
                        ? `Unidad (${det.unidadInfo.nombre})`
                        : "Unidad"}
                  </Badge>

                  <span className="text-muted-foreground/40 font-bold">•</span>

                  {det.requiereAprobacion ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                      <CheckCircle2 className="size-3" />
                      Obligatorio
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      Informativo
                    </span>
                  )}
                </div>
              }
              meta={<AuditInfo data={det} compact />}
              actions={
                <RowActions
                  editLabel="Editar aprobador"
                  deleteLabel="Eliminar aprobador"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEditAprobador(det)}
                  onDelete={() => setDeletingItem(det)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </DetailPanelShell>
  )
}
