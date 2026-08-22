import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Award,
  Briefcase,
  CheckCircle2,
  ListOrdered,
  Plus,
  ShieldCheck,
  UserCheck,
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

import type { GrupoAprobador } from "../../grupo-aprobador/api/grupo-aprobador.service"
import { useDeleteGrupoAprobadorDependiente } from "../../grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.mutations"
import { grupoAprobadorDependienteQueries } from "../../grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.queries"
import type { GrupoAprobadorDependiente } from "../../grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.service"
import { useDeleteGrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.mutations"
import { grupoAprobadorDetalleQueries } from "../api/grupo-aprobador-detalle.queries"
import type { GrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.service"
import type { TipoAprobador } from "../schemas/grupo-aprobador-detalle.schema"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type ActiveTab = "APROBADORES" | "DEPENDIENTES"

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
  onAddDependiente: () => void
  onEditDependiente: (dependiente: GrupoAprobadorDependiente) => void
}

function getTipoIcon(tipo: TipoAprobador) {
  switch (tipo) {
    case "EMPLEADO":
      return <UserCheck className="size-3.5 text-blue-500" />
    case "CARGO":
      return <Briefcase className="size-3.5 text-purple-500" />
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
    case "RESPONSABILIDAD":
      return "Responsabilidad"
  }
}

function getInitials(name: string): string {
  if (!name) return "EM"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
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
  onAddDependiente,
  onEditDependiente,
}: GrupoAprobadorDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("APROBADORES")
  const [deletingDetalle, setDeletingDetalle] =
    useState<GrupoAprobadorDetalle | null>(null)
  const [deletingDependiente, setDeletingDependiente] =
    useState<GrupoAprobadorDependiente | null>(null)

  const deleteDetalleMutation = useDeleteGrupoAprobadorDetalle(
    grupo?.id ?? "",
  )
  const deleteDependienteMutation = useDeleteGrupoAprobadorDependiente(
    grupo?.id ?? "",
  )

  // Consulta de aprobadores (detalles)
  const detallesQuery = useQuery({
    ...grupoAprobadorDetalleQueries.list(grupo?.id ?? "", {
      page: activeTab === "APROBADORES" ? itemPage : 0,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(activeTab === "APROBADORES" && searchQuery.trim()
        ? { q: searchQuery.trim() }
        : {}),
    }),
    enabled: Boolean(grupo?.id),
  })

  // Consulta de dependientes
  const dependientesQuery = useQuery({
    ...grupoAprobadorDependienteQueries.list(grupo?.id ?? "", {
      page: activeTab === "DEPENDIENTES" ? itemPage : 0,
      size: PAGE_SIZE,
      sortBy: "id",
      direction: "ASC",
      ...(activeTab === "DEPENDIENTES" && searchQuery.trim()
        ? { q: searchQuery.trim() }
        : {}),
    }),
    enabled: Boolean(grupo?.id),
  })

  const currentQuery =
    activeTab === "APROBADORES" ? detallesQuery : dependientesQuery
  useClampPage(itemPage, onPageChange, currentQuery.data?.totalPages)

  const detalles = detallesQuery.data?.content ?? []
  const totalDetalles =
    detallesQuery.data?.totalElements ?? detalles.length

  const dependientes = dependientesQuery.data?.content ?? []
  const totalDependientes =
    dependientesQuery.data?.totalElements ?? dependientes.length

  async function handleDeleteDetalle() {
    if (!deletingDetalle || !grupo) return
    try {
      await deleteDetalleMutation.mutateAsync(deletingDetalle.id)
      setDeletingDetalle(null)
      detallesQuery.refetch()
    } catch {
      // Handled by mutation error
    }
  }

  async function handleDeleteDependiente() {
    if (!deletingDependiente || !grupo) return
    try {
      await deleteDependienteMutation.mutateAsync(deletingDependiente.id)
      setDeletingDependiente(null)
      dependientesQuery.refetch()
    } catch {
      // Handled by mutation error
    }
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(grupo)}
      emptySelectionMessage="Selecciona un grupo aprobador de la lista para gestionar sus aprobadores y empleados dependientes."
      header={
        grupo ? (
          <DetailPanelHeader
            title={
              <div className="flex items-center gap-2">
                <span className="truncate">{grupo.nombre}</span>
              </div>
            }
            subtitle={
              <div className="flex items-center gap-2 pt-0.5">
                <code className="w-fit max-w-full truncate rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {grupo.codigo}
                </code>

                {/* Tabs de Conmutación Aprobadores / Dependientes */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("APROBADORES")
                      onPageChange(0)
                      onSearchChange("")
                    }}
                    className={cn(
                      "px-2.5 py-0.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                      activeTab === "APROBADORES"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <ListOrdered className="size-3.5 text-primary" />
                    <span>Aprobadores ({totalDetalles})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("DEPENDIENTES")
                      onPageChange(0)
                      onSearchChange("")
                    }}
                    className={cn(
                      "px-2.5 py-0.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                      activeTab === "DEPENDIENTES"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Dependientes ({totalDependientes})</span>
                  </button>
                </div>
              </div>
            }
            meta={<AuditInfo data={grupo} />}
            action={
              !hidePrimaryAction ? (
                activeTab === "APROBADORES" ? (
                  <Button
                    size="sm"
                    type="button"
                    className="w-full shrink-0 sm:w-auto gap-1 shadow-2xs"
                    onClick={onAddAprobador}
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar aprobador</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    type="button"
                    className="w-full shrink-0 sm:w-auto gap-1 shadow-2xs"
                    onClick={onAddDependiente}
                  >
                    <Plus className="size-3.5" />
                    <span>Asociar dependiente</span>
                  </Button>
                )
              ) : null
            }
            search={{
              value: search,
              onChange: onSearchChange,
              placeholder:
                activeTab === "APROBADORES"
                  ? "Buscar aprobador…"
                  : "Buscar empleado dependiente…",
              "aria-label": "Buscar en el grupo aprobador",
            }}
          />
        ) : null
      }
      footer={
        <>
          <ConfirmDeleteDialog
            open={Boolean(deletingDetalle)}
            onOpenChange={(open) => {
              if (!open) setDeletingDetalle(null)
            }}
            title="Eliminar aprobador del grupo"
            description="¿Seguro que deseas remover este paso de aprobación del grupo?"
            isPending={deleteDetalleMutation.isPending}
            onConfirm={handleDeleteDetalle}
          />
          <ConfirmDeleteDialog
            open={Boolean(deletingDependiente)}
            onOpenChange={(open) => {
              if (!open) setDeletingDependiente(null)
            }}
            title="Eliminar dependiente del grupo"
            description="¿Seguro que deseas desasociar a este empleado del grupo aprobador?"
            isPending={deleteDependienteMutation.isPending}
            onConfirm={handleDeleteDependiente}
          />
        </>
      }
    >
      {activeTab === "APROBADORES" ? (
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
                  : det.responsabilidadInfo?.nombre ||
                    `Responsabilidad (${det.responsabilidadId})`

            const targetCodigo =
              det.tipoAprobador === "EMPLEADO"
                ? det.empleadoInfo?.codigo
                : det.tipoAprobador === "CARGO"
                  ? det.cargoInfo?.codigo
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

                    <span className="text-muted-foreground/40 font-bold">
                      •
                    </span>

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
                    deleteDisabled={deleteDetalleMutation.isPending}
                    onEdit={() => onEditAprobador(det)}
                    onDelete={() => setDeletingDetalle(det)}
                  />
                }
              />
            )
          }}
        </PaginatedList>
      ) : (
        <PaginatedList
          items={dependientes}
          page={dependientesQuery.data}
          isLoading={dependientesQuery.isLoading}
          isFetching={dependientesQuery.isFetching}
          errorMessage={
            dependientesQuery.isError
              ? getErrorMessage(dependientesQuery.error)
              : null
          }
          hasSearch={search.trim().length > 0}
          onPageChange={onPageChange}
          getKey={(item) => item.id}
          skeletonRowClassName="h-14"
          listClassName="sm:p-3 space-y-2"
          empty={{
            icon: <Users className="size-5 text-muted-foreground" />,
            title: "Sin empleados dependientes",
            description: `No hay empleados cuyas solicitudes pasen por este grupo aprobador.`,
            actionLabel: "Asociar dependiente",
            onAction: onAddDependiente,
            searchDescription: "Prueba con otro término de búsqueda.",
          }}
        >
          {(dep) => {
            const empleadoNombre =
              dep.empleadoInfo?.nombreCompleto ||
              `Empleado (${dep.empleadoId})`
            const empleadoCodigo = dep.empleadoInfo?.codigo
            const initials = getInitials(empleadoNombre)

            return (
              <DetailListItem
                leading={
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 shadow-2xs">
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
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                    <UserCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Solicitante asociado al flujo aprobador</span>
                  </div>
                }
                meta={<AuditInfo data={dep} compact />}
                actions={
                  <RowActions
                    editLabel="Editar dependiente"
                    deleteLabel="Eliminar dependiente"
                    deleteDisabled={deleteDependienteMutation.isPending}
                    onEdit={() => onEditDependiente(dep)}
                    onDelete={() => setDeletingDependiente(dep)}
                  />
                }
              />
            )
          }}
        </PaginatedList>
      )}
    </DetailPanelShell>
  )
}
