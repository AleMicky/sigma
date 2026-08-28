import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, Search, X } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import { appConfig, isPathActive } from "@/app/config"
import { useAllowedNavItems } from "@/shared/hooks/use-allowed-nav-items"
import type { NavItem, NavLeaf, NavSubGroup } from "@/shared/types/nav.types"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

// Paletas de color dinámicas para dar identidad visual a cada módulo
const MODULE_PALETTES = [
  {
    icon: "text-sky-500 dark:text-sky-400",
    iconActive: "text-sky-600 dark:text-sky-300",
    iconBg: "bg-sky-500/10 group-hover:bg-sky-500/20",
    iconBgActive: "bg-sky-500/20 shadow-xs",
    pillActive: "bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15",
    indicator: "bg-sky-500",
  },
  {
    icon: "text-blue-500 dark:text-blue-400",
    iconActive: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    iconBgActive: "bg-blue-500/20 shadow-xs",
    pillActive: "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15",
    indicator: "bg-blue-500",
  },
  {
    icon: "text-amber-500 dark:text-amber-400",
    iconActive: "text-amber-600 dark:text-amber-300",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    iconBgActive: "bg-amber-500/20 shadow-xs",
    pillActive: "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15",
    indicator: "bg-amber-500",
  },
  {
    icon: "text-emerald-500 dark:text-emerald-400",
    iconActive: "text-emerald-600 dark:text-emerald-300",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    iconBgActive: "bg-emerald-500/20 shadow-xs",
    pillActive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15",
    indicator: "bg-emerald-500",
  },
  {
    icon: "text-violet-500 dark:text-violet-400",
    iconActive: "text-violet-600 dark:text-violet-300",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
    iconBgActive: "bg-violet-500/20 shadow-xs",
    pillActive: "bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15",
    indicator: "bg-violet-500",
  },
  {
    icon: "text-orange-500 dark:text-orange-400",
    iconActive: "text-orange-600 dark:text-orange-300",
    iconBg: "bg-orange-500/10 group-hover:bg-orange-500/20",
    iconBgActive: "bg-orange-500/20 shadow-xs",
    pillActive: "bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15",
    indicator: "bg-orange-500",
  },
  {
    icon: "text-indigo-500 dark:text-indigo-400",
    iconActive: "text-indigo-600 dark:text-indigo-300",
    iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    iconBgActive: "bg-indigo-500/20 shadow-xs",
    pillActive: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15",
    indicator: "bg-indigo-500",
  },
  {
    icon: "text-rose-500 dark:text-rose-400",
    iconActive: "text-rose-600 dark:text-rose-300",
    iconBg: "bg-rose-500/10 group-hover:bg-rose-500/20",
    iconBgActive: "bg-rose-500/20 shadow-xs",
    pillActive: "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15",
    indicator: "bg-rose-500",
  },
  {
    icon: "text-teal-500 dark:text-teal-400",
    iconActive: "text-teal-600 dark:text-teal-300",
    iconBg: "bg-teal-500/10 group-hover:bg-teal-500/20",
    iconBgActive: "bg-teal-500/20 shadow-xs",
    pillActive: "bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/15",
    indicator: "bg-teal-500",
  },
]

function getModuleTheme(index: number) {
  return MODULE_PALETTES[index % MODULE_PALETTES.length]
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (isPathActive(pathname, item.to)) return true
  if (item.children) {
    return item.children.some((child) => {
      if ("items" in child) {
        return child.items.some((subItem) => isPathActive(pathname, subItem.to))
      }
      return isPathActive(pathname, child.to)
    })
  }
  return false
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/70 bg-sidebar/95 backdrop-blur-md transition-all duration-300 select-none"
      {...props}
    >
      <SidebarHeader className="gap-3 px-3 pt-3.5 pb-2.5 border-b border-border/40">
        <Link
          to="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 transition-all duration-200 hover:bg-sidebar-accent/80 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
        >
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-105 dark:bg-white/95 dark:ring-white/20">
            <img
              src={logoEndeCorani}
              alt="ENDE Corani"
              className="size-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-foreground font-heading">
                {appConfig.shortName}
              </span>
              <span className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.2 text-[9.5px] font-semibold text-muted-foreground">
                v{appConfig.version}
              </span>
            </div>
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              ENDE Corani S.A.
            </span>
          </div>
        </Link>

        <SidebarSearch query={searchQuery} onQueryChange={setSearchQuery} />
      </SidebarHeader>

      <SidebarContent className="px-2.5">
        <SidebarGroup className="px-0 py-2">
          <SidebarGroupLabel className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/75 group-data-[collapsible=icon]:hidden px-2 mb-1.5">
            <span>Módulos del Sistema</span>
            <span className="size-1.5 rounded-full bg-primary/60 animate-pulse" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationMenu searchQuery={searchQuery} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3 pt-2 border-t border-border/50 bg-muted/20">
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

  // Acceso directo con atajo ⌘K / Ctrl+K
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
              className="size-8.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground mx-auto flex items-center justify-center transition-colors"
              onClick={() => {
                setOpen(true)
                setTimeout(() => inputRef.current?.focus(), 150)
              }}
            />
          }
        >
          <Search className="size-4 text-primary" />
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          Buscar módulo o menú (⌘K)
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <SidebarInput
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar módulo o menú…"
        className="h-8.5 rounded-lg border-border/50 bg-muted/40 pl-8 pr-8 text-xs shadow-none transition-all hover:border-border/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50"
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded p-0.5"
          title="Limpiar búsqueda"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
          ⌘K
        </kbd>
      )}
    </div>
  )
}

function NavigationMenu({ searchQuery }: { searchQuery: string }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { state } = useSidebar()
  const { navItems: userNavItems, isLoading } = useAllowedNavItems()

  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Filtro de búsqueda optimizado para módulos, subgrupos y sub-ítems
  const filteredNavItems = useMemo(() => {
    if (!normalizedQuery) return userNavItems

    return userNavItems
      .map((item) => {
        const matchesParent = item.title.toLowerCase().includes(normalizedQuery)
        if (!item.children) {
          return matchesParent ? item : null
        }

        const filteredChildren = item.children
          .map((child) => {
            if ("items" in child) {
              const matchesSubGroup = child.title
                .toLowerCase()
                .includes(normalizedQuery)
              const filteredSubItems = child.items.filter((sub) =>
                sub.title.toLowerCase().includes(normalizedQuery),
              )
              if (matchesSubGroup || filteredSubItems.length > 0) {
                return {
                  ...child,
                  items: matchesSubGroup ? child.items : filteredSubItems,
                }
              }
              return null
            }

            return child.title.toLowerCase().includes(normalizedQuery)
              ? child
              : null
          })
          .filter(Boolean) as typeof item.children

        if (matchesParent || filteredChildren.length > 0) {
          return {
            ...item,
            children: matchesParent ? item.children : filteredChildren,
          }
        }
        return null
      })
      .filter(Boolean) as typeof userNavItems
  }, [normalizedQuery, userNavItems])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  // Expandir automáticamente módulos activos
  useEffect(() => {
    userNavItems.forEach((item) => {
      if (item.children && isItemActive(pathname, item)) {
        setOpenGroups((prev) => ({ ...prev, [item.title]: true }))
      }
    })
  }, [pathname, userNavItems])

  // Expandir todo al realizar una búsqueda
  useEffect(() => {
    if (normalizedQuery) {
      const allOpen: Record<string, boolean> = {}
      filteredNavItems.forEach((item) => {
        allOpen[item.title] = true
      })
      setOpenGroups(allOpen)
    }
  }, [normalizedQuery, filteredNavItems])

  function toggleGroup(title: string) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  if (isLoading && (!userNavItems || userNavItems.length === 0)) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    )
  }

  if (filteredNavItems.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        No se encontraron menús para &ldquo;{searchQuery}&rdquo;
      </div>
    )
  }

  return (
    <SidebarMenu className="gap-1.5">
      {filteredNavItems.map((item, index) => {
        const theme = getModuleTheme(index)
        const hasChildren = Boolean(item.children?.length)

        if (!hasChildren) {
          return (
            <NavSingleItem
              key={item.to}
              item={item}
              pathname={pathname}
              theme={theme}
            />
          )
        }

        if (state === "collapsed") {
          return (
            <NavFlyoutItem
              key={item.title}
              item={item}
              pathname={pathname}
              theme={theme}
            />
          )
        }

        return (
          <NavAccordionItem
            key={item.title}
            item={item}
            pathname={pathname}
            theme={theme}
            isOpen={Boolean(openGroups[item.title])}
            onToggle={() => toggleGroup(item.title)}
          />
        )
      })}
    </SidebarMenu>
  )
}

function NavSingleItem({
  item,
  pathname,
  theme,
}: {
  item: NavItem
  pathname: string
  theme: (typeof MODULE_PALETTES)[number]
}) {
  const isSelfActive = isPathActive(pathname, item.to)

  return (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton
        isActive={isSelfActive}
        tooltip={item.title}
        render={<Link to={item.to as any} />}
        title={item.title}
        className={cn(
          "group relative h-10 rounded-xl px-2.5 text-[13px] font-medium transition-all duration-200 hover:translate-x-0.5",
          isSelfActive
            ? cn(
                theme.pillActive,
                "font-semibold shadow-xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full",
                theme.indicator,
              )
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
        )}
      >
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
            isSelfActive ? theme.iconBgActive : theme.iconBg,
          )}
        >
          <item.icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isSelfActive ? theme.iconActive : theme.icon,
            )}
          />
        </div>
        <span className="truncate font-medium">{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavFlyoutItem({
  item,
  pathname,
  theme,
}: {
  item: NavItem
  pathname: string
  theme: (typeof MODULE_PALETTES)[number]
}) {
  const isActive = isItemActive(pathname, item)

  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              className={cn(
                "group relative h-10 rounded-xl transition-all duration-200",
                isActive
                  ? cn(
                      theme.pillActive,
                      "font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full",
                      theme.indicator,
                    )
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
              )}
            />
          }
        >
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
              isActive ? theme.iconBgActive : theme.iconBg,
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                isActive ? theme.iconActive : theme.icon,
              )}
            />
          </div>
          <span className="truncate">{item.title}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="min-w-64 rounded-2xl p-2 shadow-2xl border-border/60 bg-popover/95 backdrop-blur-md"
        >
          <DropdownMenuLabel className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-foreground">
            <div
              className={cn(
                "flex size-5 items-center justify-center rounded-md",
                theme.iconBg,
              )}
            >
              <item.icon className={cn("size-3.5", theme.icon)} />
            </div>
            <span>{item.title}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />
          {item.children?.map((child, childIdx) => {
            if ("items" in child) {
              return (
                <div key={child.title || childIdx} className="pt-1.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <span
                      className={cn("size-1.5 rounded-full", theme.indicator)}
                    />
                    <span>{child.title}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {child.items.map((subItem) => (
                      <FlyoutSubItemLink
                        key={subItem.to}
                        subItem={subItem}
                        pathname={pathname}
                      />
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <FlyoutSubItemLink
                key={child.to}
                subItem={child}
                pathname={pathname}
              />
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function FlyoutSubItemLink({
  subItem,
  pathname,
}: {
  subItem: NavLeaf
  pathname: string
}) {
  const isSubActive = isPathActive(pathname, subItem.to)

  return (
    <DropdownMenuItem
      render={<Link to={subItem.to as any} />}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-all duration-150",
        isSubActive
          ? "bg-primary/10 text-primary font-semibold shadow-2xs"
          : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
      )}
    >
      <subItem.icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isSubActive ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="truncate">{subItem.title}</span>
    </DropdownMenuItem>
  )
}

function NavAccordionItem({
  item,
  pathname,
  theme,
  isOpen,
  onToggle,
}: {
  item: NavItem
  pathname: string
  theme: (typeof MODULE_PALETTES)[number]
  isOpen: boolean
  onToggle: () => void
}) {
  const isActive = isItemActive(pathname, item)

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.title}
        onClick={onToggle}
        title={item.title}
        className={cn(
          "group relative h-10 rounded-xl px-2.5 text-[13px] font-medium transition-all duration-200 hover:translate-x-0.5",
          isActive && !isOpen
            ? cn(
                theme.pillActive,
                "font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full",
                theme.indicator,
              )
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
        )}
      >
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
            isActive ? theme.iconBgActive : theme.iconBg,
          )}
        >
          <item.icon
            className={cn(
              "size-4 shrink-0 transition-colors",
              isActive ? theme.iconActive : theme.icon,
            )}
          />
        </div>
        <span className="flex-1 text-left font-medium tracking-tight truncate">
          {item.title}
        </span>
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground/70 transition-transform duration-200 shrink-0",
            isOpen && "rotate-90 text-foreground",
          )}
        />
      </SidebarMenuButton>

      {isOpen && (
        <SidebarMenuSub className="my-1 ml-3 border-l-2 border-border/60 pl-2 gap-0.5">
          {item.children?.map((child, childIdx) => {
            if ("items" in child) {
              return (
                <AccordionSubGroup
                  key={child.title || childIdx}
                  group={child}
                  pathname={pathname}
                  theme={theme}
                />
              )
            }

            return (
              <AccordionSubItemLink
                key={child.to}
                subItem={child}
                pathname={pathname}
              />
            )
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

function AccordionSubGroup({
  group,
  pathname,
  theme,
}: {
  group: NavSubGroup
  pathname: string
  theme: (typeof MODULE_PALETTES)[number]
}) {
  return (
    <div className="pt-2 pb-0.5 first:pt-1">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none">
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0",
            theme.indicator,
          )}
        />
        <span className="truncate">{group.title}</span>
      </div>
      <div className="flex flex-col gap-0.5 mt-0.5">
        {group.items.map((subItem) => (
          <AccordionSubItemLink
            key={subItem.to}
            subItem={subItem}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  )
}

function AccordionSubItemLink({
  subItem,
  pathname,
}: {
  subItem: NavLeaf
  pathname: string
}) {
  const isSubActive = isPathActive(pathname, subItem.to)

  return (
    <SidebarMenuSubItem key={subItem.to}>
      <SidebarMenuSubButton
        isActive={isSubActive}
        render={<Link to={subItem.to as any} />}
        title={subItem.title}
        className={cn(
          "relative min-h-8.5 h-auto py-1.5 rounded-lg px-2 text-[12.5px] font-medium transition-all duration-150 hover:translate-x-0.5",
          isSubActive
            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-2xs before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full before:bg-primary"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
        )}
      >
        <subItem.icon
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            isSubActive ? "text-primary" : "text-muted-foreground/80",
          )}
        />
        <span className="truncate leading-snug">{subItem.title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
