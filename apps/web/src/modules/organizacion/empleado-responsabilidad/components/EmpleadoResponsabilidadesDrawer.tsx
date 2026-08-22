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

import type { Responsabilidad } from "../../responsabilidad/api/responsabilidad.service"
import { useDeleteEmpleadoResponsabilidad } from "../api/empleado-responsabilidad.mutations"
import { empleadoResponsabilidadQueries } from "../api/empleado-responsabilidad.queries"
import type { EmpleadoResponsabilidad } from "../api/empleado-responsabilidad.service"
import { EmpleadoResponsabilidadFormDialog } from "./EmpleadoResponsabilidadFormDialog"

type EmpleadoResponsabilidadesDrawerProps = {
  responsabilidad: Responsabilidad | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isVigente(fechaInicio: string, fechaFin: string | null): boolean {
  const hoy = new Date().toISOString().split("T")[0]
  if (fechaInicio > hoy) return false
  if (!fechaFin) return true
  return fechaFin >= hoy
}

export function EmpleadoResponsabilidadesDrawer({
  responsabilidad,
  open,
  onOpenChange,
}: EmpleadoResponsabilidadesDrawerProps) {
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
    enabled: Boolean(open && responsabilidad?.id),
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
      asignacionesQuery.refetch()
    } catch {
      // Handled by mutation error toast
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col sm:max-w-md md:max-w-lg w-full p-0">
          <SheetHeader className="border-b p-4 sm:p-6 text-left">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-base font-semibold">
                  {responsabilidad?.nombre ?? "Empleados Asignados"}
                </SheetTitle>
                <SheetDescription className="truncate text-xs font-mono">
                  {responsabilidad?.codigo}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30 sm:px-6">
            <span className="text-xs font-medium text-muted-foreground">
              Empleados con esta responsabilidad ({asignaciones.length})
            </span>
            <Button size="xs" onClick={openCreate} className="gap-1">
              <Plus className="size-3.5" />
              Asignar Empleado
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {asignacionesQuery.isLoading ? (
              <ListSkeleton rows={4} rowClassName="h-20 rounded-xl" />
            ) : asignaciones.length === 0 ? (
              <EmptyState
                icon={<Users className="size-4 text-muted-foreground" />}
                title="Sin empleados asignados"
                description="Actualmente no hay ningún empleado asignado a esta responsabilidad organizacional."
                action={
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="size-4" />
                    Asignar Primer Empleado
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {asignaciones.map((item) => {
                  const empleadoNombre =
                    item.empleadoInfo?.nombreCompleto ||
                    `Empleado (${item.empleadoId})`
                  const empleadoCodigo = item.empleadoInfo?.codigo
                  const activa = isVigente(item.fechaInicio, item.fechaFin)

                  return (
                    <li
                      key={item.id}
                      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                            <User className="size-3.5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-xs font-semibold text-foreground">
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
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeletingItem(item)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-muted-foreground/70" />
                          <span>
                            {item.fechaInicio}
                            {item.fechaFin ? ` al ${item.fechaFin}` : " (Indefinido)"}
                          </span>
                        </div>

                        <Badge
                          variant={activa ? "default" : "outline"}
                          className={`text-[10px] py-0 px-1.5 font-normal ${
                            activa
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "text-muted-foreground"
                          }`}
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
        </SheetContent>
      </Sheet>

      {responsabilidad ? (
        <EmpleadoResponsabilidadFormDialog
          key={editingItem?.id ?? "new-asignacion"}
          responsabilidadId={responsabilidad.id}
          responsabilidadNombre={responsabilidad.nombre}
          open={formOpen}
          onOpenChange={setFormOpen}
          asignacion={editingItem}
          onSuccess={() => {
            asignacionesQuery.refetch()
          }}
        />
      ) : null}

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
    </>
  )
}
