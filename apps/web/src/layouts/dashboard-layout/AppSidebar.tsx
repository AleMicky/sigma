import { useEffect, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, Search } from "lucide-react"

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

import { UserMenu } from "./UserMenu"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 bg-sidebar/95 backdrop-blur-sm transition-all"
      {...props}
    >
      <SidebarHeader className="gap-3 px-3 pt-3.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-sidebar-accent/70 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
          >
            <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-2xs ring-1 ring-black/10 dark:bg-white/90 dark:ring-white/20">
              <img
                src={logoEndeCorani}
                alt="ENDE Corani"
                className="size-full object-contain"
              />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-bold tracking-tight text-foreground font-heading">
                {appConfig.shortName}
              </span>
              <span className="truncate text-[11px] font-medium text-muted-foreground/90">
                ENDE Corani S.A.
              </span>
            </div>
          </Link>
        </div>

        <SidebarSearch />
      </SidebarHeader>

      <SidebarContent className="px-2.5">
        <SidebarGroup className="px-0 py-1">
          <SidebarGroupLabel className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/75 group-data-[collapsible=icon]:hidden px-2 mb-1">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3 pt-2 border-t border-border/40">
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
              className="size-8.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground mx-auto flex items-center justify-center"
              onClick={() => setOpen(true)}
            />
          }
        >
          <Search className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          Buscar en el sistema (⌘K)
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative group-data-[collapsible=icon]:hidden">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <SidebarInput
        placeholder="Buscar en el sistema..."
        className="h-8.5 rounded-lg border-border/50 bg-muted/40 pl-8 pr-12 text-xs shadow-none transition-all hover:border-border/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
        readOnly
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border/60 bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground/80 shadow-2xs">
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

  // Track expanded groups in expanded mode
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    navItems.forEach((item) => {
      if (item.children && isItemActive(pathname, item)) {
        initial[item.title] = true
      }
    })
    return initial
  })

  // Auto expand active parent group on navigation
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
    <SidebarMenu className="gap-1">
      {navItems.map((item) => {
        const hasChildren = Boolean(item.children?.length)
        const isActive = isItemActive(pathname, item)
        const isSelfActive = !hasChildren && isPathActive(pathname, item.to)
        const isOpen = Boolean(openGroups[item.title])

        // Single item without sub-items
        if (!hasChildren) {
          return (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                isActive={isSelfActive}
                tooltip={item.title}
                render={<Link to={item.to as any} />}
                title={item.title}
                className={`relative h-9.5 rounded-lg px-2.5 text-[13px] font-medium transition-all ${
                  isSelfActive
                    ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-primary shadow-2xs"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className={`size-4.5 shrink-0 ${isSelfActive ? "text-primary" : "text-muted-foreground"}`} />
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
                      className={`relative h-9.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                      }`}
                    />
                  }
                >
                  <item.icon className={`size-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{item.title}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="min-w-60 rounded-xl p-1.5 shadow-xl border-border/60 bg-popover/95 backdrop-blur-sm"
                >
                  <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-bold text-foreground">
                    {item.title}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  {item.children?.map((child, childIdx) => {
                    if ("items" in child) {
                      return (
                        <div key={child.title || childIdx} className="pt-1">
                          <DropdownMenuSeparator className="my-1 opacity-60" />
                          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                            <span className="size-1 rounded-full bg-primary/70" />
                            <span>{child.title}</span>
                          </div>
                          {child.items.map((subItem) => {
                            const isSubActive = isPathActive(pathname, subItem.to)
                            return (
                              <DropdownMenuItem
                                key={subItem.to}
                                render={<Link to={subItem.to as any} />}
                                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                                  isSubActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
                                }`}
                              >
                                <subItem.icon className={`size-4 shrink-0 ${isSubActive ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="truncate">{subItem.title}</span>
                              </DropdownMenuItem>
                            )
                          })}
                        </div>
                      )
                    }

                    const isSubActive = isPathActive(pathname, child.to)
                    return (
                      <DropdownMenuItem
                        key={child.to}
                        render={<Link to={child.to as any} />}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                          isSubActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground"
                        }`}
                      >
                        <child.icon className={`size-4 shrink-0 ${isSubActive ? "text-primary" : "text-muted-foreground"}`} />
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
              className={`relative h-9.5 rounded-lg px-2.5 text-[13px] font-medium transition-all ${
                isActive && !isOpen
                  ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className={`size-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className="flex-1 text-left truncate">{item.title}</span>
              <ChevronRight
                className={`size-4 text-muted-foreground/70 transition-transform duration-200 ${
                  isOpen ? "rotate-90 text-foreground" : ""
                }`}
              />
            </SidebarMenuButton>

            {isOpen && (
              <SidebarMenuSub className="my-1 ml-2.5 border-l border-border/70 pl-2 gap-0.5">
                {item.children?.map((child, childIdx) => {
                  if ("items" in child) {
                    return (
                      <div key={child.title || childIdx} className="pt-2 first:pt-0.5">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/85 select-none">
                          <span className="size-1 rounded-full bg-primary/70 shrink-0" />
                          <span className="truncate">{child.title}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {child.items.map((subItem) => {
                            const isSubActive = isPathActive(pathname, subItem.to)
                            return (
                              <SidebarMenuSubItem key={subItem.to}>
                                <SidebarMenuSubButton
                                  isActive={isSubActive}
                                  render={<Link to={subItem.to as any} />}
                                  title={subItem.title}
                                  className={`relative h-8.5 rounded-lg px-2.5 text-xs font-medium transition-all ${
                                    isSubActive
                                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full before:bg-primary"
                                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                                  }`}
                                >
                                  <subItem.icon className={`size-3.5 shrink-0 ${isSubActive ? "text-primary" : "text-muted-foreground"}`} />
                                  <span className="truncate">{subItem.title}</span>
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
                        className={`relative h-8.5 rounded-lg px-2.5 text-xs font-medium transition-all ${
                          isSubActive
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary before:absolute before:-left-2.5 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-1 before:rounded-r-full before:bg-primary"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                        }`}
                      >
                        <child.icon className={`size-3.5 shrink-0 ${isSubActive ? "text-primary" : "text-muted-foreground"}`} />
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
