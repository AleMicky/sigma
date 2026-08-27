import { useState } from "react"
import { Eye, Link as LinkIcon } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import { useDeleteMenu } from "../api/menu.mutations"
import type { Menu } from "../api/menu.service"
import { DynamicLucideIcon } from "./DynamicLucideIcon"

type MenuTableViewProps = {
  menus: Menu[]
  parentsById: Map<string, Menu>
  onEdit: (menu: Menu) => void
  onQuickView: (id: string) => void
}

export function MenuTableView({
  menus,
  parentsById,
  onEdit,
  onQuickView,
}: MenuTableViewProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteMenu()

  const selectedDeleteMenu = menus.find((m) => m.id === deleteId)

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">Menú</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Código</th>
              <th scope="col" className="px-4 py-3 sm:px-6">Ruta</th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell sm:px-6">Menú Padre</th>
              <th scope="col" className="px-4 py-3 text-center sm:px-6">Orden</th>
              <th scope="col" className="px-4 py-3 text-center sm:px-6">Estado</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {menus.map((menu) => {
              const parent = menu.menuPadreId
                ? parentsById.get(menu.menuPadreId)
                : null

              return (
                <tr key={menu.id} className="group hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3 sm:px-6 font-medium">
                    <div className="flex items-center gap-2.5">
                      {menu.icono ? (
                        <div className="flex size-7 items-center justify-center rounded-lg bg-muted border border-border/60 text-muted-foreground shrink-0">
                          <DynamicLucideIcon name={menu.icono} className="size-3.5" />
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onQuickView(menu.id)}
                        className="font-medium text-foreground hover:text-primary transition-colors text-left truncate max-w-[200px]"
                      >
                        {menu.nombre}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 sm:px-6 font-mono text-xs">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground border border-border/40">
                      {menu.codigo}
                    </code>
                  </td>

                  <td className="px-4 py-3 sm:px-6 text-xs text-muted-foreground">
                    {menu.ruta ? (
                      <span className="flex items-center gap-1 font-mono truncate max-w-[200px]">
                        <LinkIcon className="size-3 shrink-0 opacity-60" />
                        <span className="truncate">{menu.ruta}</span>
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/60">
                        —
                      </span>
                    )}
                  </td>

                  <td className="hidden px-4 py-3 md:table-cell sm:px-6 text-xs text-muted-foreground">
                    {parent ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {parent.codigo}
                        </code>
                        <span className="truncate">{parent.nombre}</span>
                      </div>
                    ) : (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Raíz
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 sm:px-6 text-center font-mono text-xs">
                    {menu.orden}
                  </td>

                  <td className="px-4 py-3 sm:px-6 text-center">
                    <Badge
                      variant={menu.activo ? "default" : "outline"}
                      className={
                        menu.activo
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                          : "text-destructive border-destructive/40 text-xs"
                      }
                    >
                      {menu.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        title="Ver detalles"
                        onClick={() => onQuickView(menu.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="size-3.5" />
                      </Button>

                      <RowActions
                        editLabel="Editar menú"
                        deleteLabel="Eliminar menú"
                        deleteDisabled={deleteMutation.isPending}
                        onEdit={() => onEdit(menu)}
                        onDelete={() => setDeleteId(menu.id)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar menú"
        description={`¿Seguro que deseas eliminar el menú "${selectedDeleteMenu?.nombre}"? Si tiene submenús asociados, el servidor denegará la acción.`}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
