import type { PropsWithChildren } from "react"

import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/ui/sidebar"
import { TooltipProvider } from "@/shared/components/ui/tooltip"

import { AppHeader } from "./AppHeader"
import { AppSidebar } from "./AppSidebar"

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-svh w-full overflow-hidden bg-background md:bg-sidebar/50">
          <AppSidebar variant="inset" />
          <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background md:my-1.5 md:rounded-l-2xl md:border-l md:border-t md:border-b md:border-border/50 md:shadow-sm">
            <AppHeader />
            <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-2.5 sm:p-3 md:p-4">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
