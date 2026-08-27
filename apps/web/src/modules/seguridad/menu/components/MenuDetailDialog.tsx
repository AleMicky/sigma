import { useMemo } from "react"
import {
  Calendar,
  CheckCircle2,
  FolderTree,
  Hash,
  Link as LinkIcon,
  Pencil,
  ShieldAlert,
  User,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { formatDateTime } from "@/shared/utils/date.utils"

import type { Menu } from "../api/menu.service"
import { DynamicLucideIcon } from "./DynamicLucideIcon"

type MenuDetailDialogProps = {
  menu: Menu | null
  open: boolean
  onOpenChange: (open: boolean) => void
  parentMenu?: Menu | null
  allMenus?: Menu[]
  onEdit?: (menu: Menu) => void
}

export function MenuDetailDialog({
  menu,
  open,
  onOpenChange,
  parentMenu,
  allMenus = [],
  onEdit,
}: MenuDetailDialogProps) {
  const hijos = useMemo(
    () =>
      menu
        ? allMenus
            .filter((m) => m.menuPadreId === menu.id)
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        : [],
    [allMenus, menu],
  )

  if (!menu) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden sm:max-w-xl">
        {/* Header with Icon */}
        <DialogHeader className="p-6 border-b bg-muted/20 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs font-mono font-bold">
                {menu.icono ? (
                  <DynamicLucideIcon name={menu.icono} className="size-6" />
                ) : (
                  <span className="text-base text-muted-foreground">Ø</span>
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {menu.nombre}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground pt-0.5">
                  Código: {menu.codigo}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant={menu.activo ? "default" : "outline"}
              className={
                menu.activo
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "text-destructive border-destructive/40"
              }
            >
              {menu.activo ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Activo
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ShieldAlert className="size-3" />
                  Inactivo
                </span>
              )}
            </Badge>
          </div>
        </DialogHeader>

        {/* Content Details */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* General Attributes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <FolderTree className="size-3 text-primary" />
                Nivel / Padre
              </span>
              <p className="text-xs font-medium truncate">
                {parentMenu ? (
                  <span className="font-semibold text-foreground">
                    {parentMenu.nombre} ({parentMenu.codigo})
                  </span>
                ) : (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-[11px]">
                    Módulo Raíz
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Hash className="size-3 text-primary" />
                Orden de Visualización
              </span>
              <p className="text-xs font-mono font-semibold text-foreground">
                Posición #{menu.orden}
              </p>
            </div>
          </div>

          {/* Ruta */}
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <LinkIcon className="size-3 text-primary" />
              Ruta en Aplicación
            </span>
            <p className="text-xs font-mono font-medium text-foreground truncate">
              {menu.ruta ? (
                <span className="text-primary hover:underline">{menu.ruta}</span>
              ) : (
                <span className="text-muted-foreground italic">
                  Sin ruta asignada (Contenedor de submenús)
                </span>
              )}
            </p>
          </div>

          {/* Submenús directos */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FolderTree className="size-3.5 text-primary" />
                Submenús Asociados
              </span>
              <span className="text-[11px] text-muted-foreground">
                {hijos.length} {hijos.length === 1 ? "hijo" : "hijos"}
              </span>
            </div>

            {hijos.length === 0 ? (
              <p className="text-xs italic text-muted-foreground pt-1">
                Este menú no tiene submenús directos.
              </p>
            ) : (
              <ul className="divide-y divide-border/50 rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
                {hijos.map((hijo) => (
                  <li
                    key={hijo.id}
                    className="flex items-center justify-between p-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <DynamicLucideIcon
                        name={hijo.icono ?? undefined}
                        className="size-3.5 text-muted-foreground shrink-0"
                      />
                      <span className="font-medium text-foreground truncate">
                        {hijo.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                        {hijo.codigo}
                      </code>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        #{hijo.orden}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Auditoría */}
          {menu.auditoria && (
            <div className="rounded-xl border border-border/70 bg-muted/10 p-3.5 space-y-2">
              <span className="text-xs font-semibold text-foreground">
                Información de Auditoría
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px]">
                    <User className="size-3" />
                    <span>Creado por:</span>
                    <span className="font-medium text-foreground">
                      {menu.auditoria.createdBy ?? "Sistema"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3" />
                    <span>Fecha creación:</span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(menu.auditoria.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px]">
                    <User className="size-3" />
                    <span>Modificado por:</span>
                    <span className="font-medium text-foreground">
                      {menu.auditoria.updatedBy ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="size-3" />
                    <span>Fecha modificación:</span>
                    <span className="font-medium text-foreground">
                      {menu.auditoria.updatedAt ? formatDateTime(menu.auditoria.updatedAt) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onOpenChange(false)
                onEdit(menu)
              }}
            >
              <Pencil className="size-3.5" />
              <span>Editar</span>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
