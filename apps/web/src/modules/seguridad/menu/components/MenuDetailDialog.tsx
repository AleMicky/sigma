import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FolderTree,
  KeyRound,
  Layers,
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
}: Readonly<MenuDetailDialogProps>) {
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
      <DialogContent className="max-w-md p-0 overflow-hidden sm:max-w-lg">
        {/* Compact Header */}
        <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20"
                style={
                  menu.color
                    ? {
                        color: menu.color,
                        borderColor: `${menu.color}33`,
                        backgroundColor: `${menu.color}15`,
                      }
                    : undefined
                }
              >
                {menu.icono ? (
                  <DynamicLucideIcon name={menu.icono} className="size-5" />
                ) : (
                  <FolderTree className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-semibold truncate text-foreground">
                    {menu.nombre}
                  </DialogTitle>
                  {menu.badge && (
                    <span className="rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-1.5 py-0.2 text-[10px] font-semibold shrink-0">
                      {menu.badge}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span>{menu.codigo}</span>
                  <span>•</span>
                  <span>{menu.tipo ?? "ITEM"}</span>
                  <span>•</span>
                  <span>Posición #{menu.orden}</span>
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant={menu.activo ? "default" : "outline"}
              className={
                menu.activo
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0 text-xs py-0.5"
                  : "text-destructive border-destructive/40 shrink-0 text-xs py-0.5"
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

        {/* Compact Content */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[65vh] overflow-y-auto">
          {/* Optional Description */}
          {menu.descripcion && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-foreground/80">
              <span className="font-semibold text-foreground">Descripción: </span>
              {menu.descripcion}
            </div>
          )}

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Parent / Level */}
            <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5">
              <span className="text-[10.5px] font-medium text-muted-foreground flex items-center gap-1">
                <FolderTree className="size-3 text-primary" />
                Padre / Nivel
              </span>
              <p className="font-medium text-foreground truncate">
                {parentMenu ? (
                  <span title={`${parentMenu.nombre} (${parentMenu.codigo})`}>
                    {parentMenu.nombre}
                  </span>
                ) : (
                  <span className="text-primary font-semibold">Módulo Raíz</span>
                )}
              </p>
            </div>

            {/* Type & Structure */}
            <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-0.5">
              <span className="text-[10.5px] font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="size-3 text-primary" />
                Tipo / Estructura
              </span>
              <p className="font-semibold text-foreground truncate">
                {menu.tipo ?? "ITEM"}
                <span className="font-normal text-muted-foreground ml-1">
                  ({menu.esFolder ? "Carpeta" : "Interfaz"})
                </span>
              </p>
            </div>

            {/* Route & Accent Color */}
            <div className="col-span-2 rounded-lg border border-border/60 bg-card p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <LinkIcon className="size-3 text-primary shrink-0" />
                <span className="text-[10.5px] font-medium text-muted-foreground shrink-0">
                  Ruta:
                </span>
                <code className="text-[11px] font-mono text-foreground truncate">
                  {menu.ruta || (
                    <span className="text-muted-foreground italic font-sans">
                      Sin ruta (Contenedor)
                    </span>
                  )}
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {menu.color && (
                  <div className="flex items-center gap-1">
                    <span
                      className="size-2.5 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: menu.color }}
                    />
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      {menu.color}
                    </span>
                  </div>
                )}
                <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                  {menu.visibleEnMenu ? (
                    <>
                      <Eye className="size-3 text-emerald-500" /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3 text-amber-500" /> Oculto
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Associated API Permissions */}
          {permisos.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-muted-foreground" />
                Sin permisos de API vinculados
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
                  Asignar
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-primary" />
                  Permisos de API
                  <span className="rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.2">
                    {permisos.length}
                  </span>
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

              <ul className="divide-y divide-border/40 rounded-md border border-border/50 bg-muted/20 overflow-hidden max-h-36 overflow-y-auto">
                {permisos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between px-2.5 py-1.5 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <PermisoMethodBadge method={p.metodoHttp} size="sm" />
                      <span className="font-medium text-foreground truncate">
                        {p.nombre}
                      </span>
                    </div>
                    <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[130px]">
                      {p.ruta}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Child Submenus (only shown if present to keep view compact) */}
          {hijos.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FolderTree className="size-3.5 text-primary" />
                  Submenús Directos
                  <span className="rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.2">
                    {hijos.length}
                  </span>
                </span>
              </div>

              <ul className="divide-y divide-border/40 rounded-md border border-border/50 bg-muted/20 overflow-hidden max-h-32 overflow-y-auto">
                {hijos.map((hijo) => (
                  <li
                    key={hijo.id}
                    className="flex items-center justify-between px-2.5 py-1.5 text-xs gap-2"
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
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-muted-foreground">
                      <code className="bg-muted px-1.5 py-0.5 rounded">
                        {hijo.codigo}
                      </code>
                      <span>#{hijo.orden}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Compact Audit Footnote */}
          {menu.auditoria && (
            <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-[10.5px] text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <User className="size-3 text-muted-foreground" />
                <span>
                  Creado por{" "}
                  <strong className="text-foreground font-medium">
                    {menu.auditoria.createdBy ?? "Sistema"}
                  </strong>
                </span>
                <span>•</span>
                <span>{formatDateTime(menu.auditoria.createdAt)}</span>
              </div>
              {menu.auditoria.updatedAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground" />
                  <span>
                    Modificado por{" "}
                    <strong className="text-foreground font-medium">
                      {menu.auditoria.updatedBy ?? "Sistema"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>{formatDateTime(menu.auditoria.updatedAt)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <DialogFooter className="p-3 px-4 sm:px-5 border-t bg-muted/10 flex-row gap-2 justify-end">
          {onManagePermisos && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs cursor-pointer"
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
              className="h-8 gap-1.5 text-xs cursor-pointer"
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
            className="h-8 text-xs cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
