import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  ListOrdered,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { GrupoAprobador } from "../../grupo-aprobador/api/grupo-aprobador.service"
import { useDeleteGrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.mutations"
import { grupoAprobadorDetalleQueries } from "../api/grupo-aprobador-detalle.queries"
import type { GrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.service"
import type { TipoAprobador } from "../schemas/grupo-aprobador-detalle.schema"
import { GrupoAprobadorDetalleFormDialog } from "./GrupoAprobadorDetalleFormDialog"

type GrupoAprobadorDetallesDrawerProps = {
  grupo: GrupoAprobador | null
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function GrupoAprobadorDetallesDrawer({
  grupo,
  open,
  onOpenChange,
}: GrupoAprobadorDetallesDrawerProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<GrupoAprobadorDetalle | null>(null)
  const [deletingItem, setDeletingItem] =
    useState<GrupoAprobadorDetalle | null>(null)

  const deleteMutation = useDeleteGrupoAprobadorDetalle(grupo?.id ?? "")

  const detallesQuery = useQuery({
    ...grupoAprobadorDetalleQueries.list(grupo?.id ?? "", {
      sortBy: "orden",
      direction: "ASC",
    }),
    enabled: Boolean(open && grupo?.id),
  })

  const detalles = detallesQuery.data?.content ?? []

  function openCreate() {
    setEditingItem(null)
    setFormOpen(true)
  }

  function openEdit(detalle: GrupoAprobadorDetalle) {
    setEditingItem(detalle)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deletingItem || !grupo) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Handled by mutation error
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col sm:max-w-md md:max-w-lg w-full p-0">
          <SheetHeader className="border-b p-4 sm:p-6 text-left">
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-base font-semibold">
                  {grupo?.nombre ?? "Aprobadores del Grupo"}
                </SheetTitle>
                <SheetDescription className="truncate text-xs font-mono">
                  {grupo?.codigo}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30 sm:px-6">
            <span className="text-xs font-medium text-muted-foreground">
              Secuencia de Aprobación ({detalles.length})
            </span>
            <Button size="xs" onClick={openCreate} className="gap-1">
              <Plus className="size-3.5" />
              Agregar Aprobador
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {detallesQuery.isLoading ? (
              <ListSkeleton rows={4} rowClassName="h-20 rounded-xl" />
            ) : detalles.length === 0 ? (
              <EmptyState
                icon={<ListOrdered className="size-4 text-muted-foreground" />}
                title="Sin aprobadores asignados"
                description="Este grupo aún no tiene aprobadores configurados. Agrega el primer paso."
                action={
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="size-4" />
                    Agregar Aprobador
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {detalles.map((det) => {
                  const targetName =
                    det.tipoAprobador === "EMPLEADO"
                      ? det.empleadoInfo?.nombreCompleto ||
                        `Empleado (${det.empleadoId})`
                      : det.tipoAprobador === "CARGO"
                        ? det.cargoInfo?.nombre || `Cargo (${det.cargoId})`
                        : det.tipoAprobador === "UNIDAD"
                          ? det.unidadInfo?.nombre ||
                            `Unidad (${det.unidadId})`
                          : det.responsabilidadInfo?.nombre ||
                            `Responsabilidad (${det.responsabilidadId})`

                  return (
                    <li
                      key={det.id}
                      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] font-bold px-1.5 py-0"
                          >
                            #{det.orden}
                          </Badge>

                          <div className="flex items-center gap-1.5 min-w-0">
                            {getTipoIcon(det.tipoAprobador)}
                            <span className="truncate text-xs font-semibold text-foreground">
                              {targetName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEdit(det)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3.5" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeletingItem(det)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 font-normal"
                        >
                          Tipo: {getTipoLabel(det.tipoAprobador)}
                        </Badge>

                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground"
                        >
                          Alcance:{" "}
                          {det.alcance === "GLOBAL"
                            ? "Global"
                            : det.unidadInfo?.nombre
                              ? `Unidad (${det.unidadInfo.nombre})`
                              : "Unidad Específica"}
                        </Badge>

                        {det.requiereAprobacion ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                            <CheckCircle2 className="size-3" />
                            Aprobación obligatoria
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            Notificación informativa
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {grupo ? (
        <GrupoAprobadorDetalleFormDialog
          key={editingItem?.id ?? "new-detalle"}
          grupoAprobadorId={grupo.id}
          open={formOpen}
          onOpenChange={setFormOpen}
          detalle={editingItem}
          onSuccess={() => {
            detallesQuery.refetch()
          }}
        />
      ) : null}

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
    </>
  )
}
