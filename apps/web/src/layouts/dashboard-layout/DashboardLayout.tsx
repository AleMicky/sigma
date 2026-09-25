import type { PropsWithChildren } from "react"

import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { TooltipProvider } from "@/shared/components/ui/tooltip"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"
import { NavigationTabs } from "./NavigationTabs"
import { PageTransition } from "./PageTransition"

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-svh w-full overflow-hidden bg-background select-none">
          <AppSidebar />

          <SidebarInset className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/10 dark:bg-zinc-950/20">
            <AppHeader />
            <NavigationTabs />
            <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 transition-all">
              <PageTransition>{children}</PageTransition>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

