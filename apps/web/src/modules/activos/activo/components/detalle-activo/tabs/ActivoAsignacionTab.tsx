import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  User,
  UserCheck,
  UserX,
} from "lucide-react"

import { useDeleteActivoAsignacion } from "@/modules/activos/activo-asignacion/api/activo-asignacion.mutations"
import { activoAsignacionQueries } from "@/modules/activos/activo-asignacion/api/activo-asignacion.queries"
import type { ActivoAsignacion } from "@/modules/activos/activo-asignacion/api/activo-asignacion.service"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { areaQueries } from "@/modules/organizacion/area/api/area.queries"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { formatDateTime } from "@/shared/utils/date.utils"

import { ActivoAsignacionModal } from "../modals/ActivoAsignacionModal"

type ActivoAsignacionTabProps = {
  activo: Activo
  ubicacion?: Ubicacion | null
}

function getInitials(name?: string): string {
  if (!name) return "—"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ActivoAsignacionTab({
  activo,
  ubicacion,
}: ActivoAsignacionTabProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "devolver">("create")
  const [selectedAsignacion, setSelectedAsignacion] = useState<ActivoAsignacion | null>(null)
  const [asignacionToDelete, setAsignacionToDelete] = useState<ActivoAsignacion | null>(null)

  const deleteMutation = useDeleteActivoAsignacion()

  // Queries
  const asignacionesQuery = useQuery(
    activoAsignacionQueries.byActivo(activo.id, {
      size: 100,
      sortBy: "fechaAsignacion",
      direction: "DESC",
    }),
  )
  const asignaciones = asignacionesQuery.data?.content ?? []

  const empleadosQuery = useQuery(
    empleadoQueries.list({ size: 100, sortBy: "createdAt", direction: "DESC" }),
  )
  const empleados = Array.isArray(empleadosQuery.data)
    ? empleadosQuery.data
    : (empleadosQuery.data?.content ?? [])
  const empleadosMap = useMemo(
    () => new Map(empleados.map((e) => [e.id, e])),
    [empleados],
  )

  const areasQuery = useQuery(
    areaQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const areas = Array.isArray(areasQuery.data)
    ? areasQuery.data
    : (areasQuery.data?.content ?? [])
  const areasMap = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas])

  // Helper to get entity details for an assignment
  function getAssignmentDetails(asignacion: ActivoAsignacion) {
    if (asignacion.empleadoId) {
      const emp = empleadosMap.get(asignacion.empleadoId)
      const nombre = emp?.personaNombreCompleto || (emp ? `Empleado (${emp.codigo})` : "Empleado no especificado")
      const area = emp?.areaNombre || (asignacion.areaId ? areasMap.get(asignacion.areaId)?.nombre : null)
      const cargo = emp?.cargoNombre

      return {
        tipo: "empleado" as const,
        nombre,
        codigo: emp?.codigo,
        area: area ?? undefined,
        cargo: cargo ?? undefined,
        telefono: null,
        correo: null,
      }
    }

    if (asignacion.areaId) {
      const area = areasMap.get(asignacion.areaId)
      return {
        tipo: "area" as const,
        nombre: area?.nombre ?? "Área no especificada",
        codigo: area?.codigo,
        area: area?.nombre,
        cargo: "Custodia por Área / Departamento",
        telefono: null,
        correo: null,
      }
    }

    return {
      tipo: "desconocido" as const,
      nombre: "Sin asignar",
      codigo: undefined,
      area: undefined,
      cargo: undefined,
      telefono: null,
      correo: null,
    }
  }

  // Active assignment: latest assignment without return date or return date in the future
  const activeAsignacion = useMemo(() => {
    return asignaciones.find((a) => !a.fechaDevolucion) || null
  }, [asignaciones])

  const activeDetails = activeAsignacion ? getAssignmentDetails(activeAsignacion) : null

  function handleOpenCreate() {
    setSelectedAsignacion(null)
    setModalMode("create")
    setModalOpen(true)
  }

  function handleOpenEdit(asignacion: ActivoAsignacion) {
    setSelectedAsignacion(asignacion)
    setModalMode("edit")
    setModalOpen(true)
  }

  function handleOpenDevolver(asignacion: ActivoAsignacion) {
    setSelectedAsignacion(asignacion)
    setModalMode("devolver")
    setModalOpen(true)
  }

  async function handleConfirmDelete() {
    if (!asignacionToDelete) return
    try {
      await deleteMutation.mutateAsync({
        id: asignacionToDelete.id,
        activoId: activo.id,
      })
      setAsignacionToDelete(null)
    } catch {
      // Handled in mutation
    }
  }

  if (asignacionesQuery.isLoading) {
    return (
      <div className="py-4">
        <ListSkeleton rows={2} rowClassName="h-32 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Current Custodio / Responsable Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-500" />
            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
              Custodio y Responsable Actual
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {activeAsignacion ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Custodia Activa
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <AlertCircle className="size-3" />
                Sin Custodio Asignado
              </span>
            )}
          </div>
        </div>

        {activeAsignacion && activeDetails ? (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-base shadow-xs">
                {getInitials(activeDetails.nombre)}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {activeDetails.tipo === "empleado" ? "Responsable Directo" : "Área Responsable"}
                  </span>
                  {activeDetails.codigo && (
                    <span className="font-mono text-[10px] bg-background/80 px-1.5 py-0.5 rounded text-foreground font-semibold border border-border/60">
                      {activeDetails.codigo}
                    </span>
                  )}
                </div>
                <span className="font-heading text-base font-bold text-foreground truncate" title={activeDetails.nombre}>
                  {activeDetails.nombre}
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                  {activeDetails.cargo && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3 text-muted-foreground/70" />
                      {activeDetails.cargo}
                    </span>
                  )}
                  {activeDetails.area && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3 text-muted-foreground/70" />
                        {activeDetails.area}
                      </span>
                    </>
                  )}
                  {ubicacion?.nombre && (
                    <>
                      <span>·</span>
                      <span>Sede {ubicacion.nombre}</span>
                    </>
                  )}
                </div>
                {activeAsignacion.observacionAsignacion && (
                  <p className="text-xs text-muted-foreground/90 mt-2 italic bg-background/50 p-2 rounded-lg border border-border/40">
                    &ldquo;{activeAsignacion.observacionAsignacion}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenDevolver(activeAsignacion)}
                className="h-8.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
              >
                <RotateCcw className="size-3.5" />
                Registrar Devolución
              </Button>
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="h-8.5 text-xs font-semibold shadow-xs"
              >
                <Plus className="size-3.5" />
                Traspasar / Reasignar
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl border border-dashed border-border/90 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <UserX className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">
                  Activo disponible en almacén o custodia general
                </span>
                <span className="text-xs text-muted-foreground">
                  No hay una asignación activa registrada. Puedes asignar un nuevo responsable en cualquier momento.
                </span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-8.5 text-xs font-semibold shrink-0"
            >
              <Plus className="size-3.5" />
              Asignar Responsable
            </Button>
          </div>
        )}
      </div>

      {/* Assignment Timeline / History */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <History className="size-4.5 text-primary" />
            Historial de Responsables y Asignaciones
          </h3>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenCreate}
            className="h-8 text-xs font-semibold"
          >
            <Plus className="size-3.5" />
            Nueva Asignación
          </Button>
        </div>

        {asignaciones.length === 0 ? (
          <EmptyState
            icon={<History className="size-8 text-muted-foreground/50" />}
            title="Sin historial de asignaciones"
            description="Este activo no registra traspasos o asignaciones previas."
            action={
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="size-3.5" />
                Registrar Primera Asignación
              </Button>
            }
          />
        ) : (
          <div className="relative pl-6 sm:pl-7 border-l-2 border-border/80 space-y-6 my-2 ml-2 sm:ml-3">
            {asignaciones.map((asig) => {
              const details = getAssignmentDetails(asig)
              const isCurrent = !asig.fechaDevolucion

              return (
                <div key={asig.id} className="relative group">
                  {/* Timeline Dot */}
                  <span
                    className={`absolute -left-[31px] sm:-left-[35px] top-1 size-4 rounded-full ring-4 ring-background flex items-center justify-center ${
                      isCurrent
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/60"
                    }`}
                  >
                    {isCurrent && <CheckCircle2 className="size-2.5 text-white" />}
                  </span>

                  <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/20 p-3.5 transition-colors">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {details.tipo === "empleado"
                              ? `Asignación a ${details.nombre}`
                              : `Asignación al Área de ${details.nombre}`}
                          </span>

                          {isCurrent ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                              Vigente
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                              Finalizada
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            Entrega: {formatDateTime(asig.fechaAsignacion)}
                          </span>
                          {asig.fechaDevolucion && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                <Clock className="size-3" />
                                Devolución: {formatDateTime(asig.fechaDevolucion)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Menu Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreVertical className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {isCurrent && (
                            <DropdownMenuItem
                              onClick={() => handleOpenDevolver(asig)}
                              className="text-xs text-amber-600 dark:text-amber-400"
                            >
                              <RotateCcw className="size-3.5 mr-2" />
                              Registrar Devolución
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(asig)}
                            className="text-xs"
                          >
                            <Pencil className="size-3.5 mr-2" />
                            Editar Registro
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setAsignacionToDelete(asig)}
                            className="text-xs text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Metadata & Observations */}
                    <div className="flex flex-col gap-1.5 text-xs">
                      {details.cargo && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="size-3" />
                          <span>{details.cargo}</span>
                          {details.area && <span>· {details.area}</span>}
                        </div>
                      )}

                      {asig.observacionAsignacion && (
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
                          <strong className="text-foreground text-[11px]">Motivo entrega: </strong>
                          {asig.observacionAsignacion}
                        </div>
                      )}

                      {asig.observacionDevolucion && (
                        <div className="text-xs text-muted-foreground bg-amber-500/5 p-2 rounded-lg border border-amber-500/20">
                          <strong className="text-amber-600 dark:text-amber-400 text-[11px]">
                            Motivo devolución:{" "}
                          </strong>
                          {asig.observacionDevolucion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Asset Initial Reception Milestone */}
            <div className="relative">
              <span className="absolute -left-[31px] sm:-left-[35px] top-1 size-4 rounded-full bg-primary ring-4 ring-background flex items-center justify-center" />
              <div className="flex flex-col gap-0.5 rounded-xl border border-border/60 bg-muted/15 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Alta y Registro Inicial del Activo
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {activo.createdAt ? formatDateTime(activo.createdAt) : "Registro inicial"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingreso inicial con código patrimonial{" "}
                  <span className="font-mono text-foreground font-semibold">
                    {activo.codigo}
                  </span>{" "}
                  en sede {ubicacion?.nombre || "Principal"}.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Creating / Editing / Returning Assignment */}
      <ActivoAsignacionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activoId={activo.id}
        activoCodigo={activo.codigo}
        mode={modalMode}
        asignacionToEdit={selectedAsignacion}
      />

      {/* Confirmation Dialog for Deleting Assignment */}
      <AlertDialog
        open={Boolean(asignacionToDelete)}
        onOpenChange={(open) => {
          if (!open) setAsignacionToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de asignación?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Esta acción eliminará el registro de custodia y su historial asociado del activo{" "}
              <strong className="text-foreground">{activo.codigo}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
