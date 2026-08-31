import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { useAuthStore } from "@/app/store/auth.store"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"

export type RoleScope = "ALL" | "MINE"

export function useSolicitudRoleScope(initialScope?: RoleScope) {
  const user = useAuthStore((state) => state.user)

  const isAdmin = useMemo(() => {
    return Boolean(
      user?.roles?.some((r) => {
        const ro = (r ?? "").toUpperCase()
        return (
          ro === "ADMIN" ||
          ro === "ROLE_ADMIN" ||
          ro === "SUPERADMIN" ||
          ro === "ROLE_SUPERADMIN"
        )
      }),
    )
  }, [user?.roles])

  const [scope, setScope] = useState<RoleScope>(
    initialScope ?? (isAdmin ? "ALL" : "MINE"),
  )

  const misEmpleadosQuery = useQuery({
    ...empleadoQueries.misEmpleados({ size: 100 }),
    enabled: Boolean(user),
  })

  const misEmpleados = useMemo(
    () => misEmpleadosQuery.data?.content ?? [],
    [misEmpleadosQuery.data?.content],
  )

  const currentEmpleado = useMemo(
    () => misEmpleados[0] ?? null,
    [misEmpleados],
  )

  const misEmpleadoIds = useMemo(
    () => new Set(misEmpleados.map((e) => e.id)),
    [misEmpleados],
  )

  /**
   * Verifica si la solicitud pertenece al solicitante actual
   */
  function isSolicitantePropio(solicitud: SolicitudMantenimiento): boolean {
    if (!solicitud.solicitante) return false
    if (misEmpleadoIds.has(solicitud.solicitante.id)) return true
    if (user?.name && solicitud.solicitante.nombre.toLowerCase().includes(user.name.toLowerCase())) {
      return true
    }
    return false
  }

  /**
   * Verifica si la solicitud está asignada al encargado / técnico actual
   */
  function isEncargadoPropio(solicitud: SolicitudMantenimiento): boolean {
    if (!solicitud.responsable) return false
    if (misEmpleadoIds.has(solicitud.responsable.id)) return true
    if (user?.name && solicitud.responsable.nombre.toLowerCase().includes(user.name.toLowerCase())) {
      return true
    }
    return false
  }

  return {
    user,
    isAdmin,
    scope,
    setScope,
    isMineOnly: !isAdmin || scope === "MINE",
    currentEmpleado,
    misEmpleados,
    misEmpleadoIds,
    isLoadingEmpleado: misEmpleadosQuery.isLoading,
    isSolicitantePropio,
    isEncargadoPropio,
  }
}
