import { useEffect, useState, type ComponentProps } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react"

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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-3 px-3 pt-3">
        <div className="flex items-center gap-1">
          <SidebarMenuButton
            size="lg"
            render={<Link to="/" />}
            tooltip={appConfig.shortName}
            className="min-w-0 flex-1 gap-2 data-[size=lg]:h-9 data-[size=lg]:px-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-semibold text-background">
              {appConfig.shortName.charAt(0)}
            </span>
            <span className="truncate text-sm font-medium">
              {appConfig.shortName}
            </span>
            <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
          <SidebarTrigger className="size-8 shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>

        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            placeholder="Buscar..."
            className="h-9 rounded-lg border-transparent bg-background pl-8 pr-12 shadow-none"
            readOnly
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
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

      <SidebarFooter className="px-3 pb-3">
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
              render={<Link to={item.to} />}
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
                render={<Link to={child.to} />}
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
