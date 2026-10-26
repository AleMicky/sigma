import { useState } from "react"
import { Eye, KeyRound, Link as LinkIcon } from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import { useDeleteMenu } from "../api/menu.mutations"
import type { Menu } from "../api/menu.service"
import { DynamicLucideIcon } from "./DynamicLucideIcon"

type MenuTableViewProps = {
  menus: Menu[]
  parentsById: Map<string, Menu>
  permisosCountByMenuId?: Map<string, number>
  onEdit: (menu: Menu) => void
  onQuickView: (id: string) => void
  onManagePermisos?: (menu: Menu) => void
}

export function MenuTableView({
  menus,
  parentsById,
  permisosCountByMenuId,
  onEdit,
  onQuickView,
  onManagePermisos,
}: MenuTableViewProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteMenu()

  const selectedDeleteMenu = menus.find((m) => m.id === deleteId)

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-2.5 py-1.5 sm:px-3">Menú</th>
              <th scope="col" className="px-2.5 py-1.5 sm:px-3">Código</th>
              <th scope="col" className="px-2.5 py-1.5 sm:px-3">Ruta</th>
              <th scope="col" className="hidden px-2.5 py-1.5 md:table-cell sm:px-3">Menú Padre</th>
              <th scope="col" className="hidden lg:table-cell px-2.5 py-1.5 text-center sm:px-3">Permisos</th>
              <th scope="col" className="px-2.5 py-1.5 text-center sm:px-3">Orden</th>
              <th scope="col" className="px-2.5 py-1.5 text-center sm:px-3">Estado</th>
              <th scope="col" className="px-2.5 py-1.5 text-right sm:px-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {menus.map((menu) => {
              const parent = menu.menuPadreId
                ? parentsById.get(menu.menuPadreId)
                : null

              const permisosCount = permisosCountByMenuId?.get(menu.id) ?? 0

              const isFolder = menu.esFolder ?? (menu.tipo === "MODULO" || menu.tipo === "AGRUPADOR" || !menu.ruta)

              return (
                <tr key={menu.id} className="group hover:bg-accent/40 transition-colors">
                  <td className="px-2.5 py-1 sm:px-3 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      {menu.icono ? (
                        <div
                          className="flex size-6 items-center justify-center rounded-md bg-muted border border-border/60 text-muted-foreground shrink-0 shadow-2xs"
                          style={menu.color ? { color: menu.color, borderColor: `${menu.color}33`, backgroundColor: `${menu.color}15` } : undefined}
                        >
                          <DynamicLucideIcon name={menu.icono} className="size-3" />
                        </div>
                      ) : null}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onQuickView(menu.id)}
                          className="font-medium text-foreground hover:text-primary transition-colors text-left whitespace-nowrap cursor-pointer"
                        >
                          {menu.nombre}
                        </button>
                        {menu.badge && (
                          <span className="rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-1 py-0.2 text-[9px] font-semibold shrink-0">
                            {menu.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-2.5 py-1 sm:px-3 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-muted px-1.5 py-0.2 text-muted-foreground border border-border/40 text-[10px] shrink-0">
                        {menu.codigo}
                      </code>
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-medium border shrink-0",
                          isFolder
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
                        )}
                      >
                        {isFolder ? "Carpeta" : "Interfaz"}
                      </span>
                    </div>
                  </td>

                  <td className="px-2.5 py-1 sm:px-3 text-xs text-muted-foreground">
                    {menu.ruta ? (
                      <span className="flex items-center gap-1 font-mono text-[11px] whitespace-nowrap">
                        <LinkIcon className="size-2.5 shrink-0 opacity-60" />
                        <span>{menu.ruta}</span>
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/60 text-[11px]">
                        —
                      </span>
                    )}
                  </td>

                  <td className="hidden px-2.5 py-1 md:table-cell sm:px-3 text-xs text-muted-foreground">
                    {parent ? (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <code className="rounded bg-muted px-1 py-0.2 font-mono text-[9.5px] text-muted-foreground shrink-0">
                          {parent.codigo}
                        </code>
                        <span>{parent.nombre}</span>
                      </div>
                    ) : (
                      <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9.5px] font-medium text-primary">
                        Raíz
                      </span>
                    )}
                  </td>

                  {/* Permisos Column */}
                  <td className="hidden lg:table-cell px-2.5 py-1 text-center sm:px-3">
                    {onManagePermisos ? (
                      <button
                        type="button"
                        onClick={() => onManagePermisos(menu)}
                        title="Gestionar permisos de este menú"
                        className={cn(
                          "inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[10px] font-mono transition-all cursor-pointer border",
                          permisosCount > 0
                            ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                            : "bg-muted text-muted-foreground/70 border-border/50 hover:bg-muted/80 hover:text-foreground",
                        )}
                      >
                        <KeyRound className="size-2.5" />
                        <span>{permisosCount}</span>
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {permisosCount}
                      </span>
                    )}
                  </td>

                  <td className="px-2.5 py-1 sm:px-3 text-center font-mono text-xs">
                    {menu.orden}
                  </td>

                  <td className="px-2.5 py-1 sm:px-3 text-center">
                    <Badge
                      variant={menu.activo ? "default" : "outline"}
                      className={
                        menu.activo
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9.5px] py-0 px-1.5"
                          : "text-destructive border-destructive/40 text-[9.5px] py-0 px-1.5"
                      }
                    >
                      {menu.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>

                  <td className="px-2.5 py-1 sm:px-3 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {onManagePermisos && (
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          title="Gestionar permisos"
                          onClick={() => onManagePermisos(menu)}
                          className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <KeyRound className="size-3" />
                        </Button>
                      )}

                      <Button
                        size="icon-xs"
                        variant="ghost"
                        title="Ver detalles"
                        onClick={() => onQuickView(menu.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Eye className="size-3" />
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
