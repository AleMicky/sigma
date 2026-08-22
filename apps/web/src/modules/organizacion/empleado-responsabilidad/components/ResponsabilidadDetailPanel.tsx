import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Award,
  Calendar,
  Check,
  Clock,
  Copy,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
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

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE"

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
  const [searchFilter, setSearchFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")
  const [copiedCode, setCopiedCode] = useState(false)

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

  // Métricas
  const totalAsignados = asignaciones.length
  const vigentesCount = useMemo(
    () =>
      asignaciones.filter((item) =>
        isVigente(item.fechaInicio, item.fechaFin),
      ).length,
    [asignaciones],
  )
  const finalizadosCount = totalAsignados - vigentesCount

  // Filtrado de lista en tiempo real
  const filteredAsignaciones = useMemo(() => {
    return asignaciones.filter((item) => {
      const activa = isVigente(item.fechaInicio, item.fechaFin)
      if (statusFilter === "ACTIVE" && !activa) return false
      if (statusFilter === "INACTIVE" && activa) return false

      if (!searchFilter.trim()) return true
      const query = searchFilter.toLowerCase().trim()
      const nombre = (item.empleadoInfo?.nombreCompleto || "").toLowerCase()
      const codigo = (item.empleadoInfo?.codigo || "").toLowerCase()

      return nombre.includes(query) || codigo.includes(query)
    })
  }, [asignaciones, searchFilter, statusFilter])

  function handleCopyCodigo(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success(`Código "${code}" copiado al portapapeles`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

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
      asignacionesQuery.refetch()
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
      {/* Encabezado Ficha Ejecutiva de la Responsabilidad */}
      <div className="border-b border-border/80 bg-gradient-to-br from-muted/40 via-muted/20 to-transparent p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs border border-primary/20">
              <Award className="size-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                  {responsabilidad.nombre}
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopyCodigo(responsabilidad.codigo)}
                  className="group inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground hover:bg-muted-foreground/15 transition-colors cursor-pointer"
                  title="Copiar código al portapapeles"
                >
                  <span>{responsabilidad.codigo}</span>
                  {copiedCode ? (
                    <Check className="size-3 text-emerald-600" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
                  )}
                </button>
              </div>

              {responsabilidad.descripcion ? (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
                className="gap-1.5 shadow-2xs hover:bg-muted"
              >
                <Pencil className="size-3 text-primary" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas (KPIs) */}
        <div className="grid grid-cols-3 gap-2.5 pt-3.5 mt-3.5 border-t border-border/50">
          <div className="flex flex-col rounded-xl bg-background/80 p-2.5 border border-border/60 shadow-2xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Users className="size-3 text-primary" />
              <span>Total Asignados</span>
            </span>
            <span className="text-base font-bold text-foreground mt-0.5">
              {totalAsignados}
            </span>
          </div>

          <div className="flex flex-col rounded-xl bg-background/80 p-2.5 border border-border/60 shadow-2xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-700 dark:text-emerald-400">Vigentes</span>
            </span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {vigentesCount}
            </span>
          </div>

          <div className="flex flex-col rounded-xl bg-background/80 p-2.5 border border-border/60 shadow-2xs">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground" />
              <span>Finalizados</span>
            </span>
            <span className="text-base font-bold text-muted-foreground mt-0.5">
              {finalizadosCount}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <AuditInfo data={responsabilidad} compact />
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda de Colaboradores */}
      <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Colaboradores Asignados
            </span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
              {filteredAsignaciones.length}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <RefreshButton
              size="xs"
              onRefresh={() => asignacionesQuery.refetch()}
              isRefreshing={asignacionesQuery.isFetching}
            />
            <Button size="xs" onClick={openCreate} className="gap-1 shadow-2xs">
              <Plus className="size-3.5" />
              <span>Asignar</span>
            </Button>
          </div>
        </div>

        {totalAsignados > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
            <div className="relative flex-1">
              <SearchField
                value={searchFilter}
                onChange={setSearchFilter}
                placeholder="Filtrar colaboradores por nombre o código…"
                aria-label="Filtrar empleados asignados"
                className="w-full h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors",
                  statusFilter === "ALL"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Todos ({totalAsignados})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors",
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Vigentes ({vigentesCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors",
                  statusFilter === "INACTIVE"
                    ? "bg-background text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Finalizados ({finalizadosCount})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Colaboradores Asignados */}
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
            icon={<Users className="size-5 text-muted-foreground" />}
            title="Sin empleados asignados"
            description={`Actualmente no hay ningún colaborador con la responsabilidad "${responsabilidad.nombre}".`}
            action={
              <Button size="sm" onClick={openCreate} className="gap-1.5">
                <Plus className="size-4" />
                Asignar Primer Empleado
              </Button>
            }
            className="py-8"
          />
        ) : filteredAsignaciones.length === 0 ? (
          <EmptyState
            icon={<Search className="size-4 text-muted-foreground" />}
            title="Sin coincidencias"
            description="Ningún colaborador asignado coincide con el filtro o término de búsqueda aplicado."
            action={
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  setSearchFilter("")
                  setStatusFilter("ALL")
                }}
              >
                Restablecer filtros
              </Button>
            }
            className="py-6"
          />
        ) : (
          <ul className="space-y-2.5">
            {filteredAsignaciones.map((item) => {
              const empleadoNombre =
                item.empleadoInfo?.nombreCompleto ||
                `Empleado (${item.empleadoId})`
              const empleadoCodigo = item.empleadoInfo?.codigo
              const activa = isVigente(item.fechaInicio, item.fechaFin)

              return (
                <li
                  key={item.id}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl border p-3 shadow-2xs transition-all sm:p-3.5",
                    activa
                      ? "border-border/80 bg-card hover:border-primary/40 hover:shadow-xs"
                      : "border-border/50 bg-muted/15 opacity-80 hover:opacity-100",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                          activa
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
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
                        title="Modificar vigencia o colaborador"
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Editar asignación</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeletingItem(item)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                        title="Remover colaborador de esta responsabilidad"
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
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "text-muted-foreground border-border bg-muted/40",
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

      {/* Modal para Asignar / Editar Empleado con Autocomplete */}
      <EmpleadoResponsabilidadFormDialog
        key={editingItem?.id ?? `new-asignacion-${responsabilidad.id}`}
        responsabilidadId={responsabilidad.id}
        responsabilidadNombre={responsabilidad.nombre}
        responsabilidadCodigo={responsabilidad.codigo}
        open={formOpen}
        onOpenChange={setFormOpen}
        asignacion={editingItem}
        onSuccess={() => {
          asignacionesQuery.refetch()
        }}
      />

      {/* Modal de Confirmación de Eliminación */}
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
    </div>
  )
}
