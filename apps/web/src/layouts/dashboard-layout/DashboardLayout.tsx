import type { PropsWithChildren } from "react"
import { useRouterState } from "@tanstack/react-router"

import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import { useAllowedNavItems } from "@/shared/hooks/use-allowed-nav-items"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"
import { NavigationTabs, resolveTabInfo } from "./NavigationTabs"
import { PageTransition } from "./PageTransition"

export function DashboardLayout({ children }: PropsWithChildren) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { navItems } = useAllowedNavItems()

  // Resolver color del menú o módulo activo
  const { color: activeColor } = resolveTabInfo(pathname, navItems)
  const themeColor = activeColor || "#3B82F6"

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div
          className="flex h-svh w-full overflow-hidden bg-background select-none"
          style={{ "--active-color": themeColor } as React.CSSProperties}
        >
          <AppSidebar />

          <SidebarInset className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <AppHeader />
            <NavigationTabs />

            <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 transition-all">
              <PageTransition>{children}</PageTransition>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
