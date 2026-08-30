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

/* ───────────────────────────── Sidebar principal ───────────────────────────── */

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 select-none"
      {...props}
    >
      {/* ── Header: Logo + Búsqueda ── */}
      <SidebarHeader className="gap-3 px-3 pt-3 pb-2">
        <Link
          to="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-accent/60 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-xs ring-1 ring-border/80 transition-transform duration-150 group-hover:scale-[1.03] dark:bg-white/95 dark:ring-white/15">
            <img
              src={logoEndeCorani}
              alt="ENDE Corani"
              className="size-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-foreground">
                {appConfig.shortName}
              </span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                v{appConfig.version}
              </span>
            </div>
            <span className="truncate text-[11px] text-muted-foreground">
              ENDE Corani S.A.
            </span>
          </div>
        </Link>

        <SidebarSearch query={searchQuery} onQueryChange={setSearchQuery} />
      </SidebarHeader>

      {/* ── Contenido: Navegación ── */}
      <SidebarContent className="px-2 py-1">
        <NavigationMenu searchQuery={searchQuery} />
      </SidebarContent>

      {/* ── Footer: Usuario ── */}
      <SidebarFooter className="p-2 border-t border-border/30">
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
              className="size-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground mx-auto"
              onClick={() => {
                setOpen(true)
                setTimeout(() => inputRef.current?.focus(), 150)
              }}
            />
          }
        >
          <Search className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          Buscar menú (⌘K)
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
      <SidebarInput
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar…"
        className="h-8 rounded-lg border-border/40 bg-accent/30 pl-8 pr-8 text-xs shadow-none placeholder:text-muted-foreground/50 transition-colors focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:border-border"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Limpiar búsqueda"
        >
          <X className="size-3" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border/50 bg-background/60 px-1 py-px font-mono text-[9px] font-medium text-muted-foreground/60">
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

/* ───────────────────── Menú de Navegación ───────────────────── */

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
      <div className="flex flex-col gap-3 p-2">
        <Skeleton className="h-3 w-16 rounded" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
        </div>
        <Skeleton className="h-3 w-20 rounded mt-2" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-5/6 rounded-lg" />
        </div>
      </div>
    )
  }

  if (filteredSections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <Search className="size-8 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">
          Sin resultados para &ldquo;{searchQuery}&rdquo;
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredSections.map((section, sectionIndex) => (
        <NavSectionGroup
          key={section.id || section.title}
          section={section}
          sectionIndex={sectionIndex}
          pathname={pathname}
        />
      ))}
    </div>
  )
}

/* ───────────────────── Sección / Módulo (nivel raíz) ───────────────────── */

function NavSectionGroup({
  section,
  sectionIndex: _sectionIndex,
  pathname,
}: {
  section: NavSection
  sectionIndex: number
  pathname: string
}) {
  const { state } = useSidebar()
  const hasChildren = Boolean(section.children && section.children.length > 0)
  const isSectionActive =
    (section.to && isPathActive(pathname, section.to)) ||
    Boolean(section.children?.some((child) => isNavNodeActive(pathname, child)))

  // Sección sin hijos → enlace directo
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
                  "group h-8 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
                  isSelfActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground",
                )}
              >
                <SectionIcon
                  className={cn(
                    "size-4 shrink-0",
                    isSelfActive ? "text-primary-foreground" : "text-muted-foreground",
                  )}
                />
                <span className="truncate">{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  // Vista colapsada → dropdown
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
                        "group h-8 rounded-lg transition-colors",
                        isSectionActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-foreground/70 hover:bg-accent hover:text-foreground",
                      )}
                    />
                  }
                >
                  <SectionIcon
                    className={cn(
                      "size-4 shrink-0",
                      isSectionActive ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate">{section.title}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="min-w-48 rounded-xl p-1.5 shadow-lg"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="flex flex-col gap-0.5">
                    {section.children?.map((child) => (
                      <DropdownRecursiveNode
                        key={child.id || child.title}
                        node={child}
                        pathname={pathname}
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

  // Vista expandida → label de sección + items
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="flex h-5 items-center px-2.5 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden select-none">
        <span className="truncate">{section.title}</span>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {section.children?.map((child) => (
            <NavNodeItem
              key={child.id || child.title}
              node={child}
              depth={0}
              pathname={pathname}
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
}: {
  node: NavNode
  depth?: number
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
    if (isActive) setIsOpen(true)
  }, [isActive])

  const NodeIcon = node.icon || (hasChildren ? Folder : FileText)

  // Agrupador con hijos
  if (hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive && !isOpen}
          tooltip={node.title}
          onClick={() => setIsOpen(!isOpen)}
          title={node.title}
          className={cn(
            "group rounded-lg px-2.5 font-medium transition-colors",
            depth === 0 ? "h-8 text-[13px]" : "h-7.5 text-xs",
            isActive && !isOpen
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/70 hover:bg-accent hover:text-foreground",
          )}
        >
          <NodeIcon
            className={cn(
              "shrink-0 transition-colors",
              depth === 0 ? "size-4" : "size-3.5",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="flex-1 text-left truncate">{node.title}</span>
          <ChevronRight
            className={cn(
              "size-3 text-muted-foreground/50 transition-transform duration-200 shrink-0",
              isOpen && "rotate-90",
            )}
          />
        </SidebarMenuButton>

        {isOpen && node.children && (
          <SidebarMenuSub className="ml-3.5 border-l border-border/40 pl-2 mt-0.5 gap-0.5">
            {node.children.map((child) => (
              <NavNodeItem
                key={child.id || child.title}
                node={child}
                depth={depth + 1}
                pathname={pathname}
              />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  // Enlace directo (depth 0)
  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelfActive}
          tooltip={node.title}
          render={node.to ? <Link to={node.to as any} /> : undefined}
          title={node.title}
          className={cn(
            "group h-8 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
            isSelfActive
              ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
              : "text-foreground/70 hover:bg-accent hover:text-foreground",
          )}
        >
          <NodeIcon
            className={cn(
              "size-4 shrink-0",
              isSelfActive ? "text-primary-foreground" : "text-muted-foreground",
            )}
          />
          <span className="truncate">{node.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Enlace en subnivel (depth > 0)
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={isSelfActive}
        render={node.to ? <Link to={node.to as any} /> : undefined}
        title={node.title}
        className={cn(
          "h-7 rounded-md px-2 text-xs font-medium transition-colors",
          isSelfActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <NodeIcon
          className={cn(
            "size-3 shrink-0",
            isSelfActive ? "text-primary" : "text-muted-foreground/70",
          )}
        />
        <span className="truncate">{node.title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

/* ───────────────── Nodo recursivo (dropdown colapsado) ───────────────── */

function DropdownRecursiveNode({
  node,
  pathname,
}: {
  node: NavNode
  pathname: string
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
            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors",
            isAnyDescendantActive
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground/80 hover:bg-accent",
          )}
        >
          <NodeIcon
            className={cn(
              "size-3.5 shrink-0",
              isAnyDescendantActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="truncate flex-1 text-left">{node.title}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-40 rounded-xl p-1 shadow-lg">
          {node.children.map((child) => (
            <DropdownRecursiveNode
              key={child.id || child.title}
              node={child}
              pathname={pathname}
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
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition-colors",
        isSelfActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-foreground/80 hover:bg-accent",
      )}
    >
      <NodeIcon
        className={cn(
          "size-3.5 shrink-0",
          isSelfActive ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="truncate">{node.title}</span>
    </DropdownMenuItem>
  )
}
