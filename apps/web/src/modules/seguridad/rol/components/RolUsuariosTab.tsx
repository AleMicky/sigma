import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ExternalLink,
  KeyRound,
  Mail,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react"
import { Link } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"
import type { Usuario } from "@/modules/seguridad/usuario/api/usuario.service"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

import { rolQueries } from "../api/rol.queries"
import type { Rol } from "../api/rol.service"

type RolUsuariosTabProps = {
  rol: Rol
}

export function RolUsuariosTab({ rol }: RolUsuariosTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const usuariosQuery = useQuery(rolQueries.usuarios(rol.id))
  const usuarios = usuariosQuery.data ?? []

  const filteredUsuarios = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return usuarios

    return usuarios.filter((u) => {
      return (
        u.nombre?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      )
    })
  }, [usuarios, searchQuery])

  const stats = useMemo(() => {
    const total = usuarios.length
    const activos = usuarios.filter((u) => u.activo).length
    const inactivos = usuarios.filter((u) => !u.activo).length
    return { total, activos, inactivos }
  }, [usuarios])

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      {/* Barra de herramientas / buscador */}
      <div className="shrink-0 px-3.5 py-2 border-b border-border/70 bg-card/60 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Buscador de usuarios */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, usuario (@) o correo…"
              className="pl-7 pr-7 text-xs h-7.5 bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Botón Refrescar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void usuariosQuery.refetch()}
            disabled={usuariosQuery.isFetching}
            className="h-7.5 px-2.5 text-xs gap-1 border-border/80 hover:bg-muted cursor-pointer shrink-0"
            title="Actualizar listado de usuarios"
          >
            <RefreshCw
              className={cn(
                "size-3 text-muted-foreground",
                usuariosQuery.isFetching && "animate-spin text-primary",
              )}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>

        {/* Resumen de métricas de usuarios */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {stats.total} {stats.total === 1 ? "usuario asignado" : "usuarios asignados"}
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {stats.activos} activos
            </span>
            {stats.inactivos > 0 && (
              <>
                <span>•</span>
                <span className="text-destructive">
                  {stats.inactivos} inactivos
                </span>
              </>
            )}
          </div>

          <Link
            to={routes.seguridad.usuarios}
            className="hidden sm:inline-flex items-center gap-1 text-[10.5px] text-primary hover:underline font-medium"
          >
            <span>Ir a módulo de usuarios</span>
            <ExternalLink className="size-2.5" />
          </Link>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 overscroll-contain">
        {usuariosQuery.isLoading ? (
          <div className="p-2">
            <ListSkeleton
              rows={5}
              rowClassName="h-16 rounded-xl"
              className="flex flex-col gap-2"
            />
          </div>
        ) : usuariosQuery.isError ? (
          <div className="p-6 text-center">
            <EmptyState
              icon={<Shield className="size-8 text-destructive/70" />}
              title="Error al cargar usuarios"
              description="No se pudieron obtener los usuarios asignados a este rol."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void usuariosQuery.refetch()}
                  className="gap-1 h-7 text-xs mt-2 cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  Reintentar
                </Button>
              }
            />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
            <Users className="size-8 stroke-1 text-muted-foreground/50" />
            <p className="text-xs font-semibold text-foreground">
              Sin usuarios asignados
            </p>
            <p className="text-[11px] text-muted-foreground/70 max-w-xs">
              Actualmente ningún usuario del sistema tiene asignado el rol{" "}
              <strong className="text-foreground">{rol.codigo}</strong> en Keycloak.
            </p>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
            <Search className="size-6 stroke-1 text-muted-foreground/50" />
            <p className="text-xs font-semibold text-foreground">
              Sin coincidencias
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Ningún usuario asignado coincide con &quot;{searchQuery}&quot;.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-7 text-xs gap-1 mt-1 cursor-pointer"
            >
              <X className="size-3" />
              <span>Limpiar búsqueda</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredUsuarios.map((usuario) => (
              <UsuarioItemCard key={usuario.id} usuario={usuario} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UsuarioItemCard({ usuario }: { usuario: Usuario }) {
  const initials = usuario.nombre
    ? usuario.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : usuario.username.slice(0, 2).toUpperCase()

  return (
    <div className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors shadow-2xs">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {/* Avatar con indicador de estado */}
        <div className="relative flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold font-heading">
          {initials}
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
              usuario.activo ? "bg-emerald-500" : "bg-destructive",
            )}
            title={usuario.activo ? "Usuario Activo" : "Usuario Inactivo"}
          />
        </div>

        {/* Datos Principales */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="truncate text-xs font-semibold text-foreground">
              {usuario.nombre || usuario.username}
            </span>
            <code className="shrink-0 rounded bg-muted px-1.5 py-0.2 font-mono text-[9.5px] text-muted-foreground">
              @{usuario.username}
            </code>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate mt-0.5">
            {usuario.email ? (
              <div className="flex items-center gap-1 truncate">
                <Mail className="size-2.5 shrink-0 opacity-70" />
                <span className="truncate">{usuario.email}</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/40 italic">
                Sin correo
              </span>
            )}

            {usuario.keycloakUserId && (
              <span className="hidden xl:inline-flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground/60">
                <KeyRound className="size-2.5 text-amber-500/70 shrink-0" />
                <span className="truncate max-w-[90px]">
                  {usuario.keycloakUserId}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Estado y Badge */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant={usuario.activo ? "outline" : "destructive"}
          className={cn(
            "text-[9.5px] py-0 px-1.5 font-medium h-4.5",
            usuario.activo &&
              "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
          )}
        >
          {usuario.activo ? (
            <UserCheck className="size-2.5 mr-0.5" />
          ) : (
            <UserX className="size-2.5 mr-0.5" />
          )}
          {usuario.activo ? "Activo" : "Inactivo"}
        </Badge>
      </div>
    </div>
  )
}
