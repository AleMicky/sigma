import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckSquare, ListTodo, Pencil, Plus, Trash2 } from "lucide-react"

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

import { useDeleteChecklistItem } from "../api/checklist-item.mutations"
import { checklistItemQueries } from "../api/checklist-item.queries"
import type { ChecklistItem } from "../api/checklist-item.service"
import type { ChecklistMantenimiento } from "../api/checklist.service"
import { ChecklistItemFormDialog } from "./ChecklistItemFormDialog"

type ChecklistItemsDrawerProps = {
  checklist: ChecklistMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChecklistItemsDrawer({
  checklist,
  open,
  onOpenChange,
}: ChecklistItemsDrawerProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<ChecklistItem | null>(null)

  const deleteMutation = useDeleteChecklistItem()

  const itemsQuery = useQuery(
    checklistItemQueries.byChecklist(checklist?.id ?? ""),
  )

  const items = itemsQuery.data?.content ?? []

  function openCreate() {
    setEditingItem(null)
    setFormOpen(true)
  }

  function openEdit(item: ChecklistItem) {
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

  if (!checklist) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                <ListTodo className="size-4" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase">
                {checklist.codigo}
              </span>
            </div>
            <SheetTitle className="font-heading text-lg font-bold">
              Ítems y Pasos del Checklist
            </SheetTitle>
            <SheetDescription className="text-xs">
              Configura los puntos de inspección, preguntas y validaciones para este checklist.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">
                Puntos de Revisión ({items.length})
              </p>
              <Button
                size="sm"
                onClick={openCreate}
                className="h-7 text-xs gap-1"
              >
                <Plus className="size-3.5" />
                Agregar Ítem
              </Button>
            </div>

            {/* Items List */}
            {itemsQuery.isLoading ? (
              <ListSkeleton rows={4} className="flex flex-col gap-2" />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="size-4 text-muted-foreground" />}
                title="Sin ítems definidos"
                description="Agrega el primer punto de control a este checklist para que los técnicos puedan completarlo."
                action={
                  <Button size="sm" onClick={openCreate} className="h-7 text-xs gap-1">
                    <Plus className="size-3.5" />
                    Agregar Primer Ítem
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {items.map((item: ChecklistItem) => (
                  <li
                    key={item.id}
                    className="flex flex-col rounded-lg border border-border bg-card p-3 shadow-2xs hover:border-primary/30 transition-all gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                          {item.orden}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {item.nombre}
                          </p>
                          <code className="text-[10px] font-mono text-muted-foreground">
                            {item.codigo}
                          </code>
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
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeletingItem(item)}
                          className="size-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {item.descripcion && (
                      <p className="text-[11px] text-muted-foreground pl-7 line-clamp-2">
                        {item.descripcion}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pl-7 pt-1">
                      {item.tipoDato && (
                        <Badge variant="secondary" className="text-[9px]">
                          Tipo: {item.tipoDato.nombre}
                        </Badge>
                      )}
                      {item.obligatorio ? (
                        <Badge variant="outline" className="border-rose-500/30 text-rose-600 dark:text-rose-400 text-[9px]">
                          Obligatorio
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                          Opcional
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Create / Edit Dialog for Item */}
      <ChecklistItemFormDialog
        key={editingItem?.id ?? "new-item"}
        open={formOpen}
        onOpenChange={setFormOpen}
        checklistId={checklist.id}
        item={editingItem}
        nextOrder={items.length + 1}
      />

      {/* Delete Item Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title={`¿Eliminar ítem "${deletingItem?.nombre}"?`}
        description="Se retirará este paso de verificación del checklist."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
