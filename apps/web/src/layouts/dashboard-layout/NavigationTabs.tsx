import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  Boxes,
  Briefcase,
  Building2,
  Car,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Home,
  Key,
  Layers,
  LayoutGrid,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Package,
  Ruler,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tags,
  UserCheck,
  UserCog,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react"

import { formatSegment } from "./breadcrumb.utils"
import { useAuthStore } from "@/app/store/auth.store"
import { useAllowedNavItems } from "@/shared/hooks/use-allowed-nav-items"
import type { NavNode, NavSection } from "@/shared/types/nav.types"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

export interface NavTabItem {
  id: string
  pathname: string
  title: string
}

const STORAGE_KEY = "sigma_recent_nav_tabs"
const MAX_TABS = 10

function getStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY
}

export const PATH_TITLES: Record<string, string> = {
  "/": "Inicio",
  "/activos": "Activos",
  "/activos/catalogo": "Catálogo de Activos",
  "/activos/consulta-documentos": "Consulta de Documentos",
  "/tipos-activo": "Tipos de Activo",
  "/tipos-activo/historial": "Historial de Tipos de Activo",
  "/categorias": "Categorías",
  "/accesorios": "Accesorios",
  "/tipos-documento": "Tipos de Documento",
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
  "/mantenimientos/tipos-mantenimiento": "Tipos de Mantenimiento",
  "/mantenimientos/prioridades": "Prioridades",
  "/mantenimientos/controles-activos": "Controles de Activos",
  "/gestion-vehicular": "Gestión Vehicular",
  "/gestion-vehicular/solicitudes": "Solicitudes de Vehículos",
  "/gestion-vehicular/conductores": "Conductores",
  "/gestion-vehicular/tipos-solicitud": "Tipos de Solicitud",
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
  "/perfil": "Mi Perfil",
}

function findTitleInNav(nodes: (NavSection | NavNode)[], targetPath: string): string | null {
  for (const node of nodes) {
    if (node.to && node.to.toLowerCase() === targetPath.toLowerCase()) {
      return node.title
    }
    if (node.children && node.children.length > 0) {
      const found = findTitleInNav(node.children, targetPath)
      if (found) return found
    }
  }
  return null
}

export function resolveTabTitle(pathname: string, navItems?: NavSection[]): string {
  if (!pathname || pathname === "/") return "Inicio"

  if (PATH_TITLES[pathname]) {
    return PATH_TITLES[pathname]
  }

  if (navItems && navItems.length > 0) {
    const navTitle = findTitleInNav(navItems, pathname)
    if (navTitle) return navTitle
  }

  const segments = pathname.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1] || "Inicio"
  return formatSegment(lastSegment)
}

/**
 * Detecta si una ruta corresponde a un formulario, edición, creación o vista transitoria.
 * Al salir de estas vistas, la pestaña se retira del historial para evitar confusiones.
 */
function isFormOrTransientPath(pathname: string): boolean {
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

function loadInitialTabs(userId?: string | null): NavTabItem[] {
  try {
    if (typeof sessionStorage !== "undefined") {
      const storageKey = getStorageKey(userId)
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as NavTabItem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filtrar cualquier ruta de formulario previa guardada y actualizar títulos
          const filtered = parsed
            .filter((t) => t.pathname === "/" || !isFormOrTransientPath(t.pathname))
            .map((t) => ({
              ...t,
              title: resolveTabTitle(t.pathname),
            }))
          if (filtered.length > 0) return filtered
        }
      }
    }
  } catch {
    // Ignorar errores de parsing
  }
  return [{ id: "/", pathname: "/", title: "Inicio" }]
}

/**
 * Infiere un icono exacto representativo según el segmento de ruta o título
 */
function resolveTabIcon(pathname: string) {
  const p = pathname.toLowerCase()

  if (p === "/" || p === "") return Home
  if (p.includes("gestion-vehicular") || p.includes("vehicul") || p.includes("conductor")) return Car
  if (p.includes("aprobaciones")) return ShieldCheck
  if (p.includes("encargado")) return UserCheck
  if (p.includes("supervisor")) return UserCog
  if (p.includes("solicitudes")) return FileText
  if (p.includes("ordenes-trabajo") || p.includes("ots")) return CheckSquare
  if (p.includes("actividades")) return ListTodo
  if (p.includes("tipos-mantenimiento") || p.includes("mantenimientos")) return Wrench
  if (p.includes("controles-activos")) return FileCheck
  if (p.includes("prioridades")) return ShieldAlert
  if (p.includes("tipos-activo") || p.includes("activos")) return Boxes
  if (p.includes("consulta-documentos")) return FileSpreadsheet
  if (p.includes("inventarios") || p.includes("insumo")) return Package
  if (p.includes("accesorios") || p.includes("categorias")) return Tags
  if (p.includes("empleados")) return UserCheck
  if (p.includes("personas")) return Users
  if (p.includes("cargos")) return Briefcase
  if (p.includes("areas") || p.includes("organizacion")) return Building2
  if (p.includes("ubicaciones")) return MapPin
  if (p.includes("unidades-medida")) return Ruler
  if (p.includes("usuarios")) return Users
  if (p.includes("roles")) return Shield
  if (p.includes("permisos")) return Key
  if (p.includes("menus")) return FolderTree
  if (p.includes("parametros") || p.includes("gestion")) return Settings2
  if (p.includes("catalogo")) return LayoutGrid
  if (p.includes("perfil")) return UserRound

  return FolderTree
}

export function NavigationTabs() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((state) => state.user)
  const { navItems } = useAllowedNavItems()
  const userId = user?.id

  const [tabs, setTabs] = useState<NavTabItem[]>(() => loadInitialTabs(userId))
  const [prevPathname, setPrevPathname] = useState(pathname)
  const [prevUserId, setPrevUserId] = useState(userId)

  const isFormPage = isFormOrTransientPath(pathname)

  // Resetear o sincronizar pestañas si cambia el usuario autenticado (cierre o cambio de sesión)
  if (prevUserId !== userId) {
    setPrevUserId(userId)
    setTabs(loadInitialTabs(userId))
  }

  // Sincronizar nueva pestaña al cambiar de ruta
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    if (pathname && pathname !== "/login" && pathname !== "/auth/callback") {
      // 1. Limpiar pestañas de formularios que hayan quedado guardadas
      const baseCleanTabs = tabs.filter(
        (tab) => !isFormOrTransientPath(tab.pathname),
      )

      if (!isFormPage) {
        const exists = baseCleanTabs.some((tab) => tab.pathname === pathname)
        if (!exists) {
          const title = resolveTabTitle(pathname, navItems)

          const newTab: NavTabItem = {
            id: pathname,
            pathname,
            title,
          }

          const updated = [...baseCleanTabs, newTab]
          if (updated.length > MAX_TABS) {
            const first = updated.find((t) => t.pathname === "/")
            const rest = updated.filter((t) => t.pathname !== "/").slice(-MAX_TABS + 1)
            setTabs(first ? [first, ...rest] : rest)
          } else {
            setTabs(updated)
          }
        } else {
          setTabs(baseCleanTabs)
        }
      } else {
        // En página de formulario, conservamos las pestañas limpias sin agregar el formulario
        setTabs(
          baseCleanTabs.length > 0
            ? baseCleanTabs
            : [{ id: "/", pathname: "/", title: "Inicio" }],
        )
      }
    }
  }


  // Guardar en sessionStorage para el usuario actual
  useEffect(() => {
    try {
      if (typeof sessionStorage !== "undefined") {
        const storageKey = getStorageKey(userId)
        sessionStorage.setItem(storageKey, JSON.stringify(tabs))
      }
    } catch {
      // Ignorar
    }
  }, [tabs, userId])

  // Auto-scroll a la pestaña activa
  useEffect(() => {
    if (!scrollContainerRef.current) return
    const activeEl = scrollContainerRef.current.querySelector<HTMLElement>(
      `[data-tab-active="true"]`,
    )
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [pathname])

  function closeTab(e: React.MouseEvent, tabToClose: NavTabItem) {
    e.preventDefault()
    e.stopPropagation()

    if (tabs.length <= 1) return

    const newTabs = tabs.filter((t) => t.id !== tabToClose.id)
    setTabs(newTabs)

    if (pathname === tabToClose.pathname) {
      const closingIndex = tabs.findIndex((t) => t.id === tabToClose.id)
      const nextTab = newTabs[Math.max(0, closingIndex - 1)] || newTabs[0]
      if (nextTab) {
        void navigate({ to: nextTab.pathname })
      }
    }
  }

  function closeOtherTabs() {
    const currentTab = tabs.find((t) => t.pathname === pathname) || {
      id: pathname,
      pathname,
      title: formatSegment(pathname.split("/").pop() || "Inicio"),
    }
    const homeTab = tabs.find((t) => t.pathname === "/")

    const newTabs =
      homeTab && homeTab.pathname !== currentTab.pathname
        ? [homeTab, currentTab]
        : [currentTab]

    setTabs(newTabs)
  }

  function closeAllTabs() {
    setTabs([{ id: "/", pathname: "/", title: "Inicio" }])
    void navigate({ to: "/" })
  }

  function scroll(direction: "left" | "right") {
    if (!scrollContainerRef.current) return
    const offset = direction === "left" ? -150 : 150
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" })
  }

  if (isFormPage) {
    return null
  }

  return (
    <div className="flex h-8.5 shrink-0 items-center justify-between border-b border-border/50 bg-muted/20 px-2 select-none">
      {/* Botón scroll izquierdo */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="hidden sm:flex size-5.5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors mr-1"
        title="Desplazar a la izquierda"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {/* Lista de pestañas con scroll horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none py-0.5"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.pathname
          const isHome = tab.pathname === "/"
          const Icon = resolveTabIcon(tab.pathname)
          const tabTitle = tab.title || resolveTabTitle(tab.pathname, navItems)

          return (
            <Link
              key={tab.id}
              to={tab.pathname}
              data-tab-active={isActive}
              className={cn(
                "group relative flex h-6.5 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium transition-colors border",
                isActive
                  ? "bg-background text-foreground border-border shadow-2xs font-semibold"
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-background/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-3 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/70 group-hover:text-foreground",
                )}
              />

              <span className="truncate max-w-36 tracking-tight">{tabTitle}</span>

              {/* Botón cerrar pestaña individual */}
              {!isHome && tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => closeTab(e, tab)}
                  className="size-3.5 shrink-0 rounded flex items-center justify-center text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-all ml-0.5"
                  title="Cerrar pestaña"
                >
                  <X className="size-2.5" />
                </button>
              )}
            </Link>
          )
        })}
      </div>

      {/* Botón scroll derecho y menú de acciones */}
      <div className="flex items-center gap-0.5 ml-1 shrink-0">
        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden sm:flex size-5.5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          title="Desplazar a la derecha"
        >
          <ChevronRight className="size-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-5.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                title="Opciones de pestañas"
              />
            }
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36 rounded-lg p-1 shadow-md text-xs">
            <DropdownMenuItem
              onClick={closeOtherTabs}
              disabled={tabs.length <= 1}
              className="rounded-md cursor-pointer py-1.5 text-xs"
            >
              <Layers className="size-3.5 mr-1.5 text-muted-foreground" />
              <span>Cerrar las demás</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={closeAllTabs}
              disabled={tabs.length <= 1 && pathname === "/"}
              className="rounded-md cursor-pointer py-1.5 text-xs text-destructive focus:text-destructive"
            >
              <X className="size-3.5 mr-1.5" />
              <span>Cerrar todas</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
