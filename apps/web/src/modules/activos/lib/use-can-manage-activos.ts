import { useAuthStore } from "@/app/store/auth.store"
import { isAdminUser } from "@/shared/hooks/use-allowed-nav-items"

/**
 * REQ-BIZ-001: crear/editar/eliminar activos y catálogos exige `ROLE_ADMIN`;
 * las lecturas y operaciones diarias siguen disponibles para cualquier usuario
 * autenticado. Reutiliza el único mecanismo de roles de la app (JWT en el
 * store de auth + `isAdminUser`), sin inventar permisos nuevos.
 */
export function useCanManageActivos(): boolean {
  const roles = useAuthStore((state) => state.user?.roles)
  return isAdminUser(roles)
}
