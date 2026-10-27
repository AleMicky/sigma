import { formatSegment } from "./breadcrumb.utils"
import type { NavNode, NavSection } from "@/shared/types/nav.types"

export interface NavTabItem {
  id: string
  pathname: string
  title: string
  color?: string | null
}

export const STORAGE_KEY = "sigma_recent_nav_tabs"
export const MAX_TABS = 10

export function getStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
}

export const PATH_TITLES: Record<string, string> = {
  "/": "Inicio",
  "/activos": "Activos",
  "/activos/registro-activo": "Registro de Activos",
  "/activos/catalogo": "Catálogo de Activos",
  "/activos/consulta-documentos": "Consulta de Documentos",
  "/activos/disponibilidad": "Disponibilidad y Estados",
  "/activos/configuraciones": "Configuraciones de Activos",
  "/activos/configuraciones/tipos-activo": "Tipos de Activo",
  "/activos/configuraciones/categorias-activos": "Categorías de Activo",
  "/activos/configuraciones/accesorios": "Accesorios",
  "/activos/configuraciones/tipos-documento": "Tipos de Documento",
  "/activos/configuraciones/estados-operativos": "Estados Operativos",
  "/tipos-activo": "Tipos de Activo",
  "/categorias": "Categorías",
  "/accesorios": "Accesorios",
  "/tipos-documento": "Tipos de Documento",
  "/estados-operativos": "Estados Operativos",
  "/inventarios": "Inventarios",
  "/inventarios/tipos-insumo": "Tipos de Insumo",
  "/inventarios/categorias": "Categorías de Insumo",
  "/mantenimientos": "Mantenimientos",
  "/mantenimientos/solicitudes": "Solicitudes de Mantenimiento",
  "/mantenimientos/aprobaciones": "Aprobaciones",
  "/mantenimientos/encargado": "Encargado de Mantenimiento",
  "/mantenimientos/supervisor": "Supervisor de Mantenimiento",
  "/mantenimientos/ordenes-trabajo": "Órdenes de Trabajo",
  "/mantenimientos/actividades": "Actividades",
  "/mantenimientos/planes-mantenimiento": "Planes de Mantenimiento",
  "/mantenimientos/tipos-mantenimiento": "Tipos de Mantenimiento",
  "/mantenimientos/prioridades": "Prioridades",
  "/mantenimientos/controles-activos": "Controles de Activos",
  "/mantenimientos/programaciones-mantenimiento": "Programaciones de Mantenimiento",
  "/gestion-vehicular": "Gestión Vehicular",
  "/gestion-vehicular/dashboard-gestion-vehicular": "Dashboard Vehicular",
  "/gestion-vehicular/solicitudes": "Solicitudes de Vehículos",
  "/gestion-vehicular/asignaciones": "Asignación Vehicular",
  "/gestion-vehicular/salidas": "Salidas Vehiculares",
  "/gestion-vehicular/mis-viajes": "Mis Viajes",
  "/gestion-vehicular/calendario-reservas": "Calendario de Reservas",
  "/gestion-vehicular/configuraciones/conductores": "Conductores",
  "/gestion-vehicular/configuraciones/flotas": "Flotas Vehiculares",
  "/gestion-vehicular/configuraciones/tipos-solicitud": "Tipos de Solicitud",
  "/gestion-vehicular/reportes/bitacora": "Bitácora Vehicular",
  "/gestion-vehicular/reportes/consumo-combustible": "Consumo de Combustible",
  "/gestion-vehicular/reportes/historial-viajes": "Historial de Viajes",
  "/gestion-vehicular/reportes/salidas-vehiculares": "Reporte de Salidas Vehiculares",
  "/gestion-vehicular/controles-activos/nuevo": "Control de Activo Vehicular",
  "/organizacion": "Organización",
  "/organizacion/empleados": "Empleados",
  "/organizacion/personas": "Personas",
  "/organizacion/cargos": "Cargos",
  "/organizacion/areas": "Áreas",
  "/organizacion/responsabilidades": "Responsabilidades",
  "/organizacion/grupos-aprobadores": "Grupos Aprobadores",
  "/organizacion/migraciones": "Logs de Migración",
  "/parametros": "Parámetros",
  "/parametros/gestion": "Gestión de Parámetros",
  "/parametros/catalogos": "Catálogos",
  "/parametros/tipos-dato": "Tipos de Datos",
  "/parametros/ubicaciones": "Ubicaciones",
  "/parametros/unidades-medida": "Unidades de Medida",
  "/seguridad": "Seguridad",
  "/seguridad/usuarios": "Usuarios",
  "/seguridad/roles": "Roles",
  "/seguridad/menus": "Menús",
  "/seguridad/permisos": "Permisos",
  "/perfil": "Mi Perfil",
}

export function findNavNode(
  nodes: (NavSection | NavNode)[],
  targetPath: string,
  parentColor?: string | null,
): { title: string; color?: string | null } | null {
  for (const node of nodes) {
    const currentColor = node.color || parentColor
    if (node.to && node.to.toLowerCase() === targetPath.toLowerCase()) {
      return { title: node.title, color: currentColor }
    }
    if (node.children && node.children.length > 0) {
      const found = findNavNode(node.children, targetPath, currentColor)
      if (found) return found
    }
  }
  return null
}

export function resolveTabInfo(
  pathname: string,
  navItems?: NavSection[],
): { title: string; color?: string | null } {
  if (!pathname || pathname === "/") return { title: "Inicio", color: "#3B82F6" }

  if (navItems && navItems.length > 0) {
    const found = findNavNode(navItems, pathname)
    if (found) return found
  }

  if (PATH_TITLES[pathname]) {
    return { title: PATH_TITLES[pathname], color: null }
  }

  const segments = pathname.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1] || "Inicio"
  return { title: formatSegment(lastSegment), color: null }
}

export function resolveTabTitle(pathname: string, navItems?: NavSection[]): string {
  return resolveTabInfo(pathname, navItems).title
}

/**
 * Detecta si una ruta corresponde a un formulario, edición, creación o vista transitoria.
 * Al salir de estas vistas, la pestaña se retira del historial para evitar confusiones.
 */
export function isFormOrTransientPath(pathname: string): boolean {
  if (!pathname || pathname === "/") return false

  const cleanPath = pathname.toLowerCase().trim()
  const segments = cleanPath.split("/").filter(Boolean)

  const formKeywords = [
    "nuevo",
    "nueva",
    "new",
    "crear",
    "create",
    "editar",
    "edit",
    "modificar",
    "form",
    "formulario",
    "registro",
    "wizard",
    "asistente",
  ]

  // Verifica si algún segmento coincide con una palabra clave de formulario
  const hasFormKeyword = segments.some((segment) =>
    formKeywords.some(
      (keyword) =>
        segment === keyword ||
        segment.startsWith(`${keyword}-`) ||
        segment.endsWith(`-${keyword}`),
    ),
  )

  if (hasFormKeyword) return true

  // Si termina en un identificador numérico o UUID en subrutas de acción
  const lastSegment = segments[segments.length - 1]
  const isIdSegment =
    /^[0-9]+$/.test(lastSegment) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment)

  if (isIdSegment && segments.length > 2) {
    return true
  }

  return false
}

export const DEFAULT_HOME_TAB: NavTabItem = {
  id: "/",
  pathname: "/",
  title: "Inicio",
  color: "#3B82F6",
}

export function loadInitialTabs(userId?: string | null): NavTabItem[] {
  try {
    if (typeof sessionStorage !== "undefined") {
      const storageKey = getStorageKey(userId)
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as NavTabItem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtrar cualquier ruta de formulario previa guardada y actualizar títulos/colores
          const filtered = parsed
            .filter((t) => t.pathname === "/" || !isFormOrTransientPath(t.pathname))
            .map((t) => {
              const info = resolveTabInfo(t.pathname)
              return {
                ...t,
                title: t.title || info.title,
                color: t.color || info.color,
              }
            })
          if (filtered.length > 0) return filtered
        }
      }
    }
  } catch {
    // Ignorar errores de parsing
  }
  return [DEFAULT_HOME_TAB]
}

export function saveTabsToStorage(
  userId: string | null | undefined,
  tabs: readonly NavTabItem[],
): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      const storageKey = getStorageKey(userId)
      sessionStorage.setItem(storageKey, JSON.stringify(tabs))
    }
  } catch {
    // Ignorar
  }
}

export function trimTabsToLimit(tabs: readonly NavTabItem[]): NavTabItem[] {
  if (tabs.length <= MAX_TABS) {
    return [...tabs]
  }
  const first = tabs.find((t) => t.pathname === "/")
  const rest = tabs.filter((t) => t.pathname !== "/").slice(-MAX_TABS + 1)
  return first ? [first, ...rest] : rest
}

export function syncTabsOnPathChange(
  tabs: readonly NavTabItem[],
  pathname: string,
  navItems?: readonly NavSection[] | NavSection[],
): NavTabItem[] {
  if (!pathname || pathname === "/login" || pathname === "/auth/callback") {
    return [...tabs]
  }

  const baseCleanTabs = tabs.filter((tab) => !isFormOrTransientPath(tab.pathname))

  if (isFormOrTransientPath(pathname)) {
    return baseCleanTabs.length > 0 ? baseCleanTabs : [DEFAULT_HOME_TAB]
  }

  const exists = baseCleanTabs.some((tab) => tab.pathname === pathname)
  if (exists) {
    return baseCleanTabs
  }

  const { title, color } = resolveTabInfo(pathname, navItems as NavSection[] | undefined)
  const newTab: NavTabItem = {
    id: pathname,
    pathname,
    title,
    color,
  }

  return trimTabsToLimit([...baseCleanTabs, newTab])
}

export function computeOtherTabs(
  tabs: readonly NavTabItem[],
  pathname: string,
  navItems?: readonly NavSection[] | NavSection[],
): NavTabItem[] {
  const currentInfo = resolveTabInfo(pathname, navItems as NavSection[] | undefined)
  const currentTab = tabs.find((t) => t.pathname === pathname) ?? {
    id: pathname,
    pathname,
    title: currentInfo.title,
    color: currentInfo.color,
  }
  const homeTab = tabs.find((t) => t.pathname === "/") ?? DEFAULT_HOME_TAB

  return homeTab.pathname !== currentTab.pathname
    ? [homeTab, currentTab]
    : [currentTab]
}

export function getNextTabPathAfterClose(
  tabs: readonly NavTabItem[],
  newTabs: readonly NavTabItem[],
  closedTabId: string,
): string | null {
  const closingIndex = tabs.findIndex((t) => t.id === closedTabId)
  const nextTab = newTabs[Math.max(0, closingIndex - 1)] ?? newTabs[0]
  return nextTab?.pathname ?? null
}

