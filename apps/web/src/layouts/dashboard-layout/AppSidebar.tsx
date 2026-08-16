import { useEffect, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, Search, Sparkles } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import {
  appConfig,
  isPathActive,
  navItems,
} from "@/app/config"
import { Button } from "@/shared/components/ui/button"
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

// Module-specific theme styles for vibrant modern UX/UI
const MODULE_THEMES: Record<
  string,
  {
    iconColor: string
    activeIconColor: string
    iconBg: string
    activeIconBg: string
    activePill: string
    indicatorColor: string
  }
> = {
  Inicio: {
    iconColor: "text-sky-500 dark:text-sky-400",
    activeIconColor: "text-sky-600 dark:text-sky-300",
    iconBg: "bg-sky-500/10 group-hover:bg-sky-500/20",
    activeIconBg: "bg-sky-500/20 shadow-xs",
    activePill: "bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15",
    indicatorColor: "bg-sky-500",
  },
  Organización: {
    iconColor: "text-blue-500 dark:text-blue-400",
    activeIconColor: "text-blue-600 dark:text-blue-300",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    activeIconBg: "bg-blue-500/20 shadow-xs",
    activePill: "bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15",
    indicatorColor: "bg-blue-500",
  },
  Activos: {
    iconColor: "text-amber-500 dark:text-amber-400",
    activeIconColor: "text-amber-600 dark:text-amber-300",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    activeIconBg: "bg-amber-500/20 shadow-xs",
    activePill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15",
    indicatorColor: "bg-amber-500",
  },
  Inventarios: {
    iconColor: "text-emerald-500 dark:text-emerald-400",
    activeIconColor: "text-emerald-600 dark:text-emerald-300",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    activeIconBg: "bg-emerald-500/20 shadow-xs",
    activePill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15",
    indicatorColor: "bg-emerald-500",
  },
  Parámetros: {
    iconColor: "text-violet-500 dark:text-violet-400",
    activeIconColor: "text-violet-600 dark:text-violet-300",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
    activeIconBg: "bg-violet-500/20 shadow-xs",
    activePill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15",
    indicatorColor: "bg-violet-500",
  },
}

const DEFAULT_THEME = {
  iconColor: "text-primary",
  activeIconColor: "text-primary",
  iconBg: "bg-primary/10",
  activeIconBg: "bg-primary/20",
  activePill: "bg-primary/10 text-primary",
  indicatorColor: "bg-primary",
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/70 bg-sidebar/95 backdrop-blur-md transition-all duration-300"
      {...props}
    >
      <SidebarHeader className="gap-3 px-3 pt-3.5 pb-2 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
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
                <span className="truncate text-sm font-bold tracking-tight text-foreground font-heading">
                  {appConfig.shortName}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                  <Sparkles className="size-2.5" />
                  PRO
                </span>
              </div>
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                ENDE Corani S.A.
              </span>
            </div>
          </Link>
        </div>

        <SidebarSearch />
      </SidebarHeader>

      <SidebarContent className="px-2.5">
        <SidebarGroup className="px-0 py-2">
          <SidebarGroupLabel className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/75 group-data-[collapsible=icon]:hidden px-2 mb-1.5">
            <span>Módulos del Sistema</span>
            <span className="size-1.5 rounded-full bg-primary/60 animate-pulse" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationMenu />
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

function SidebarSearch() {
  const { state, setOpen } = useSidebar()

  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground mx-auto flex items-center justify-center transition-colors"
              onClick={() => setOpen(true)}
            />
          }
        >
          <Search className="size-4 text-primary" />
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          Buscar en el sistema (⌘K)
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <SidebarInput
        placeholder="Buscar módulo o registro…"
        className="h-8.5 rounded-lg border-border/50 bg-muted/40 pl-8 pr-12 text-xs shadow-none transition-all hover:border-border/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50"
        readOnly
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
        ⌘K
      </kbd>
    </div>
  )
}

function isItemActive(pathname: string, item: (typeof navItems)[number]) {
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

function NavigationMenu() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { state } = useSidebar()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navItems.forEach((item) => {
      if (item.children && isItemActive(pathname, item)) {
        initial[item.title] = true
      }
    })
    return initial
  })

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children && isItemActive(pathname, item)) {
        setOpenGroups((prev) => ({ ...prev, [item.title]: true }))
      }
    })
  }, [pathname])

  function toggleGroup(title: string) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <SidebarMenu className="gap-1.5">
      {navItems.map((item) => {
        const hasChildren = Boolean(item.children?.length)
        const isActive = isItemActive(pathname, item)
        const isSelfActive = !hasChildren && isPathActive(pathname, item.to)
        const isOpen = Boolean(openGroups[item.title])
        const theme = MODULE_THEMES[item.title] || DEFAULT_THEME

        // Single item without sub-items (e.g. Inicio)
        if (!hasChildren) {
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
                        theme.activePill,
                        "font-semibold shadow-xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full",
                        theme.indicatorColor,
                      )
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
                    isSelfActive ? theme.activeIconBg : theme.iconBg,
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isSelfActive ? theme.activeIconColor : theme.iconColor,
                    )}
                  />
                </div>
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        // Item with children in Collapsed Icon mode: Flyout Dropdown Menu
        if (state === "collapsed") {
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
                              theme.activePill,
                              "font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full",
                              theme.indicatorColor,
                            )
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
                      )}
                    />
                  }
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
                      isActive ? theme.activeIconBg : theme.iconBg,
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? theme.activeIconColor : theme.iconColor,
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
                      <item.icon className={cn("size-3.5", theme.iconColor)} />
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
                              className={cn(
                                "size-1.5 rounded-full",
                                theme.indicatorColor,
                              )}
                            />
                            <span>{child.title}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {child.items.map((subItem) => {
                              const isSubActive = isPathActive(
                                pathname,
                                subItem.to,
                              )
                              return (
                                <DropdownMenuItem
                                  key={subItem.to}
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
                                      isSubActive
                                        ? "text-primary"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                  <span className="truncate">
                                    {subItem.title}
                                  </span>
                                </DropdownMenuItem>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }

                    const isSubActive = isPathActive(pathname, child.to)
                    return (
                      <DropdownMenuItem
                        key={child.to}
                        render={<Link to={child.to as any} />}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-all duration-150",
                          isSubActive
                            ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                            : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
                        )}
                      >
                        <child.icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isSubActive
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="truncate">{child.title}</span>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        }

        // Item with children in Expanded mode: Accordion Collapsible
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              onClick={() => toggleGroup(item.title)}
              title={item.title}
              className={cn(
                "group relative h-10 rounded-xl px-2.5 text-[13px] font-medium transition-all duration-200 hover:translate-x-0.5",
                isActive && !isOpen
                  ? cn(
                      theme.activePill,
                      "font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1.5 before:rounded-r-full",
                      theme.indicatorColor,
                    )
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
                  isActive ? theme.activeIconBg : theme.iconBg,
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? theme.activeIconColor : theme.iconColor,
                  )}
                />
              </div>
              <span className="flex-1 text-left font-medium tracking-tight truncate">
                {item.title}
              </span>
              <ChevronRight
                className={cn(
                  "size-4 text-muted-foreground/70 transition-transform duration-200",
                  isOpen && "rotate-90 text-foreground",
                )}
              />
            </SidebarMenuButton>

            {isOpen && (
              <SidebarMenuSub className="my-1 ml-3.5 border-l-2 border-border/60 pl-2.5 gap-1">
                {item.children?.map((child, childIdx) => {
                  if ("items" in child) {
                    return (
                      <div
                        key={child.title || childIdx}
                        className="pt-2 first:pt-1"
                      >
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none">
                          <span
                            className={cn(
                              "size-1.5 rounded-full shrink-0",
                              theme.indicatorColor,
                            )}
                          />
                          <span className="truncate">{child.title}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {child.items.map((subItem) => {
                            const isSubActive = isPathActive(
                              pathname,
                              subItem.to,
                            )
                            return (
                              <SidebarMenuSubItem key={subItem.to}>
                                <SidebarMenuSubButton
                                  isActive={isSubActive}
                                  render={<Link to={subItem.to as any} />}
                                  title={subItem.title}
                                  className={cn(
                                    "relative h-8.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 hover:translate-x-0.5",
                                    isSubActive
                                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-2xs before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full before:bg-primary"
                                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                                  )}
                                >
                                  <subItem.icon
                                    className={cn(
                                      "size-3.5 shrink-0 transition-colors",
                                      isSubActive
                                        ? "text-primary"
                                        : "text-muted-foreground/80",
                                    )}
                                  />
                                  <span className="truncate">
                                    {subItem.title}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  const isSubActive = isPathActive(pathname, child.to)
                  return (
                    <SidebarMenuSubItem key={child.to}>
                      <SidebarMenuSubButton
                        isActive={isSubActive}
                        render={<Link to={child.to as any} />}
                        title={child.title}
                        className={cn(
                          "relative h-8.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 hover:translate-x-0.5",
                          isSubActive
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-2xs before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full before:bg-primary"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                        )}
                      >
                        <child.icon
                          className={cn(
                            "size-3.5 shrink-0 transition-colors",
                            isSubActive
                              ? "text-primary"
                              : "text-muted-foreground/80",
                          )}
                        />
                        <span className="truncate">{child.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
