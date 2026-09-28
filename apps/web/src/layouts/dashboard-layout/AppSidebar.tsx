import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  ChevronRight,
  FileSearch,
  FileText,
  Folder,
  FolderOpen,
  LayoutDashboard,
  Search,
  Sparkles,
  X,
} from "lucide-react"

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
  DropdownMenuGroup,
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

/* ───────────────────────────── Sidebar principal ───────────────────────────── */

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar select-none transition-all duration-200"
      {...props}
    >
      {/* ── Header: Logo + Búsqueda ── */}
      <SidebarHeader className="gap-2.5 px-3 pt-3 pb-2 border-b border-sidebar-border/60">
        <Link
          to="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0.5"
        >
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-2xs ring-1 ring-white/10 transition-all group-hover:scale-105">
            <img
              src={logoEndeCorani}
              alt={appConfig.shortName}
              className="size-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white font-heading">
                {appConfig.shortName}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-primary/25 px-1 py-0.2 text-[9px] font-semibold text-white">
                v{appConfig.version}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span className="truncate text-[10.5px] font-medium text-slate-400">
                {appConfig.companyName}
              </span>
            </div>
          </div>
        </Link>

        <SidebarSearch query={searchQuery} onQueryChange={setSearchQuery} />
      </SidebarHeader>

      {/* ── Contenido: Navegación ── */}
      <SidebarContent className="px-2 py-2 overflow-x-hidden scrollbar-thin">
        <NavigationMenu
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      </SidebarContent>

      {/* ── Footer: Usuario ── */}
      <SidebarFooter className="p-1.5 border-t border-sidebar-border/60 bg-sidebar">
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

/* ───────────────────────── Búsqueda del sidebar ───────────────────────── */

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
              className="size-8.5 rounded-xl text-slate-400 hover:bg-sidebar-accent hover:text-white mx-auto transition-colors"
              onClick={() => {
                setOpen(true)
                setTimeout(() => inputRef.current?.focus(), 150)
              }}
            />
          }
        >
          <Search className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right" align="center" className="font-medium text-xs">
          Buscar menú (⌘K)
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
      <SidebarInput
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onQueryChange("")
            inputRef.current?.blur()
          }
        }}
        placeholder="Buscar menú…"
        className="h-8.5 rounded-lg border-white/10 bg-white/5 pl-8 pr-8 text-xs text-white placeholder:text-slate-400 shadow-none transition-all focus-visible:bg-white/10 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-white hover:bg-sidebar-accent transition-colors"
          title="Limpiar búsqueda"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-300">
          ⌘K
        </kbd>
      )}
    </div>
  )
}

/* ───────────────────── Filtrado recursivo ───────────────────── */

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

function countNodes(nodes?: NavNode[]): number {
  if (!nodes || nodes.length === 0) return 0
  return nodes.reduce((acc, curr) => acc + 1 + countNodes(curr.children), 0)
}

/* ───────────────────── Menú de Navegación ───────────────────── */

function NavigationMenu({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string
  onClearSearch: () => void
}) {
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

  const totalMatches = useMemo(() => {
    if (!normalizedQuery) return 0
    return filteredSections.reduce(
      (acc, s) => acc + 1 + countNodes(s.children),
      0,
    )
  }, [filteredSections, normalizedQuery])

  if (isLoading && (!sections || sections.length === 0)) {
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-8 w-5/6 rounded-lg ml-3" />
          <Skeleton className="h-8 w-4/6 rounded-lg ml-3" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 rounded-lg ml-3" />
        </div>
      </div>
    )
  }

  if (filteredSections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground ring-1 ring-border/50 shadow-inner">
          <FileSearch className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-foreground">
            Sin resultados
          </p>
          <p className="text-[11.5px] text-muted-foreground max-w-[180px] leading-snug">
            No encontramos ningún menú para &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={onClearSearch}
          className="rounded-lg text-xs mt-1 border-border/80 hover:bg-accent"
        >
          Limpiar búsqueda
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Badge con cantidad de resultados cuando se busca */}
      {normalizedQuery && (
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-muted-foreground bg-primary/5 rounded-lg border border-primary/10">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-primary" />
            <span>{totalMatches} {totalMatches === 1 ? "resultado" : "resultados"}</span>
          </span>
          <button
            type="button"
            onClick={onClearSearch}
            className="text-[10px] text-primary hover:underline font-semibold"
          >
            Limpiar
          </button>
        </div>
      )}

      {filteredSections.map((section) => (
        <NavSectionGroup
          key={section.id ? `${section.id}-${section.title}` : (section.code || section.title)}
          section={section}
          pathname={pathname}
          isSearching={Boolean(normalizedQuery)}
        />
      ))}
    </div>
  )
}

/* ───────────────────── Sección / Módulo (nivel raíz) ───────────────────── */

function NavSectionGroup({
  section,
  pathname,
  isSearching = false,
}: {
  section: NavSection
  pathname: string
  isSearching?: boolean
}) {
  const { state } = useSidebar()
  const hasChildren = Boolean(section.children && section.children.length > 0)
  const isSectionActive =
    (section.to && isPathActive(pathname, section.to)) ||
    Boolean(section.children?.some((child) => isNavNodeActive(pathname, child)))

  // Sección sin hijos → enlace directo de primer nivel
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
                render={<Link to={section.to} />}
                title={section.title}
                className={cn(
                  "group relative h-8 rounded-md px-2 text-[12.5px] font-medium transition-colors",
                  isSelfActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs hover:bg-primary/95"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                style={
                  isSelfActive && section.color
                    ? { backgroundColor: section.color, borderColor: section.color }
                    : undefined
                }
              >
                <SectionIcon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isSelfActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                  )}
                  style={!isSelfActive && section.color ? { color: section.color } : undefined}
                />
                <span className="truncate">{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  // Vista colapsada (icon mode) → Dropdown flotante
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
                        "group relative h-8 rounded-md transition-colors",
                        isSectionActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      style={
                        isSectionActive && section.color
                          ? { backgroundColor: section.color }
                          : undefined
                      }
                    />
                  }
                >
                  <SectionIcon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isSectionActive ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                    style={!isSectionActive && section.color ? { color: section.color } : undefined}
                  />
                  <span className="truncate">{section.title}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="min-w-52 rounded-xl p-1.5 shadow-lg border-border/60 bg-popover/98 text-xs"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-foreground font-heading">
                      <SectionIcon
                        className="size-3.5 text-primary shrink-0"
                        style={section.color ? { color: section.color } : undefined}
                      />
                      <span className="truncate">{section.title}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <div className="flex flex-col gap-0.5">
                      {section.children?.map((child) => (
                        <DropdownRecursiveNode
                          key={child.id ? `${child.id}-${child.to || child.title}` : (child.to || child.title)}
                          node={child}
                          pathname={pathname}
                          parentColor={section.color}
                        />
                      ))}
                    </div>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  // Vista expandida → Encabezado de sección + Menús hijos
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="flex h-5 items-center gap-1.5 px-2 mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 group-data-[collapsible=icon]:hidden select-none">
        <span
          className="size-1.5 rounded-full shrink-0 transition-transform duration-200"
          style={{ backgroundColor: section.color || "var(--primary)" }}
        />
        <span className="truncate">{section.title}</span>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {section.children?.map((child) => (
            <NavNodeItem
              key={child.id ? `${child.id}-${child.to || child.title}` : (child.to || child.title)}
              node={child}
              depth={0}
              pathname={pathname}
              isSearching={isSearching}
              parentColor={section.color}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/* ───────────────── Nodo recursivo (expandido) ───────────────── */

function NavNodeItem({
  node,
  depth = 0,
  pathname,
  isSearching = false,
  parentColor,
}: {
  node: NavNode
  depth?: number
  pathname: string
  isSearching?: boolean
  parentColor?: string | null
}) {
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isSelfActive = node.to ? isPathActive(pathname, node.to) : false
  const isChildActive = hasChildren
    ? Boolean(node.children?.some((child) => isNavNodeActive(pathname, child)))
    : false
  const isActive = isSelfActive || isChildActive
  const effectiveColor = node.color || parentColor

  const [isOpen, setIsOpen] = useState(isActive || isSearching)
  const [prevIsActive, setPrevIsActive] = useState(isActive)
  const [prevSearching, setPrevSearching] = useState(isSearching)

  if (prevIsActive !== isActive) {
    setPrevIsActive(isActive)
    if (isActive) {
      setIsOpen(true)
    }
  }

  if (prevSearching !== isSearching) {
    setPrevSearching(isSearching)
    if (isSearching) {
      setIsOpen(true)
    }
  }

  const NodeIcon = node.icon || (hasChildren ? (isOpen ? FolderOpen : Folder) : FileText)

  // Agrupador con hijos (Carpeta / Módulo secundario)
  if (hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive && !isOpen}
          tooltip={node.title}
          onClick={() => setIsOpen(!isOpen)}
          title={node.title}
          className={cn(
            "group relative flex items-center justify-between rounded-md px-2 font-medium transition-colors",
            depth === 0 ? "h-8 text-[12.5px]" : "h-7.5 text-[12px]",
            isActive && !isOpen
              ? "bg-white/10 text-white font-semibold"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          )}
          style={
            isActive && !isOpen && effectiveColor
              ? { backgroundColor: `${effectiveColor}25`, color: "#ffffff" }
              : undefined
          }
        >
          <div className="flex min-w-0 items-center gap-2">
            <NodeIcon
              className={cn(
                "shrink-0 transition-colors",
                depth === 0 ? "size-3.5" : "size-3",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-white",
              )}
              style={!isActive && effectiveColor ? { color: effectiveColor } : undefined}
            />
            <span className="truncate">{node.title}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {/* Indicador sutil de que contiene ruta activa si está cerrado */}
            {isChildActive && !isOpen && (
              <span
                className="size-1 rounded-full bg-primary"
                style={effectiveColor ? { backgroundColor: effectiveColor } : undefined}
              />
            )}
            <ChevronRight
              className={cn(
                "size-3 text-slate-500 transition-transform duration-150 shrink-0 group-hover:text-white",
                isOpen && "rotate-90 text-white",
              )}
            />
          </div>
        </SidebarMenuButton>

        {isOpen && node.children && (
          <SidebarMenuSub className="relative ml-3 border-l border-white/10 pl-2 mt-0.5 gap-0.5 transition-all">
            {node.children.map((child) => (
              <NavNodeItem
                key={child.id ? `${child.id}-${child.to || child.title}` : (child.to || child.title)}
                node={child}
                depth={depth + 1}
                pathname={pathname}
                isSearching={isSearching}
                parentColor={effectiveColor}
              />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  // Enlace directo en nivel raíz (depth 0)
  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelfActive}
          tooltip={node.title}
          render={node.to ? <Link to={node.to} /> : undefined}
          title={node.title}
          className={cn(
            "group relative h-8 rounded-md px-2 text-[12.5px] font-medium transition-colors",
            isSelfActive
              ? "bg-primary text-white font-semibold shadow-xs"
              : "text-slate-300 hover:bg-white/10 hover:text-white",
          )}
          style={
            isSelfActive && effectiveColor
              ? {
                  backgroundColor: effectiveColor,
                  color: "#ffffff",
                }
              : undefined
          }
        >
          <NodeIcon
            className={cn(
              "size-3.5 shrink-0 transition-colors",
              isSelfActive ? "text-white font-bold" : "text-slate-400 group-hover:text-white",
            )}
            style={!isSelfActive && effectiveColor ? { color: effectiveColor } : undefined}
          />
          <span className="truncate flex-1 text-left">{node.title}</span>

          {node.badge && (
            <span
              className={cn(
                "ml-auto shrink-0 px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-tight rounded-md",
                typeof node.badge === "number" || /^\d+$/.test(String(node.badge))
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 tabular-nums"
                  : "bg-white/20 text-white border border-white/30",
              )}
              style={
                typeof node.badge === "string" && !/^\d+$/.test(node.badge) && effectiveColor
                  ? { backgroundColor: `${effectiveColor}25`, color: "#ffffff", borderColor: `${effectiveColor}40` }
                  : undefined
              }
            >
              {node.badge}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Enlace en subnivel (depth > 0)
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={isSelfActive}
        render={node.to ? <Link to={node.to} /> : undefined}
        title={node.title}
        className={cn(
          "group relative h-7 rounded-md px-2 text-[11.5px] font-medium transition-colors",
          isSelfActive
            ? "bg-primary/25 text-white font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.75 before:rounded-r before:bg-primary"
            : "text-slate-400 hover:bg-white/10 hover:text-white",
        )}
        style={
          isSelfActive && effectiveColor
            ? {
                backgroundColor: `${effectiveColor}25`,
                color: "#ffffff",
                borderLeftColor: effectiveColor,
              }
            : undefined
        }
      >
        <NodeIcon
          className={cn(
            "size-3 shrink-0 transition-colors",
            isSelfActive ? "text-primary font-bold" : "text-slate-400 group-hover:text-white",
          )}
          style={effectiveColor ? { color: effectiveColor } : undefined}
        />
        <span className="truncate flex-1 text-left">{node.title}</span>

        {node.badge && (
          <span
            className={cn(
              "ml-auto shrink-0 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-tight rounded",
              typeof node.badge === "number" || /^\d+$/.test(String(node.badge))
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 tabular-nums"
                : "bg-white/20 text-white border border-white/30",
            )}
            style={
              typeof node.badge === "string" && !/^\d+$/.test(node.badge) && effectiveColor
                ? { backgroundColor: `${effectiveColor}25`, color: "#ffffff", borderColor: `${effectiveColor}40` }
                : undefined
            }
          >
            {node.badge}
          </span>
        )}
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

/* ───────────────── Nodo recursivo (dropdown colapsado) ───────────────── */

function DropdownRecursiveNode({
  node,
  pathname,
  parentColor,
}: {
  node: NavNode
  pathname: string
  parentColor?: string | null
}) {
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isSelfActive = node.to ? isPathActive(pathname, node.to) : false
  const isAnyDescendantActive = isNavNodeActive(pathname, node)
  const NodeIcon = node.icon || (hasChildren ? Folder : FileText)
  const effectiveColor = node.color || parentColor

  if (hasChildren && node.children) {
    return (
      <DropdownMenuSub key={node.id ? `${node.id}-${node.title}` : node.title}>
        <DropdownMenuSubTrigger
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
            isAnyDescendantActive
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/80 hover:bg-accent",
          )}
          style={
            isAnyDescendantActive && effectiveColor
              ? { backgroundColor: `${effectiveColor}18`, color: effectiveColor }
              : undefined
          }
        >
          <NodeIcon
            className={cn(
              "size-3.5 shrink-0",
              isAnyDescendantActive ? "text-primary" : "text-muted-foreground",
            )}
            style={effectiveColor ? { color: effectiveColor } : undefined}
          />
          <span className="truncate flex-1 text-left">{node.title}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-44 rounded-2xl p-1.5 shadow-xl border-border/60 bg-popover/95 backdrop-blur-md">
          {node.children.map((child) => (
            <DropdownRecursiveNode
              key={child.id ? `${child.id}-${child.to || child.title}` : (child.to || child.title)}
              node={child}
              pathname={pathname}
              parentColor={effectiveColor}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  return (
    <DropdownMenuItem
      key={node.id ? `${node.id}-${node.to || node.title}` : (node.to || node.title)}
      render={node.to ? <Link to={node.to} /> : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
        isSelfActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-foreground/80 hover:bg-accent",
      )}
      style={
        isSelfActive && effectiveColor
          ? { backgroundColor: `${effectiveColor}18`, color: effectiveColor }
          : undefined
      }
    >
      <NodeIcon
        className={cn(
          "size-3.5 shrink-0",
          isSelfActive ? "text-primary" : "text-muted-foreground",
        )}
        style={effectiveColor ? { color: effectiveColor } : undefined}
      />
      <span className="truncate">{node.title}</span>
    </DropdownMenuItem>
  )
}
