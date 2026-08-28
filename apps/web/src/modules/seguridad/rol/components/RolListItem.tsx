import { CheckCircle2, Eye, FolderTree, KeyRound, Shield, XCircle } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import type { Rol } from "../api/rol.service"

type RolListItemProps = {
  rol: Rol
  onSelect: (rol: Rol) => void
  onAssignMenus: (rol: Rol) => void
}

export function RolListItem({
  rol,
  onSelect,
  onAssignMenus,
}: RolListItemProps) {
  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted/40">
      {/* Información del Rol */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Icono / Badge */}
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs">
          <Shield className="size-4.5" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background ${
              rol.activo ? "bg-emerald-500" : "bg-destructive"
            }`}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          {/* Nombre y Código */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => onSelect(rol)}
                className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {rol.nombre || rol.codigo}
              </button>
              <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground font-semibold">
                {rol.codigo}
              </code>
            </div>

            {/* Descripción */}
            {rol.descripcion ? (
              <p className="text-xs text-muted-foreground truncate max-w-[400px]">
                {rol.descripcion}
              </p>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic">
                Sin descripción
              </span>
            )}
          </div>

          {/* Keycloak Role ID Badge */}
          {rol.keycloakRoleId && (
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/50 rounded-md px-2 py-0.5 border border-border/40">
              <KeyRound className="size-3 text-amber-500/70 shrink-0" />
              <span className="truncate max-w-[140px]">
                {rol.keycloakRoleId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Estado, Auditoría y Acciones */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Badge
          variant={rol.activo ? "default" : "destructive"}
          className="gap-1 text-[11px] font-medium hidden sm:inline-flex"
        >
          {rol.activo ? (
            <>
              <CheckCircle2 className="size-3" />
              <span>Activo</span>
            </>
          ) : (
            <>
              <XCircle className="size-3" />
              <span>Inactivo</span>
            </>
          )}
        </Badge>

        <AuditInfo
          data={rol}
          compact
          className="hidden lg:inline-block max-w-[180px] text-right text-[11px]"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => onAssignMenus(rol)}
          className="h-8 gap-1.5 border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary text-xs font-medium cursor-pointer"
          title="Asignar o editar menús y accesos del rol"
        >
          <FolderTree className="size-3.5" />
          <span className="hidden sm:inline">Menús</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelect(rol)}
          className="h-8 gap-1.5 border-border/80 hover:bg-muted text-xs font-medium cursor-pointer"
        >
          <Eye className="size-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">Detalle</span>
        </Button>
      </div>
    </li>
  )
}
