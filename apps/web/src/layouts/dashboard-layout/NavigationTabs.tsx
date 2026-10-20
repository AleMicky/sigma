import { createElement, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  Activity,
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
  type LucideIcon,
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

import { useAuthStore } from "@/app/store/auth.store"
import { useAllowedNavItems } from "@/shared/hooks/use-allowed-nav-items"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"
import {
  computeOtherTabs,
  DEFAULT_HOME_TAB,
  getNextTabPathAfterClose,
  isFormOrTransientPath,
  loadInitialTabs,
  type NavTabItem,
  resolveTabInfo,
  saveTabsToStorage,
  syncTabsOnPathChange,
} from "./navigation-tabs.utils"
import type { NavSection } from "@/shared/types/nav.types"

interface TabIconRule {
  readonly keywords: readonly string[]
  readonly icon: LucideIcon
}

const TAB_ICON_RULES: readonly TabIconRule[] = [
  { keywords: ["gestion-vehicular", "vehicul", "conductor"], icon: Car },
  { keywords: ["aprobaciones"], icon: ShieldCheck },
  { keywords: ["encargado"], icon: UserCheck },
  { keywords: ["supervisor"], icon: UserCog },
  { keywords: ["solicitudes"], icon: FileText },
  { keywords: ["ordenes-trabajo", "ots"], icon: CheckSquare },
  { keywords: ["actividades"], icon: ListTodo },
  { keywords: ["tipos-mantenimiento", "mantenimientos"], icon: Wrench },
  { keywords: ["controles-activos"], icon: FileCheck },
  { keywords: ["prioridades"], icon: ShieldAlert },
  { keywords: ["tipos-activo", "activos"], icon: Boxes },
  { keywords: ["consulta-documentos"], icon: FileSpreadsheet },
  { keywords: ["inventarios", "insumo"], icon: Package },
  { keywords: ["estados-operativos"], icon: Activity },
  { keywords: ["accesorios", "categorias"], icon: Tags },
  { keywords: ["empleados"], icon: UserCheck },
  { keywords: ["personas"], icon: Users },
  { keywords: ["cargos"], icon: Briefcase },
  { keywords: ["areas", "organizacion"], icon: Building2 },
  { keywords: ["ubicaciones"], icon: MapPin },
  { keywords: ["unidades-medida"], icon: Ruler },
  { keywords: ["usuarios"], icon: Users },
  { keywords: ["roles"], icon: Shield },
  { keywords: ["permisos"], icon: Key },
  { keywords: ["menus"], icon: FolderTree },
  { keywords: ["parametros", "gestion"], icon: Settings2 },
  { keywords: ["catalogo"], icon: LayoutGrid },
  { keywords: ["perfil"], icon: UserRound },
]

/**
 * Infiere un icono exacto representativo según el segmento de ruta o título
 */
function resolveTabIcon(pathname: string): LucideIcon {
  const p = pathname.toLowerCase()

  if (!p || p === "/") {
    return Home
  }

  const match = TAB_ICON_RULES.find((rule) =>
    rule.keywords.some((keyword) => p.includes(keyword)),
  )

  return match?.icon ?? FolderTree
}

function scrollActiveTabIntoView(container: HTMLDivElement | null): void {
  const activeEl = container?.querySelector<HTMLElement>(`[data-tab-active="true"]`)
  activeEl?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  })
}

interface NavigationTabItemProps {
  readonly tab: NavTabItem
  readonly isActive: boolean
  readonly canClose: boolean
  readonly navItems?: readonly NavSection[]
  readonly onClose: (e: React.MouseEvent, tab: NavTabItem) => void
}

function NavigationTabItem({
  tab,
  isActive,
  canClose,
  navItems,
  onClose,
}: NavigationTabItemProps) {
  const tabInfo = resolveTabInfo(tab.pathname, navItems as NavSection[] | undefined)
  const tabTitle = tabInfo.title || tab.title
  const tabColor = tabInfo.color || tab.color

  const activeStyle =
    isActive && tabColor
      ? {
          borderColor: `${tabColor}40`,
          backgroundColor: `${tabColor}10`,
        }
      : undefined

  return (
    <Link
      to={tab.pathname}
      data-tab-active={isActive}
      className={cn(
        "group relative flex h-6.5 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium transition-all border select-none",
        isActive
          ? "bg-background text-foreground border-border shadow-2xs font-semibold"
          : "bg-transparent text-muted-foreground border-transparent hover:bg-background/60 hover:text-foreground",
      )}
      style={activeStyle}
    >
      {/* Indicador de color: dot sutil */}
      {tabColor ? (
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0 transition-transform duration-200",
            isActive ? "scale-110 ring-1 ring-background" : "opacity-75 group-hover:opacity-100",
          )}
          style={{ backgroundColor: tabColor }}
        />
      ) : null}

      {createElement(resolveTabIcon(tab.pathname), {
        className: cn(
          "size-3 shrink-0 transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground/70 group-hover:text-foreground",
        ),
        style: tabColor ? { color: tabColor } : undefined,
      })}

      <span className="truncate max-w-36 tracking-tight">{tabTitle}</span>

      {/* Botón cerrar pestaña individual */}
      {canClose && (
        <button
          type="button"
          onClick={(e) => onClose(e, tab)}
          className="size-3.5 shrink-0 rounded flex items-center justify-center text-muted-foreground/60 opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive transition-all ml-0.5"
          title="Cerrar pestaña"
        >
          <X className="size-2.5" />
        </button>
      )}
    </Link>
  )
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
    setTabs((currentTabs) => syncTabsOnPathChange(currentTabs, pathname, navItems))
  }

  // Guardar en sessionStorage para el usuario actual
  useEffect(() => {
    saveTabsToStorage(userId, tabs)
  }, [tabs, userId])

  // Auto-scroll a la pestaña activa
  useEffect(() => {
    scrollActiveTabIntoView(scrollContainerRef.current)
  }, [pathname])

  function closeTab(e: React.MouseEvent, tabToClose: NavTabItem) {
    e.preventDefault()
    e.stopPropagation()

    if (tabs.length <= 1) return

    const newTabs = tabs.filter((t) => t.id !== tabToClose.id)
    setTabs(newTabs)

    if (pathname === tabToClose.pathname) {
      const nextPath = getNextTabPathAfterClose(tabs, newTabs, tabToClose.id)
      if (nextPath) {
        void navigate({ to: nextPath })
      }
    }
  }

  function closeOtherTabs() {
    setTabs(computeOtherTabs(tabs, pathname, navItems))
  }

  function closeAllTabs() {
    setTabs([DEFAULT_HOME_TAB])
    void navigate({ to: "/" })
  }

  function scroll(direction: "left" | "right") {
    const offset = direction === "left" ? -150 : 150
    scrollContainerRef.current?.scrollBy({ left: offset, behavior: "smooth" })
  }

  if (isFormPage) {
    return null
  }

  const isCloseAllDisabled = tabs.length <= 1 && pathname === "/"

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
        {tabs.map((tab) => (
          <NavigationTabItem
            key={tab.id}
            tab={tab}
            isActive={pathname === tab.pathname}
            canClose={tab.pathname !== "/" && tabs.length > 1}
            navItems={navItems}
            onClose={closeTab}
          />
        ))}
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
              disabled={isCloseAllDisabled}
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

