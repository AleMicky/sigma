import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type { AuthUser } from "@/app/router/router.context"
import { useAuthStore } from "@/app/store/auth.store"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"

export const ROLE_SCOPES = {
  ALL: "ALL",
  MINE: "MINE",
} as const

export type RoleScope = (typeof ROLE_SCOPES)[keyof typeof ROLE_SCOPES]

export const ADMIN_ROLE_CODES = ["ADMIN", "SUPERADMIN"] as const

/**
 * Normaliza y verifica si un rol o lista de roles posee privilegios de administrador.
 * Maneja prefijos como "ROLE_", "ROL_" o variaciones en mayúsculas/minúsculas.
 */
export function isUserAdmin(user: AuthUser | null | undefined): boolean {
  if (!user?.roles || user.roles.length === 0) return false

  return user.roles.some((role) => {
    const normalized = (role ?? "")
      .trim()
      .toUpperCase()
      .replace(/^(ROLE_|ROL_)/, "")
    return (ADMIN_ROLE_CODES as readonly string[]).includes(normalized)
  })
}

export function useSolicitudRoleScope(initialScope?: RoleScope) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = useMemo(() => isUserAdmin(user), [user])

  const [scope, setScope] = useState<RoleScope>(
    initialScope ?? (isAdmin ? ROLE_SCOPES.ALL : ROLE_SCOPES.MINE),
  )

  const misEmpleadosQuery = useQuery({
    ...empleadoQueries.misEmpleados({ size: 100 }),
    enabled: Boolean(user),
  })

  const fetchedEmpleados = useMemo(
    () => misEmpleadosQuery.data?.content ?? [],
    [misEmpleadosQuery.data?.content],
  )

  // En el backend, /mis-empleados devuelve todos los empleados si el usuario es Admin.
  // Si es Admin, identificamos su empleado específico (si tiene uno vinculado por nombre o usuario).
  // Si no es Admin, el endpoint ya viene filtrado por su personaId.
  const currentEmpleado = useMemo(() => {
    if (!fetchedEmpleados.length) return null

    if (!isAdmin) {
      return fetchedEmpleados[0] ?? null
    }

    if (!user) return null

    // Intenta encontrar el empleado correspondiente al admin
    return (
      fetchedEmpleados.find((e) => {
        const personaNombre = e.personaInfo?.nombreCompleto || e.personaNombreCompleto || ""
        return (
          (user.name && personaNombre.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
          (user.username && e.auditoria?.createdBy?.toLowerCase() === user.username.toLowerCase())
        )
      }) ?? null
    )
  }, [fetchedEmpleados, isAdmin, user])

  // Lista de empleados propios del usuario autenticado
  const misEmpleados = useMemo(() => {
    if (!isAdmin) return fetchedEmpleados
    return currentEmpleado ? [currentEmpleado] : []
  }, [fetchedEmpleados, isAdmin, currentEmpleado])

  const misEmpleadoIds = useMemo(
    () => new Set(misEmpleados.map((e) => e.id)),
    [misEmpleados],
  )

  /**
   * Verifica si la solicitud pertenece al usuario / solicitante actual.
   * Comprueba IDs de empleado propios y autor de creación en auditoría.
   */
  function isSolicitantePropio(solicitud: SolicitudMantenimiento): boolean {
    if (!solicitud) return false

    // 1. Coincidencia por ID de empleado solicitante
    if (solicitud.solicitante?.id && misEmpleadoIds.has(solicitud.solicitante.id)) {
      return true
    }

    // 2. Coincidencia por usuario de auditoría / creación
    const createdBy = solicitud.auditoria?.createdBy ?? (solicitud as { createdBy?: string }).createdBy
    if (user?.username && createdBy && createdBy.toLowerCase() === user.username.toLowerCase()) {
      return true
    }

    const createdById = solicitud.auditoria?.createdById ?? (solicitud as { createdById?: string }).createdById
    if (user?.id && createdById && createdById === user.id) {
      return true
    }

    return false
  }

  /**
   * Verifica si la solicitud está asignada como encargado / técnico al usuario actual.
   */
  function isEncargadoPropio(solicitud: SolicitudMantenimiento): boolean {
    if (!solicitud?.responsable?.id) return false
    return misEmpleadoIds.has(solicitud.responsable.id)
  }

  return {
    user,
    isAdmin,
    scope,
    setScope,
    isMineOnly: !isAdmin || scope === ROLE_SCOPES.MINE,
    currentEmpleado,
    misEmpleados,
    misEmpleadoIds,
    isLoadingEmpleado: misEmpleadosQuery.isLoading,
    isSolicitantePropio,
    isEncargadoPropio,
  }
}
