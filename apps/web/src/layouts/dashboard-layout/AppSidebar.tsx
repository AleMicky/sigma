import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, FileText, Folder, LayoutDashboard, Search, X } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import { appConfig, isPathActive } from "@/app/config"
import { useAllowedNavItems } from "@/shared/hooks/use-allowed-nav-items"
import type { NavNode, NavSection } from "@/shared/types/nav.types"
import { isNavNodeActive } from "@/shared/utils/nav.utils"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"

import { UserMenu } from "./UserMenu"

// Paletas temáticas refinadas para cada módulo
const MODULE_PALETTES = [
  {
    icon: "text-sky-500 dark:text-sky-400",
    iconActive: "text-sky-600 dark:text-sky-300",
    iconBg: "bg-sky-500/10 group-hover:bg-sky-500/15",
    iconBgActive: "bg-sky-500/20 shadow-2xs",
    pillActive: "bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15",
    indicator: "bg-sky-500",
  },
  {
    icon: "text-blue-500 dark:text-blue-400",
    iconActive: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/15",
    iconBgActive: "bg-blue-500/20 shadow-2xs",
    pillActive: "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15",
    indicator: "bg-blue-500",
  },
  {
    icon: "text-amber-500 dark:text-amber-400",
    iconActive: "text-amber-600 dark:text-amber-300",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/15",
    iconBgActive: "bg-amber-500/20 shadow-2xs",
    pillActive: "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15",
    indicator: "bg-amber-500",
  },
  {
    icon: "text-emerald-500 dark:text-emerald-400",
    iconActive: "text-emerald-600 dark:text-emerald-300",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/15",
    iconBgActive: "bg-emerald-500/20 shadow-2xs",
    pillActive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15",
    indicator: "bg-emerald-500",
  },
  {
    icon: "text-violet-500 dark:text-violet-400",
    iconActive: "text-violet-600 dark:text-violet-300",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500/15",
    iconBgActive: "bg-violet-500/20 shadow-2xs",
    pillActive: "bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15",
    indicator: "bg-violet-500",
  },
  {
    icon: "text-orange-500 dark:text-orange-400",
    iconActive: "text-orange-600 dark:text-orange-300",
    iconBg: "bg-orange-500/10 group-hover:bg-orange-500/15",
    iconBgActive: "bg-orange-500/20 shadow-2xs",
    pillActive: "bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15",
    indicator: "bg-orange-500",
  },
  {
    icon: "text-indigo-500 dark:text-indigo-400",
    iconActive: "text-indigo-600 dark:text-indigo-300",
    iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/15",
    iconBgActive: "bg-indigo-500/20 shadow-2xs",
    pillActive: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15",
    indicator: "bg-indigo-500",
  },
  {
    icon: "text-rose-500 dark:text-rose-400",
    iconActive: "text-rose-600 dark:text-rose-300",
    iconBg: "bg-rose-500/10 group-hover:bg-rose-500/15",
    iconBgActive: "bg-rose-500/20 shadow-2xs",
    pillActive: "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15",
    indicator: "bg-rose-500",
  },
  {
    icon: "text-teal-500 dark:text-teal-400",
    iconActive: "text-teal-600 dark:text-teal-300",
    iconBg: "bg-teal-500/10 group-hover:bg-teal-500/15",
    iconBgActive: "bg-teal-500/20 shadow-2xs",
    pillActive: "bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/15",
    indicator: "bg-teal-500",
  },
]

type ThemePalette = (typeof MODULE_PALETTES)[number]

function getModuleTheme(index: number): ThemePalette {
  return MODULE_PALETTES[index % MODULE_PALETTES.length]
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/70 bg-sidebar/95 backdrop-blur-md transition-all duration-300 select-none"
      {...props}
    >
      <SidebarHeader className="gap-2 px-2.5 pt-2.5 pb-2 border-b border-border/40">
        <Link
          to="/"
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1 transition-all duration-150 hover:bg-sidebar-accent/80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-xs ring-1 ring-black/10 transition-transform duration-150 group-hover:scale-105 dark:bg-white/95 dark:ring-white/20">
            <img
              src={logoEndeCorani}
              alt="ENDE Corani"
              className="size-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold tracking-tight text-foreground font-heading">
                {appConfig.shortName}
              </span>
              <span className="rounded border border-border/60 bg-muted/60 px-1 py-0.2 text-[9px] font-semibold text-muted-foreground">
                v{appConfig.version}
              </span>
            </div>
            <span className="truncate text-[10.5px] font-medium text-muted-foreground">
              ENDE Corani S.A.
            </span>
          </div>
        </Link>

        <SidebarSearch query={searchQuery} onQueryChange={setSearchQuery} />
      </SidebarHeader>

      <SidebarContent className="px-2 py-1.5">
        <NavigationMenu searchQuery={searchQuery} />
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border/40 bg-muted/15">
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function SidebarSearch({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (q: string) => void
}) {
  const { state, setOpen } = useSidebar()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (state === "collapsed") {
          setOpen(true)
        }
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [state, setOpen])

  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground mx-auto flex items-center justify-center transition-colors"
              onClick={() => {
                setOpen(true)
                setTimeout(() => inputRef.current?.focus(), 150)
              }}
            />
          }
        >
          <Search className="size-3.5 text-primary" />
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          Buscar menú (⌘K)
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <SidebarInput
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar menú…"
        className="h-7.5 rounded-lg border-border/50 bg-muted/40 pl-7 pr-7 text-[11.5px] shadow-none transition-all hover:border-border/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded p-0.5"
          title="Limpiar búsqueda"
        >
          <X className="size-3" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 rounded border border-border/60 bg-background/80 px-1 py-0.2 font-mono text-[9.5px] font-medium text-muted-foreground shadow-2xs">
          ⌘K
        </kbd>
      )}
    </div>
  )
}

/**
 * Filtra de manera recursiva los nodos del árbol según el término de búsqueda
 */
function filterNavNodes(nodes: NavNode[], query: string): NavNode[] {
  const result: NavNode[] = []

  for (const node of nodes) {
    const matchesNode = node.title.toLowerCase().includes(query)
    const filteredSubChildren = node.children
      ? filterNavNodes(node.children, query)
      : []

    if (matchesNode) {
      result.push(node)
    } else if (filteredSubChildren.length > 0) {
      result.push({
        ...node,
        children: filteredSubChildren,
      })
    }
  }

  return result
}

function NavigationMenu({ searchQuery }: { searchQuery: string }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { navItems: sections, isLoading } = useAllowedNavItems()

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) return sections

    return sections
      .map((section) => {
        const matchesSection = section.title.toLowerCase().includes(normalizedQuery)
        if (!section.children || section.children.length === 0) {
          return matchesSection ? section : null
        }

        const filteredChildren = filterNavNodes(section.children, normalizedQuery)

        if (matchesSection || filteredChildren.length > 0) {
          return {
            ...section,
            children: matchesSection ? section.children : filteredChildren,
          }
        }
        return null
      })
      .filter(Boolean) as NavSection[]
  }, [normalizedQuery, sections])

  if (isLoading && (!sections || sections.length === 0)) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-3 w-24 rounded mt-1" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    )
  }

  if (filteredSections.length === 0) {
    return (
      <div className="px-2 py-4 text-center text-[11.5px] text-muted-foreground">
        No hay menús para &ldquo;{searchQuery}&rdquo;
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {filteredSections.map((section, sectionIndex) => {
        const theme = getModuleTheme(sectionIndex)
        return (
          <NavSectionGroup
            key={section.id || section.title}
            section={section}
            theme={theme}
            pathname={pathname}
          />
        )
      })}
    </div>
  )
}

/**
 * Componente para renderizar la sección raíz / módulo (primer nivel)
 */
function NavSectionGroup({
  section,
  theme,
  pathname,
}: {
  section: NavSection
  theme: ThemePalette
  pathname: string
}) {
  const { state } = useSidebar()
  const hasChildren = Boolean(section.children && section.children.length > 0)
  const isSectionActive =
    (section.to && isPathActive(pathname, section.to)) ||
    Boolean(section.children?.some((child) => isNavNodeActive(pathname, child)))

  // Si la sección NO tiene hijos y tiene ruta (ejemplo: "Inicio" con ruta "/"),
  // se renderiza directamente como enlace individual
  if (!hasChildren && section.to) {
    const isSelfActive = isPathActive(pathname, section.to)
    const SectionIcon = section.icon || LayoutDashboard

    return (
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isSelfActive}
                tooltip={section.title}
                render={<Link to={section.to as any} />}
                title={section.title}
                className={cn(
                  "group relative h-8 rounded-lg px-2 text-[12.5px] font-medium transition-all duration-150 hover:translate-x-0.5",
                  isSelfActive
                    ? cn(
                        theme.pillActive,
                        "font-semibold shadow-2xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full",
                        theme.indicator,
                      )
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex size-5.5 shrink-0 items-center justify-center rounded-md transition-all duration-150 group-hover:scale-105",
                    isSelfActive ? theme.iconBgActive : theme.iconBg,
                  )}
                >
                  <SectionIcon
                    className={cn(
                      "size-3.5 shrink-0 transition-colors",
                      isSelfActive ? theme.iconActive : theme.icon,
                    )}
                  />
                </div>
                <span className="truncate font-medium">{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  // Vista en modo colapsado (Icon mode) para secciones con hijos
  if (state === "collapsed") {
    const SectionIcon = section.icon || Folder

    return (
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      isActive={isSectionActive}
                      tooltip={section.title}
                      className={cn(
                        "group relative h-8 rounded-lg transition-all duration-150",
                        isSectionActive
                          ? cn(
                              theme.pillActive,
                              "font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full",
                              theme.indicator,
                            )
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                      )}
                    />
                  }
                >
                  <div
                    className={cn(
                      "flex size-5.5 shrink-0 items-center justify-center rounded-md transition-all duration-150 group-hover:scale-105",
                      isSectionActive ? theme.iconBgActive : theme.iconBg,
                    )}
                  >
                    <SectionIcon
                      className={cn(
                        "size-3.5 shrink-0 transition-colors",
                        isSectionActive ? theme.iconActive : theme.icon,
                      )}
                    />
                  </div>
                  <span className="truncate">{section.title}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="min-w-52 rounded-xl p-1.5 shadow-xl border-border/60 bg-popover/95 backdrop-blur-md"
                >
                  <DropdownMenuLabel className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-foreground">
                    <span
                      className={cn("size-1.5 rounded-full", theme.indicator)}
                    />
                    <span className="truncate">{section.title}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="flex flex-col gap-0.5">
                    {section.children?.map((child) => (
                      <DropdownRecursiveNode
                        key={child.id || child.title}
                        node={child}
                        pathname={pathname}
                        theme={theme}
                      />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  // Vista en modo expandido: El primer nivel es siempre el TÍTULO de la sección / módulo
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="flex h-5 items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 group-data-[collapsible=icon]:hidden px-2 mb-0.5 select-none font-heading">
        <span className="truncate">{section.title}</span>
        <span className={cn("size-1.5 rounded-full shrink-0 ml-1", theme.indicator)} />
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {section.children?.map((child) => (
            <NavNodeItem
              key={child.id || child.title}
              node={child}
              depth={0}
              theme={theme}
              pathname={pathname}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/**
 * Renderizado recursivo de elementos en el Sidebar expandido
 * - Si tiene hijos: Agrupador / Acordeón colapsable
 * - Si NO tiene hijos: Solo menú / Enlace directo
 */
function NavNodeItem({
  node,
  depth = 0,
  theme,
  pathname,
}: {
  node: NavNode
  depth?: number
  theme: ThemePalette
  pathname: string
}) {
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isSelfActive = node.to ? isPathActive(pathname, node.to) : false
  const isChildActive = hasChildren
    ? Boolean(node.children?.some((child) => isNavNodeActive(pathname, child)))
    : false
  const isActive = isSelfActive || isChildActive

  const [isOpen, setIsOpen] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setIsOpen(true)
    }
  }, [isActive])

  const NodeIcon = node.icon || (hasChildren ? Folder : FileText)

  // Caso 1: Agrupador / Submenú con hijos (Renderizado Recursivo)
  if (hasChildren) {
    return (
      <SidebarMenuItem key={node.id || node.title}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={node.title}
          onClick={() => setIsOpen(!isOpen)}
          title={node.title}
          className={cn(
            "group relative rounded-lg px-2 font-medium transition-all duration-150 hover:translate-x-0.5",
            depth === 0 ? "h-8 text-[12.5px]" : "h-7.5 text-[12px]",
            isActive && !isOpen
              ? cn(
                  theme.pillActive,
                  "font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full",
                  theme.indicator,
                )
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md transition-all duration-150 group-hover:scale-105",
              depth === 0 ? "size-5.5" : "size-5",
              isActive ? theme.iconBgActive : theme.iconBg,
            )}
          >
            <NodeIcon
              className={cn(
                "shrink-0 transition-colors",
                depth === 0 ? "size-3.5" : "size-3",
                isActive ? theme.iconActive : theme.icon,
              )}
            />
          </div>
          <span className="flex-1 text-left font-medium tracking-tight truncate">
            {node.title}
          </span>
          <ChevronRight
            className={cn(
              "size-3 text-muted-foreground/70 transition-transform duration-150 shrink-0",
              isOpen && "rotate-90 text-foreground",
            )}
          />
        </SidebarMenuButton>

        {isOpen && node.children && (
          <SidebarMenuSub className="my-0.5 ml-2.5 border-l border-border/50 pl-1.5 gap-0.5">
            {node.children.map((child) => (
              <NavNodeItem
                key={child.id || child.title}
                node={child}
                depth={depth + 1}
                theme={theme}
                pathname={pathname}
              />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  // Caso 2: Solo Menú / Enlace Directo (Hoja)
  if (depth === 0) {
    return (
      <SidebarMenuItem key={node.id || node.to || node.title}>
        <SidebarMenuButton
          isActive={isSelfActive}
          tooltip={node.title}
          render={node.to ? <Link to={node.to as any} /> : undefined}
          title={node.title}
          className={cn(
            "group relative h-8 rounded-lg px-2 text-[12.5px] font-medium transition-all duration-150 hover:translate-x-0.5",
            isSelfActive
              ? cn(
                  theme.pillActive,
                  "font-semibold shadow-2xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full",
                  theme.indicator,
                )
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
          )}
        >
          <div
            className={cn(
              "flex size-5.5 shrink-0 items-center justify-center rounded-md transition-all duration-150 group-hover:scale-105",
              isSelfActive ? theme.iconBgActive : theme.iconBg,
            )}
          >
            <NodeIcon
              className={cn(
                "size-3.5 shrink-0 transition-colors",
                isSelfActive ? theme.iconActive : theme.icon,
              )}
            />
          </div>
          <span className="truncate font-medium">{node.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Enlace dentro de un subnivel (depth > 0)
  return (
    <SidebarMenuSubItem key={node.id || node.to || node.title}>
      <SidebarMenuSubButton
        isActive={isSelfActive}
        render={node.to ? <Link to={node.to as any} /> : undefined}
        title={node.title}
        className={cn(
          "relative min-h-7 h-auto py-1 rounded-md px-1.5 text-[12px] font-medium transition-all duration-150 hover:translate-x-0.5",
          isSelfActive
            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-2xs before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:h-3.5 before:w-0.75 before:rounded-r-full before:bg-primary"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        <NodeIcon
          className={cn(
            "size-3 shrink-0 transition-colors",
            isSelfActive ? "text-primary" : "text-muted-foreground/80",
          )}
        />
        <span className="truncate leading-tight">{node.title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

/**
 * Renderizado recursivo para el Dropdown en vista colapsada
 */
function DropdownRecursiveNode({
  node,
  pathname,
  theme,
}: {
  node: NavNode
  pathname: string
  theme: ThemePalette
}) {
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isSelfActive = node.to ? isPathActive(pathname, node.to) : false
  const isAnyDescendantActive = isNavNodeActive(pathname, node)
  const NodeIcon = node.icon || (hasChildren ? Folder : FileText)

  if (hasChildren && node.children) {
    return (
      <DropdownMenuSub key={node.id || node.title}>
        <DropdownMenuSubTrigger
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] font-medium cursor-pointer transition-all duration-150",
            isAnyDescendantActive
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
          )}
        >
          <NodeIcon
            className={cn(
              "size-3.5 shrink-0 transition-colors",
              isAnyDescendantActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="truncate flex-1 text-left">{node.title}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-44 rounded-xl p-1 shadow-lg border-border/60 bg-popover/95 backdrop-blur-md">
          {node.children.map((child) => (
            <DropdownRecursiveNode
              key={child.id || child.title}
              node={child}
              pathname={pathname}
              theme={theme}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  return (
    <DropdownMenuItem
      key={node.id || node.to || node.title}
      render={node.to ? <Link to={node.to as any} /> : undefined}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] font-medium cursor-pointer transition-all duration-150",
        isSelfActive
          ? "bg-primary/10 text-primary font-semibold shadow-2xs"
          : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <NodeIcon
        className={cn(
          "size-3.5 shrink-0 transition-colors",
          isSelfActive ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="truncate">{node.title}</span>
    </DropdownMenuItem>
  )
}
