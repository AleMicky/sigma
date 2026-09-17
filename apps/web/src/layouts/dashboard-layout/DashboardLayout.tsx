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
        <div className="relative flex h-svh w-full overflow-hidden bg-background md:bg-sidebar/40">
          {/* Ambient Glows de fondo para profundidad visual */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl opacity-70 dark:opacity-30 transition-opacity"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed -bottom-32 -left-32 size-96 rounded-full bg-accent/20 blur-3xl opacity-60 dark:opacity-20 transition-opacity"
          />

          <AppSidebar variant="inset" />

          <SidebarInset className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background/95 backdrop-blur-sm md:my-1.5 md:mr-1.5 md:rounded-2xl md:border md:border-border/60 md:shadow-lg md:shadow-black/5 dark:md:shadow-2xl dark:md:shadow-black/40 ring-1 ring-black/5 dark:ring-white/5 transition-all">
            <AppHeader />
            <NavigationTabs />
            <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 lg:p-6 transition-all">
              <PageTransition>{children}</PageTransition>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

