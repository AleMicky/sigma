import {
  Eye,
  IdCard,
  KeyRound,
  Mail,
  Shield,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import type { Usuario } from "../api/usuario.service"

type UsuarioListItemProps = {
  usuario: Usuario
  onSelect: (usuario: Usuario) => void
  onAssignPersona?: (usuario: Usuario) => void
}

export function UsuarioListItem({
  usuario,
  onSelect,
  onAssignPersona,
}: UsuarioListItemProps) {
  const initials = usuario.nombre
    ? usuario.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : usuario.username.slice(0, 2).toUpperCase()

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted/40 sm:px-4 sm:py-3.5">
      {/* Información del Usuario */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar / Iniciales con indicador de estado */}
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold font-heading ring-1 ring-primary/20 transition-transform group-hover:scale-105">
          <span>{initials}</span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background ${
              usuario.activo ? "bg-emerald-500" : "bg-destructive"
            }`}
            title={usuario.activo ? "Usuario Activo" : "Usuario Inactivo"}
          />
        </div>

        {/* Bloque de Información estructurado en 2 filas */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* Fila 1: Nombre + @username + Persona vinculada + Estado */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onSelect(usuario)}
              className="truncate text-left text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {usuario.nombre || usuario.username}
            </button>

            <code className="shrink-0 rounded-md border border-border/70 bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground/80">
              @{usuario.username}
            </code>

            {/* Persona Vinculada */}
            {usuario.persona ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-[220px] truncate"
                title={`Persona: ${usuario.persona.nombreCompleto} (${usuario.persona.tipoDocumento}: ${usuario.persona.numeroDocumento})`}
              >
                <IdCard className="size-3 shrink-0 opacity-80" />
                <span className="truncate">{usuario.persona.nombreCompleto}</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center text-[11px] text-muted-foreground/60 italic">
                <span className="opacity-40 mr-1.5">•</span>
                Sin persona vinculada
              </span>
            )}

            {/* Badge de Estado Activo/Inactivo */}
            <Badge
              variant={usuario.activo ? "secondary" : "destructive"}
              className={`h-5 text-[10px] px-1.5 gap-1 font-normal ${
                usuario.activo
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : ""
              }`}
            >
              {usuario.activo ? (
                <>
                  <UserCheck className="size-2.5" />
                  <span>Activo</span>
                </>
              ) : (
                <>
                  <UserX className="size-2.5" />
                  <span>Inactivo</span>
                </>
              )}
            </Badge>
          </div>

          {/* Fila 2: Email + Roles + Keycloak ID */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground min-w-0">
            {/* Email */}
            {usuario.email ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Mail className="size-3 shrink-0 opacity-70" />
                <span className="truncate max-w-[240px]">{usuario.email}</span>
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic">
                Sin correo
              </span>
            )}

            {/* Roles Badges */}
            {usuario.roles && usuario.roles.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {usuario.roles.slice(0, 2).map((rol) => (
                  <Badge
                    key={rol}
                    variant="outline"
                    className="gap-1 font-mono text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20"
                  >
                    <Shield className="size-2.5 shrink-0" />
                    <span>{rol}</span>
                  </Badge>
                ))}
                {usuario.roles.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground font-mono px-1.5 py-0"
                  >
                    +{usuario.roles.length - 2}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="hidden sm:inline text-[11px] text-muted-foreground/40 italic">
                Sin roles
              </span>
            )}

            {/* Keycloak User ID Badge */}
            {usuario.keycloakUserId && (
              <span className="hidden 2xl:inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 font-mono bg-muted/40 rounded px-1.5 py-0.5 border border-border/40">
                <KeyRound className="size-2.5 opacity-60" />
                <span className="truncate max-w-[140px]">
                  {usuario.keycloakUserId}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Auditoría y Botones de Acción con Tooltip */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <AuditInfo
          data={usuario}
          compact
          className="hidden xl:inline-block max-w-[180px] text-right text-[11px] mr-1"
        />

        <TooltipProvider>
          {/* Botón Vincular / Cambiar Persona */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="outline"
                  type="button"
                  onClick={() => onAssignPersona?.(usuario)}
                  className="size-8 text-muted-foreground hover:text-primary hover:border-primary/40 cursor-pointer"
                  aria-label={
                    usuario.persona
                      ? "Cambiar persona vinculada"
                      : "Vincular persona"
                  }
                >
                  {usuario.persona ? (
                    <IdCard className="size-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="top">
              <p>
                {usuario.persona
                  ? "Cambiar persona vinculada"
                  : "Vincular persona"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Botón Ver Detalle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="outline"
                  type="button"
                  onClick={() => onSelect(usuario)}
                  className="size-8 text-muted-foreground hover:text-primary hover:border-primary/40 cursor-pointer"
                  aria-label="Ver detalle del usuario"
                >
                  <Eye className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="top">
              <p>Ver detalle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </li>
  )
}
