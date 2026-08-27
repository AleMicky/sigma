import { Eye, KeyRound, Mail, Shield, UserCheck, UserX } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import type { Usuario } from "../api/usuario.service"

type UsuarioListItemProps = {
  usuario: Usuario
  onSelect: (usuario: Usuario) => void
}

export function UsuarioListItem({ usuario, onSelect }: UsuarioListItemProps) {
  const initials = usuario.nombre
    ? usuario.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : usuario.username.slice(0, 2).toUpperCase()

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-3 transition-colors hover:bg-muted/40">
      {/* Información del Usuario */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar / Iniciales */}
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold font-heading">
          {initials}
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background ${
              usuario.activo ? "bg-emerald-500" : "bg-destructive"
            }`}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          {/* Nombre y Username */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => onSelect(usuario)}
                className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {usuario.nombre || usuario.username}
              </button>
              <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                @{usuario.username}
              </code>
            </div>

            {/* Email */}
            {usuario.email ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{usuario.email}</span>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic">
                Sin correo electrónico
              </span>
            )}
          </div>

          {/* Roles Badges */}
          {usuario.roles && usuario.roles.length > 0 ? (
            <div className="hidden md:flex items-center gap-1.5 flex-wrap">
              {usuario.roles.slice(0, 2).map((rol) => (
                <Badge
                  key={rol}
                  variant="secondary"
                  className="gap-1 font-mono text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
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
            <span className="hidden lg:inline text-[11px] text-muted-foreground/40 italic">
              Sin roles
            </span>
          )}

          {/* Keycloak User ID Badge */}
          <div className="hidden 2xl:flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/50 rounded-md px-2 py-0.5 border border-border/40">
            <KeyRound className="size-3 text-primary/70 shrink-0" />
            <span className="truncate max-w-[140px]">
              {usuario.keycloakUserId}
            </span>
          </div>
        </div>
      </div>

      {/* Estado, Auditoría y Botón de Detalle */}
      <div className="flex shrink-0 items-center gap-3">
        <Badge
          variant={usuario.activo ? "default" : "destructive"}
          className="gap-1 text-[11px] font-medium hidden sm:inline-flex"
        >
          {usuario.activo ? (
            <>
              <UserCheck className="size-3" />
              <span>Activo</span>
            </>
          ) : (
            <>
              <UserX className="size-3" />
              <span>Inactivo</span>
            </>
          )}
        </Badge>

        <AuditInfo
          data={usuario}
          compact
          className="hidden md:inline-block max-w-[180px] text-right text-[11px]"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSelect(usuario)}
          className="h-8 gap-1.5 border-border/80 hover:bg-muted text-xs font-medium cursor-pointer"
        >
          <Eye className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Detalle</span>
        </Button>
      </div>
    </li>
  )
}
