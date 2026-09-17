import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  Boxes,
  Briefcase,
  Building2,
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

/**
 * Infiere un icono exacto representativo según el segmento de ruta o título
 */
function resolveTabIcon(pathname: string) {
  const p = pathname.toLowerCase()

  if (p === "/" || p === "") return Home
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

  const [tabs, setTabs] = useState<NavTabItem[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as NavTabItem[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Ignorar errores de parsing
    }
    return [{ id: "/", pathname: "/", title: "Inicio" }]
  })

  // Sincronizar nueva pestaña al cambiar de ruta
  useEffect(() => {
    if (!pathname || pathname === "/login" || pathname === "/auth/callback") return

    setTabs((prev) => {
      const exists = prev.some((tab) => tab.pathname === pathname)
      if (exists) return prev

      const segments = pathname.split("/").filter(Boolean)
      const lastSegment = segments[segments.length - 1] || "Inicio"
      const title = pathname === "/" ? "Inicio" : formatSegment(lastSegment)

      const newTab: NavTabItem = {
        id: pathname,
        pathname,
        title,
      }

      const updated = [...prev, newTab]
      if (updated.length > MAX_TABS) {
        const first = updated.find((t) => t.pathname === "/")
        const rest = updated.filter((t) => t.pathname !== "/").slice(-MAX_TABS + 1)
        return first ? [first, ...rest] : rest
      }

      return updated
    })
  }, [pathname])

  // Guardar en sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
    } catch {
      // Ignorar
    }
  }, [tabs])

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
        void navigate({ to: nextTab.pathname as any })
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

  return (
    <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 px-2 select-none">
      {/* Botón scroll izquierdo */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="hidden sm:flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors mr-1"
        title="Desplazar a la izquierda"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {/* Lista de pestañas con scroll horizontal */}
      <div
        ref={scrollContainerRef}
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none py-1"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.pathname
          const isHome = tab.pathname === "/"
          const Icon = resolveTabIcon(tab.pathname)

          return (
            <Link
              key={tab.id}
              to={tab.pathname as any}
              data-tab-active={isActive}
              className={cn(
                "group relative flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 border",
                isActive
                  ? "bg-background text-primary border-border/80 shadow-2xs font-semibold ring-1 ring-primary/20"
                  : "bg-background/40 text-muted-foreground border-transparent hover:bg-background/80 hover:text-foreground hover:border-border/40",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground",
                )}
              />

              <span className="truncate max-w-36">{tab.title}</span>

              {/* Botón cerrar pestaña individual */}
              {!isHome && tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => closeTab(e, tab)}
                  className="size-4 shrink-0 rounded-md flex items-center justify-center text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-destructive transition-all ml-0.5"
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
      <div className="flex items-center gap-1 ml-1.5 shrink-0">
        <button
          type="button"
          onClick={() => scroll("right")}
          className="hidden sm:flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
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
                className="size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Opciones de pestañas"
              />
            }
          >
            <MoreHorizontal className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40 rounded-xl p-1 shadow-lg text-xs">
            <DropdownMenuItem
              onClick={closeOtherTabs}
              disabled={tabs.length <= 1}
              className="rounded-lg cursor-pointer py-1.5"
            >
              <Layers className="size-3.5 mr-1.5 text-muted-foreground" />
              <span>Cerrar las demás</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={closeAllTabs}
              disabled={tabs.length <= 1 && pathname === "/"}
              className="rounded-lg cursor-pointer py-1.5 text-destructive focus:text-destructive"
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
