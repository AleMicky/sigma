import { CheckCircle2, ChevronRight, KeyRound, Shield, XCircle } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

import type { Rol } from "../api/rol.service"
import { getFriendlyRoleName } from "../utils/rol.utils"

type RolMasterItemProps = {
  rol: Rol
  isSelected: boolean
  onSelect: (rol: Rol) => void
}

export function RolMasterItem({
  rol,
  isSelected,
  onSelect,
}: RolMasterItemProps) {
  const friendlyName = getFriendlyRoleName(rol)

  return (
    <button
      type="button"
      onClick={() => onSelect(rol)}
      className={cn(
        "group relative flex w-full items-center justify-between gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isSelected
          ? "border-primary/40 bg-gradient-to-r from-primary/[0.08] to-primary/[0.02] shadow-2xs ring-1 ring-primary/20 dark:from-primary/[0.15] dark:to-primary/[0.05]"
          : "border-border/60 bg-card/80 hover:border-border hover:bg-muted/50 dark:bg-card/40",
      )}
    >
      {/* Indicador de barra izquierda para item seleccionado */}
      {isSelected && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-primary" />
      )}

      {/* Contenido del Rol */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-0.5">
        {/* Icono con badge de estado */}
        <div
          className={cn(
            "relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150 shadow-2xs",
            isSelected
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 group-hover:scale-105",
          )}
        >
          <Shield className="size-4" />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background",
              rol.activo ? "bg-emerald-500" : "bg-destructive",
            )}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {/* Nombre Amigable y Código */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "truncate text-xs font-semibold tracking-tight transition-colors",
                isSelected ? "text-primary font-bold" : "text-foreground group-hover:text-primary",
              )}
            >
              {friendlyName}
            </span>
            <code
              className={cn(
                "shrink-0 rounded px-1 py-0.2 font-mono text-[9px] font-semibold transition-colors",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {rol.codigo}
            </code>
          </div>

          {/* Descripción o Keycloak Role ID */}
          <div className="flex items-center gap-1.5 min-w-0">
            {rol.descripcion ? (
              <p className="text-[10.5px] text-muted-foreground line-clamp-1 leading-tight">
                {rol.descripcion}
              </p>
            ) : rol.keycloakRoleId ? (
              <span className="flex items-center gap-1 text-[9.5px] text-muted-foreground/70 font-mono truncate">
                <KeyRound className="size-2.5 shrink-0 text-amber-500/80" />
                <span className="truncate max-w-[120px]">{rol.keycloakRoleId}</span>
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/40 italic">
                Sin descripción
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Flecha / Estado */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Badge
          variant={rol.activo ? "outline" : "destructive"}
          className={cn(
            "text-[9px] py-0 px-1 font-medium h-4 transition-colors",
            rol.activo && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
          )}
        >
          {rol.activo ? (
            <CheckCircle2 className="size-2 mr-0.5" />
          ) : (
            <XCircle className="size-2 mr-0.5" />
          )}
          <span>{rol.activo ? "Activo" : "Inactivo"}</span>
        </Badge>

        <ChevronRight
          className={cn(
            "size-3.5 transition-all duration-150",
            isSelected
              ? "text-primary translate-x-0.5"
              : "text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5",
          )}
        />
      </div>
    </button>
  )
}
