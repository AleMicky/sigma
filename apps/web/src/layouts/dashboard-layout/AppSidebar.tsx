import { useEffect, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import logoEndeCorani from "@/assets/logo-ende-corani.png"
import {
  appConfig,
  findActiveNavItem,
  isPathActive,
  navItems,
  type NavItem,
} from "@/app/config"
import { Button } from "@/shared/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar"

import { UserMenu } from "./UserMenu"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { setOpen, state } = useSidebar()
  const [activeGroup, setActiveGroup] = useState<NavItem | null>(() =>
    findActiveNavItem(pathname),
  )

  useEffect(() => {
    setActiveGroup(findActiveNavItem(pathname))
  }, [pathname])

  function openGroup(item: NavItem) {
    setActiveGroup(item)
    if (state === "collapsed") {
      setOpen(true)
    }
  }

  function goBackToMain() {
    setActiveGroup(null)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-sidebar" {...props}>
      <SidebarHeader className="gap-3 px-3 pt-3">
        <div className="flex items-center gap-2">
          <SidebarMenuButton
            size="lg"
            render={<Link to="/" />}
            tooltip={appConfig.name}
            className="min-w-0 flex-1 gap-3 data-[size=lg]:h-11 data-[size=lg]:px-2 group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10 dark:ring-white/20">
              <img
                src={logoEndeCorani}
                alt="ENDE Corani"
                className="size-full object-contain"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-bold tracking-tight text-foreground">
                {appConfig.shortName}
              </span>
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                ENDE Corani S.A.
              </span>
            </div>
          </SidebarMenuButton>
        </div>

        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            placeholder="Buscar en el sistema..."
            className="h-8.5 rounded-lg border-border/50 bg-muted/30 pl-8 pr-12 shadow-none transition-colors focus-visible:bg-background"
            readOnly
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground/80 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {activeGroup?.children ? (
              <SubMenu
                group={activeGroup}
                pathname={pathname}
                onBack={goBackToMain}
              />
            ) : (
              <MainMenu
                pathname={pathname}
                onOpenGroup={openGroup}
              />
            )}
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

function MainMenu({
  pathname,
  onOpenGroup,
}: {
  pathname: string
  onOpenGroup: (item: NavItem) => void
}) {
  return (
    <SidebarMenu className="gap-0.5">
      {navItems.map((item) => {
        const hasChildren = Boolean(item.children?.length)
        const isActive = hasChildren
          ? item.children!.some((child) => isPathActive(pathname, child.to)) ||
          isPathActive(pathname, item.to)
          : isPathActive(pathname, item.to)

        if (hasChildren) {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={`${item.title} — ver opciones`}
                className="h-9 rounded-lg"
                onClick={() => onOpenGroup(item)}
              >
                <item.icon />
                <span>{item.title}</span>
                <ChevronRight className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        return (
          <SidebarMenuItem key={item.to}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              render={<Link to={item.to as any} />}
              className="h-9 rounded-lg"
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function SubMenu({
  group,
  pathname,
  onBack,
}: {
  group: NavItem
  pathname: string
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 flex items-center gap-1 group-data-[collapsible=icon]:justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 px-2 text-muted-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={onBack}
        >
          <ChevronLeft className="size-4" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            Menú principal
          </span>
        </Button>
      </div>

      <div className="mb-1 px-2 group-data-[collapsible=icon]:hidden">
        <p className="truncate text-xs font-medium text-muted-foreground">
          {group.title}
        </p>
      </div>

      <SidebarMenu className="gap-0.5">
        {group.children?.map((child) => {
          const isActive = isPathActive(pathname, child.to)

          return (
            <SidebarMenuItem key={child.to}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={child.title}
                render={<Link to={child.to as any} />}
                className="h-9 rounded-lg"
              >
                <child.icon />
                <span>{child.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </div>
  )
}
