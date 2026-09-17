import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import {
  Compass,
  Folder,
  Home,
  LogOut,
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react"

import { routes } from "@/app/config"
import { useLogout } from "@/modules/auth/api/auth.mutations"
import { useAllowedNavItems } from "@/shared/hooks/use-allowed-nav-items"
import type { NavNode, NavSection } from "@/shared/types/nav.types"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  category: "Navegación" | "Acciones Rápidas" | "Sistema"
  onSelect: () => void
}

function extractNavItems(
  sections: NavSection[],
  navigate: (opts: { to: string }) => void,
  onClose: () => void,
): CommandItem[] {
  const items: CommandItem[] = []

  function processNode(node: NavNode, pathPrefix: string) {
    if (node.to) {
      items.push({
        id: `nav-${node.id || node.to}`,
        title: node.title,
        subtitle: pathPrefix,
        icon: node.icon || Folder,
        category: "Navegación",
        onSelect: () => {
          onClose()
          void navigate({ to: node.to! })
        },
      })
    }
    if (node.children) {
      node.children.forEach((child) =>
        processNode(child, `${pathPrefix} › ${node.title}`),
      )
    }
  }

  sections.forEach((section) => {
    if (section.to && (!section.children || section.children.length === 0)) {
      items.push({
        id: `section-${section.id || section.to}`,
        title: section.title,
        subtitle: "Módulo Principal",
        icon: section.icon || Home,
        category: "Navegación",
        onSelect: () => {
          onClose()
          void navigate({ to: section.to! })
        },
      })
    } else if (section.children) {
      section.children.forEach((child) =>
        processNode(child, section.title),
      )
    }
  })

  return items
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const logoutMutation = useLogout()
  const { navItems: sections } = useAllowedNavItems()

  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [prevSearch, setPrevSearch] = useState(search)
  const [prevOpen, setPrevOpen] = useState(open)

  if (prevSearch !== search || prevOpen !== open) {
    setPrevSearch(search)
    setPrevOpen(open)
    setSelectedIndex(0)
  }

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      void document.exitFullscreen()
      setIsFullscreen(false)
    }
    onOpenChange(false)
  }, [onOpenChange])

  // Colección de todos los comandos
  const allItems = useMemo<CommandItem[]>(() => {
    const navItems = extractNavItems(sections, navigate, () =>
      onOpenChange(false),
    )

    const systemItems: CommandItem[] = [
      {
        id: "sys-home",
        title: "Ir al Inicio / Dashboard",
        subtitle: "Pantalla principal",
        icon: Home,
        category: "Acciones Rápidas",
        onSelect: () => {
          onOpenChange(false)
          void navigate({ to: "/" })
        },
      },
      {
        id: "sys-profile",
        title: "Mi Perfil de Usuario",
        subtitle: "Ver datos de cuenta y roles",
        icon: UserRound,
        category: "Acciones Rápidas",
        onSelect: () => {
          onOpenChange(false)
          void navigate({ to: routes.perfil })
        },
      },
      {
        id: "sys-theme-toggle",
        title: `Cambiar a modo ${theme === "dark" ? "Claro" : "Oscuro"}`,
        subtitle: "Apariencia visual del sistema",
        icon: theme === "dark" ? Sun : Moon,
        category: "Sistema",
        onSelect: () => {
          setTheme(theme === "dark" ? "light" : "dark")
          onOpenChange(false)
        },
      },
      {
        id: "sys-fullscreen",
        title: isFullscreen ? "Salir de Pantalla Completa" : "Modo Pantalla Completa",
        subtitle: "Expandir interfaz para monitoreo",
        icon: isFullscreen ? Minimize2 : Maximize2,
        category: "Sistema",
        onSelect: toggleFullscreen,
      },
      {
        id: "sys-logout",
        title: "Cerrar Sesión",
        subtitle: "Finalizar sesión en el sistema",
        icon: LogOut,
        category: "Sistema",
        onSelect: async () => {
          onOpenChange(false)
          try {
            await logoutMutation.mutateAsync()
          } catch {
            // Ignorar
          } finally {
            await navigate({ to: "/login" })
          }
        },
      },
    ]

    return [...navItems, ...systemItems]
  }, [sections, navigate, onOpenChange, theme, setTheme, isFullscreen, toggleFullscreen, logoutMutation])

  // Filtrado de comandos por búsqueda
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return allItems

    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    )
  }, [allItems, search])

  // Manejo de teclado
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredItems.length - 1 : prev - 1,
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selected = filteredItems[selectedIndex]
      if (selected) {
        selected.onSelect()
      }
    }
  }

  // Agrupación por categorías
  const groupedItems = useMemo(() => {
    const groups: { category: string; items: CommandItem[] }[] = []
    const categories: ("Navegación" | "Acciones Rápidas" | "Sistema")[] = [
      "Navegación",
      "Acciones Rápidas",
      "Sistema",
    ]

    categories.forEach((cat) => {
      const items = filteredItems.filter((i) => i.category === cat)
      if (items.length > 0) {
        groups.push({ category: cat, items })
      }
    })

    return groups
  }, [filteredItems])

  let runningIndex = -1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl rounded-2xl border border-border/70 bg-popover/95 p-0 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in-0 zoom-in-95"
      >
        <DialogTitle className="sr-only">Paleta de Comandos</DialogTitle>

        {/* Input de Búsqueda */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 bg-muted/20">
          <Search className="size-4.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comando o busca una pantalla… (ej. Activos, OTs, Tema)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          )}
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-[340px] overflow-y-auto p-2 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
              <Compass className="size-8 opacity-40" />
              <p className="text-xs">No se encontraron resultados para &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            groupedItems.map((group) => (
              <div key={group.category} className="mb-2 last:mb-0">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group.category}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    runningIndex++
                    const isSelected = runningIndex === selectedIndex
                    const ItemIcon = item.icon

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onSelect}
                        onMouseEnter={() => setSelectedIndex(runningIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-foreground/80 hover:bg-muted/60",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg shadow-2xs",
                            isSelected
                              ? "bg-white/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <ItemIcon className="size-3.5" />
                        </div>

                        <div className="flex flex-1 flex-col min-w-0">
                          <span className="truncate">{item.title}</span>
                          {item.subtitle && (
                            <span
                              className={cn(
                                "truncate text-[10.5px]",
                                isSelected
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {item.subtitle}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <kbd className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 font-mono text-[9px] text-primary-foreground">
                            ↵ Enter
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con atajos de navegación */}
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 bg-muted/20 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↑</kbd>
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↵</kbd>
              <span>Seleccionar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">ESC</kbd>
              <span>Cerrar</span>
            </span>
          </div>
          <span className="text-[10px] font-medium opacity-70">
            SIGMA Command
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
