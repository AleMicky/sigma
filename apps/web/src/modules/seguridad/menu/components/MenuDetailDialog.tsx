import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  CheckCircle2,
  FolderTree,
  Hash,
  KeyRound,
  Link as LinkIcon,
  Pencil,
  ShieldAlert,
  User,
} from "lucide-react"

import { permisoQueries } from "@/modules/seguridad/permiso/api/permiso.queries"
import { PermisoMethodBadge } from "@/modules/seguridad/permiso/components/PermisoMethodBadge"
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
  onManagePermisos?: (menu: Menu) => void
}

export function MenuDetailDialog({
  menu,
  open,
  onOpenChange,
  parentMenu,
  allMenus = [],
  onEdit,
  onManagePermisos,
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

  const permisosQuery = useQuery({
    ...permisoQueries.byMenu(menu?.id ?? ""),
    enabled: Boolean(menu?.id && open),
  })

  const permisos = permisosQuery.data ?? []

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

          {/* Permisos de API Asociados */}
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-primary" />
                Permisos de API Asociados
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {permisos.length} {permisos.length === 1 ? "permiso" : "permisos"}
                </span>
                {onManagePermisos && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={() => {
                      onOpenChange(false)
                      onManagePermisos(menu)
                    }}
                  >
                    Gestionar
                  </Button>
                )}
              </div>
            </div>

            {permisos.length === 0 ? (
              <p className="text-xs italic text-muted-foreground pt-1">
                No hay permisos de API registrados para este menú.
              </p>
            ) : (
              <ul className="divide-y divide-border/50 rounded-lg border border-border/60 bg-muted/20 overflow-hidden max-h-48 overflow-y-auto">
                {permisos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between p-2 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <PermisoMethodBadge method={p.metodoHttp} size="sm" />
                      <span className="font-medium text-foreground truncate">
                        {p.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[10.5px]">
                      <code className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[140px]">
                        {p.ruta}
                      </code>
                      {!p.activo && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1 border-destructive/40 text-destructive">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
          {onManagePermisos && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
              onClick={() => {
                onOpenChange(false)
                onManagePermisos(menu)
              }}
            >
              <KeyRound className="size-3.5 text-primary" />
              <span>Permisos</span>
            </Button>
          )}

          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
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
            className="cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
